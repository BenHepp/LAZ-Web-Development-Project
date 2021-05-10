<?php namespace LAZ\Library\Router;
namespace LAZ\objects\library\Router;

use LAZ\objects\api\Middleware;
use Psr\Http\Message\ServerRequestInterface;

class RouteRequest {

    /** @var ServerRequestInterface  */
    private $rawRequest;
    /** @var string */
    private $localPath = '';
    /** @var  Middleware[] */
    private $middleware = [];

    private $handler;

    public function __construct(ServerRequestInterface $rawRequest) {
        $this->rawRequest = $rawRequest;
        $this->localPath = $rawRequest->getUri()->getPath();
    }

    public function getRawRequest() {
        return $this->rawRequest;
    }

    public function getMethod() {
        return $this->rawRequest->getMethod();
    }

    public function getPath() {
        return $this->localPath;
    }

    public function getMiddleware() {
        return $this->middleware;
    }

    public function getHandler() {
        return $this->handler;
    }

    public function withHandler($handler) {
        $newRequest = clone $this;
        $newRequest->handler = $handler;

        return $newRequest;
    }

    public function withoutPrefix($path) {
        $pathLength = strlen($path);
        if( $pathLength > 0 && strncmp($path, $this->localPath, $pathLength) === 0 ) {
            $newRequest = clone $this;
            $newRequest->localPath = substr($this->localPath, $pathLength);

            return $newRequest;
        }

        return $this;
    }

    public function withAttributes($attributes) {
        if( empty($attributes) ) return $this;

        $rawRequest = $this->rawRequest;
        foreach($attributes as $key => $value) {
            $rawRequest = $rawRequest->withAttribute($key, $value);
        }

        $newRequest = clone $this;
        $newRequest->rawRequest = $rawRequest;

        return $newRequest;
    }

    public function withMiddleware($middleware) {
        if( empty($middleware) ) return $this;

        $newRequest = clone $this;
        $newRequest->middleware = array_merge($this->middleware, $middleware);

        return $newRequest;
    }
}