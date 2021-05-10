<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\ControllerRouter;

class CrosswordApiRouter extends ControllerRouter {

    public function __construct() {
        parent::__construct(CrosswordApiController::class, '/api');
    }

    protected function registerRoutes() {
        // $tokens = ['id' => '\d+'];

        $this->get('/crossword', 'getCrossword');
        $this->post('/crossword', 'saveUserState');
        //not used
        //$this->get('/crossword', 'getCrossword');
        //$this->get('/wordData', 'getWordData');
        //);
    }

    //This overrides the ControllerRouters list of acceptable prefixes.  For a real site, you would add to the base classes prefixes
    const PREFIXES = ['' => '/example/api'];
}
