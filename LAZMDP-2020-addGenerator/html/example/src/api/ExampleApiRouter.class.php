<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\ControllerRouter;

class ExampleApiRouter extends ControllerRouter {

    public function __construct() {
        parent::__construct(ExampleApiController::class, '/api');
    }

    protected function registerRoutes() {
        $tokens = ['id' => '\d+'];

        //$this->get('/students', 'getAllStudents');
        //$this->get('/helloWorld', 'getHelloWorld');
        $this->post('/firstState', 'createState');
        $this->post('/saveState', 'updateState');
        $this->post('/lastState', 'finalState');
        //$this->patch('/students/{id}', 'updateStudent', $tokens);
        //$this->delete('/students/{id}', 'removeStudent', $tokens);
    }

    //This overrides the ControllerRouters list of acceptable prefixes.  For a real site, you would add to the base classes prefixes
    const PREFIXES = ['' => '/example/api'];
}