<?php
namespace LAZ\objects\library\Router;

abstract class Router extends Route {

    /** @var  Route[] */
    private $routes = [];
    /** @var bool */
    private $routesRegistered = false;

    public function __construct($path= '', $tokens = null, $middleware = null) {
        parent::__construct($path, '*', $tokens, $middleware);
    }

    public function match(RouteRequest $request) {
        $newRequest = parent::match($request);
        if($newRequest) {
            $this->ensureRoutes();
            return $this->matchSubroutes($newRequest);
        }

        return false;
    }

    public function map() {
        $this->ensureRoutes();

        $routeMap = array_map(function(Route $route) { return $route->map(); }, $this->routes);
        $routeMap = array_filter($routeMap);
        $routeMap = array_merge(...$routeMap);

        $routeMap = array_map(function($result) {
            $result['path'] = $this->getPath() . $result['path'];
            $result['tokens'] = array_merge( $this->getTokens(), $result['tokens']);
            return $result;
        }, $routeMap);

        return $routeMap;
    }

    public function addRoute(Route $route) {
        $this->routes[] = $route;
        $route->setParent($this);
    }

    protected abstract function registerRoutes();

    protected function ensureRoutes() {
        if(!$this->routesRegistered) {
            $this->registerRoutes();
            $this->routesRegistered = true;
        }
    }

    protected function matchSubroutes(RouteRequest $request) {
        foreach($this->routes as $route) {
            $newRequest = $route->match($request);
            if($newRequest) {
                return $newRequest;
            }
        }

        return false;
    }
}