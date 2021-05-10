<?php
namespace LAZ\objects\library\Router;

use LAZ\objects\workflow\DI\Container;

abstract class ContainerRouter extends SimpleRouter {

    private $container;
    private $defaultComponent;

    public function __construct(Container $container, $defaultComponent, $path='', $tokens=null, $middleware=null) {
        parent::__construct($path, $tokens, $this->findMiddlewareInstances($container, $middleware));
        $this->container = $container;
        $this->defaultComponent = $defaultComponent;
    }

    protected function bind($path, $method, $locatorExpression, $tokens = null) {
        list($component, $functionExpression) = $this->parseFunctionExpression($locatorExpression);
        $dispatcher = new ContainerRequestDispatcher($this->container, $component, $functionExpression);
        $this->addRoute(new Endpoint($path, $method, $dispatcher, $tokens));
    }

    private function parseFunctionExpression($functionExpr) {
        $result = preg_match('/^(.+)@(.+)$/', $functionExpr, $matches);
        if($result) {
            return array_slice($matches, 1, 2);
        }

        return [ $this->defaultComponent, $functionExpr ];
    }

    protected static function findMiddlewareInstances(Container $container, $middleware = null){
        if(!$middleware || !is_array($middleware)){
            return null;
        }
        return array_map(function($middlewareItem) use ($container) {
            return is_object($middlewareItem) ? $middlewareItem : $container->get($middlewareItem);
        }, $middleware);
    }
}