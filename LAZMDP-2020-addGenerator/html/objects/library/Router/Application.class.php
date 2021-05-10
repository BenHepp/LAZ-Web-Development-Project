<?php
namespace LAZ\objects\library\Router;

use \Exception;
use \InvalidArgumentException;
use LAZ\objects\library\Router\Exception\UnauthorizedException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use LAZ\objects\tools\Logger;
use LAZ\objects\library\PHPUtil;
use LAZ\objects\library\HttpStatus;
use LAZ\objects\library\AuthorizationException;
use LAZ\objects\library\Router\Exception\ServiceUnavailableException;
use LAZ\objects\library\Router\Exception\ResourceNotFoundException;
use LAZ\objects\library\Router\Exception\UnprocessableEntityException;
use LAZ\objects\library\Router\Exception\ForbiddenException;
use LAZ\objects\library\Router\Exception\ConflictException;
use LAZ\objects\library\Exception\DosValveException;
use LAZ\objects\library\Instance;
use Zend\Diactoros\Response;
use Zend\Diactoros\ServerRequestFactory;


class Application {

    private static $instance;

    /** @var Logger */
    private $logger;
    /** @var Route */
    private $rootRoute;

    public function shut_down_handler() {
        $error = error_get_last();
        $this->check_for_fatal_error($error);
    }

    private function check_for_fatal_error($error) {
        if($error !== NULL && in_array($error['type'], [E_ERROR, E_USER_ERROR, E_PARSE, E_COMPILE_ERROR, E_CORE_ERROR])){
            ob_clean();
            http_response_code(HttpStatus::INTERNAL_SERVER_ERROR);
            header('Content-Type: application/json');
            if (Instance::showDetailedErrors()) {
                echo json_encode($error);
            } else {
                echo '{"message": "PHP fatal error"}';
            }
            ob_end_flush();
        }
    }

    public static function api_error_handler($errno, $errstr, $errfile, $errline, $errcontext) {
        throw new \ErrorException($errstr, $errno);
    }

    public static function getInstance() {
        return self::$instance;
    }

    public function __construct(Logger $logger, Route $rootRoute) {
        $this->logger = $logger;
        $this->rootRoute = $rootRoute;

        if( !isset(self::$instance) ) {
            self::$instance = $this;
        } else {
            $class = self::class;
            throw new Exception("An instance of $class has already been instantiated!");
        }
    }

    public function run() {
        ini_set('html_errors', 0);
        ob_start();
        register_shutdown_function([$this, 'shut_down_handler']);
        //TODO Find all APIs that have scalar data in the post body and refactor them to post object or array, then
        //retire the LazServerRequest class
        $request = new LazServerRequest(ServerRequestFactory::fromGlobals($_SERVER, $_GET, $_POST, $_COOKIE, $_FILES));
        $response = new Response();
        $response = $response->withHeader('Content-Type', 'application/json; charset=utf-8');

        try {
            if( empty($_POST) ) {
                $body = $request->getBody()->__toString();
                $jsonBody = PHPUtil::json_decode_windows1252($body);
                if( !is_null($jsonBody) ) {
                    $request = $request->withParsedBody($jsonBody);
                }
            }

            error_reporting(error_reporting() & ~E_WARNING);
            set_error_handler('self::api_error_handler');

            $result = $this->getRequestResult($request);
        } catch (\Exception $e) {
            //Last chance exception (shouldn't occur - controller exceptions should be caught in getRequestResult)
            $result = $this->handleException($request, HttpStatus::INTERNAL_SERVER_ERROR, $e, 'Internal server error');
        }

        $response = $response->withStatus( $result->getStatus() );
        $resultData = $this->encodeResult($result->getResult(), $request);
        $response->getBody()->write($resultData);
        $this->emit($response);
        ob_end_flush();
    }

    public function getRequestResult(ServerRequestInterface $request) {
        try {
            $result = $this->handleRequest($request);
            if( !($result instanceof RequestResult) ) {
                $result = new RequestResult(HttpStatus::OK, $result);
            }
        } catch (UnauthorizedException $e) {
            $result = $this->handleException($request, HttpStatus::UNAUTHORIZED, $e, 'Authentication Required');
        } catch (AuthorizationException $e) {
            $result = $this->handleException($request, HttpStatus::FORBIDDEN, $e, 'Access is forbidden');
        } catch (ForbiddenException $e) {
            $result = $this->handleException($request, HttpStatus::FORBIDDEN, $e, 'Access is forbidden');
        } catch (\DomainException $e) {
            $result = $this->handleException($request, HttpStatus::BAD_REQUEST, $e, $e->getMessage() ?: 'Bad request');
        } catch (InvalidArgumentException $e) {
            $result = $this->handleException($request, HttpStatus::BAD_REQUEST, $e, $e->getMessage() ?: 'Bad request');
        } catch (UnprocessableEntityException $e) {
            $result = $this->handleException($request, HttpStatus::UNPROCESSABLE_ENTITY, $e, $e->getMessage() ?: 'Unprocessable entity');
        } catch (ServiceUnavailableException $e) {
            $result = $this->handleException($request, HttpStatus::SERVICE_UNAVAILABLE, $e, 'Service unavailable.  Try again later.');
        } catch (ResourceNotFoundException $e) {
            $result = $this->handleException($request, HttpStatus::NOT_FOUND, $e, 'Resource not found');
        } catch (ConflictException $e) {
            $result = $this->handleException($request, HttpStatus::CONFLICT, $e, $e->getMessage() ?: 'Duplicate resource');
        } catch (DosValveException $e) {
            $result = $this->handleException($request, HttpStatus::FORBIDDEN, $e, 'Too many requests.  Access is forbidden');
        } catch (\Exception $e) {
            $result = $this->handleException($request, HttpStatus::INTERNAL_SERVER_ERROR, $e, 'Internal server error');
        }

        return $result;
    }

    protected function handleRequest(ServerRequestInterface $request) {
        $routeRequest = new RouteRequest($request);
        $routeRequest = $this->rootRoute->match($routeRequest);
        if(!$routeRequest) {
            throw new ResourceNotFoundException('No matching route found');
        }

        $updatedRequest = $routeRequest->getRawRequest();
        foreach($routeRequest->getMiddleware() as $middleware) {
            $middleware->runBefore($updatedRequest);
        }

        return $routeRequest->getHandler()->dispatch($updatedRequest);
    }

    protected function emit(ResponseInterface $response) {
        $emitter = phpversion() == '7.2.10' ? new \Zend\HttpHandlerRunner\Emitter\SapiEmitter() : new \Zend\Diactoros\Response\SapiEmitter();
        $emitter->emit($response);
    }

    protected function handleException(ServerRequestInterface $request, $status, \Exception $e, $message) {
        $this->logException($e);
        if (Instance::showDetailedErrors() || $this->isDebugRequest($request)) {
            $result['message'] = $e->getMessage();
            $result['code'] = $e->getCode();
            $result['file'] = $e->getFile();
            $result['line'] = $e->getLine();
            //Trace info can cause out of memory conditions, only provide it if asked explicitly
            if ($this->isTraceRequest($request)) {
                $result['trace'] = $e->getTrace();
            }
        } else {
            $result = ['message' => $message];
        }
        return new RequestResult($status, $result);
    }

    private function logException(Exception $exception) {
        $this->logger->logError($exception->getMessage());
    }

    private function isDebugRequest(ServerRequestInterface $request) {
        $queryParams = $request->getQueryParams();
        return isset($queryParams['debug']);
    }

    private function isTraceRequest(ServerRequestInterface $request) {
        $queryParams = $request->getQueryParams();
        return isset($queryParams['trace']);
    }

    private function encodeResult($data, ServerRequestInterface $request){
        $jsonData = PHPUtil::json_encode_windows1252($data);
        if($jsonData === false && $data){
            $this->logger->logError("could not encode json result for request to {$request->getUri()}");
        }
        return $jsonData;
    }
}
