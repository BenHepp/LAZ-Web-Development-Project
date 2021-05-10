<?php
namespace LAZ\objects\library\Router;


use LAZ\objects\library\HttpMethod;

abstract class Route {
    private $path;
    private $method;
    private $middleware;
    private $tokens;
    private $parent;

    public function __construct($path, $method = HttpMethod::GET, $tokens = null, $middleware = null) {
        $this->method = $method;
        $this->path = $path;
        $this->tokens = $tokens ?: [];
        $this->middleware = $middleware ?: [];
    }

    public function getMethod() {
        return $this->method;
    }

    public function getPath() {
        return $this->path;
    }

    public function getTokens() {
        return $this->tokens;
    }

    public function getParent() {
        return $this->parent;
    }

    public function setParent($parent) {
        $this->parent = $parent;
    }

    public function match(RouteRequest $request) {
        if( $this->matchMethods($request) ) {
            $path = $request->getPath();
            $pathPattern = $this->getPattern();
            if( preg_match($pathPattern, $path, $matches) ) {
                $attributes = [];
                foreach($matches as $key => $value) {
                    if( is_string($key) ) {
                        $attributes[$key] = rawurldecode($value);
                    }
                }

                return $request
                    ->withoutPrefix($matches[0])
                    ->withAttributes($attributes)
                    ->withMiddleware($this->middleware);
            }
        }

        return false;
    }

    public abstract function map();

    protected function matchMethods(RouteRequest $request) {
        $method = $this->getMethod();
        return $method == '*' || $method == $request->getMethod();
    }

    protected function getPattern() {
        $path = $this->getPath();
        $tokens = $this->getTokens();
        foreach ($tokens as $attribute => $regexSnippet) {
            $path = str_replace("{{$attribute}}", "(?P<$attribute>$regexSnippet)", $path);
        }

        return '#^' . $path . '#';
    }
}