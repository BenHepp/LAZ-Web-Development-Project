<?php
namespace LAZ\objects\library\Router;

use LAZ\objects\workflow\DI\Container;
use Psr\Http\Message\ServerRequestInterface;

class ContainerRequestDispatcher {

    private $container;
    private $component;
    private $method;

    public function __construct(Container $container, $component, $method) {
        $this->container = $container;
        $this->component = $component;
        $this->method = $method;
    }

    public function dispatch(ServerRequestInterface $request) {

        $instance = $this->container->get($this->component);
        $method = $this->method;
        $resource = $request->getParsedBody();
        if(!is_null($resource) && $instance instanceof Resource){
            $instance->setResource($resource);
        }
        // $resource param as second parameter to support existing code,
        // even though it is redundant with Resource interface
        return $instance->$method($request, $resource);
    }
}
