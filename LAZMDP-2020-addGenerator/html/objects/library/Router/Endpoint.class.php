<?php
namespace LAZ\objects\library\Router;

use LAZ\objects\library\HttpMethod;

class Endpoint extends Route {

    private $handler;

    public function __construct($path, $method, $handler, $tokens=null, $middleware=null) {
        parent::__construct($path, $method, $tokens, $middleware);
        $this->handler = $handler;
    }

    public function match(RouteRequest $request) {
        $newRequest = parent::match($request);
        if($newRequest) {
            return $newRequest->withHandler($this->handler);
        }

        return false;
    }

    public function map() {
        return [[
            'method' => $this->getMethod(),
            'path' => $this->getPath(),
            'tokens' => $this->getTokens(),
            'handler' => $this->handler->getDispatchDescriptor(),
            'router' => get_class($this->getParent() )
        ]];
    }

    protected function getPattern() {
        return substr(parent::getPattern(), 0, -1) . '$#';
    }
}