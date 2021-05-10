<?php
namespace LAZ\objects\library\Router;

use LAZ\objects\library\HttpMethod;

abstract class SimpleRouter extends Router {

    public function __construct($path, $tokens, $middleware) {
        parent::__construct($path, $tokens, $middleware);
    }

    protected abstract function bind($path, $method, $function, $tokens=null);

    protected function get($path, $function, $tokens=null) {
        $this->bind($path, HttpMethod::GET, $function, $tokens);
    }

    protected function post($path, $function, $tokens=null) {
        $this->bind($path, HttpMethod::POST, $function, $tokens);
    }

    protected function delete($path, $function, $tokens=null) {
        $this->bind($path, HttpMethod::DELETE, $function, $tokens);
    }

    protected function patch($path, $function, $tokens=null) {
        $this->bind($path, HttpMethod::PATCH, $function, $tokens);
    }

    protected function put($path, $function, $tokens=null) {
        $this->bind($path, HttpMethod::PUT, $function, $tokens);
    }

    protected function any($path, $function, $tokens=null) {
        $this->bind($path, '*', $function, $tokens);
    }
}
