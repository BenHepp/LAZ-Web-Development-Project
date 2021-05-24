<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\ControllerRouter;

class HelloWorldApiRouter extends ControllerRouter {

    public function __construct() {
        parent::__construct(HelloWorldApiController::class, '/api');
    }

    protected function registerRoutes() {
        $this->get('/helloWorld', 'getHelloWorld');
    }

    //This overrides the ControllerRouters list of acceptable prefixes.  For a real site, you would add to the base classes prefixes
    // const PREFIXES = ['' => '/example/api'];
}