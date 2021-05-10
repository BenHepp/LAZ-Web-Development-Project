<?php

namespace LAZ\objects\library\Router;

use Psr\Http\Message\ServerRequestInterface;

class ControllerRequestDispatcher {
    private $controller;
    private $method;

    public function __construct($controller, $method) {
        $this->controller = $controller;
        $this->method = $method;
    }

    private static function setResource($instance, ServerRequestInterface $request) {
        $resource = $request->getParsedBody();
        if (!is_null($resource)) {
            if ($instance instanceof Resource) {
                $instance->setResource($resource);
            }
        }
    }

    public function dispatch(ServerRequestInterface $request) {
        $class = $this->controller;
        $instance = new $class();
        self::setResource($instance, $request);
        $method = $this->method;
        return $instance->$method($request);
    }

    public function getDispatchDescriptor() {
        return $this->controller . '@' . $this->method;
    }
}
