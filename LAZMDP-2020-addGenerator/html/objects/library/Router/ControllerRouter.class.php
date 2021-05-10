<?php
namespace LAZ\objects\library\Router;


abstract class ControllerRouter extends SimpleRouter {

    private $controller;

    public function __construct($controller, $path='', $tokens=null, $middleware=null) {
        $this->controller = $controller;

        parent::__construct($path, $tokens, $middleware);
    }

    protected function bind($path, $method, $functionExpr, $tokens=null) {
        list($controller, $function) = $this->parseFunctionExpression($functionExpr);
        $this->addRoute(new Endpoint($path, $method, new ControllerRequestDispatcher($controller, $function), $tokens));
    }

    protected function parseFunctionExpression($functionExpr) {
        $result = preg_match('/^(.+)@(.+)$/', $functionExpr, $matches);
        return $result ? array_slice($matches, 1, 2) : [ $this->controller, $functionExpr ];
    }

}
