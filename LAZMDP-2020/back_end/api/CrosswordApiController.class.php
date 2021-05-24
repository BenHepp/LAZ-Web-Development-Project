<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\Resource;
use Psr\Http\Message\ServerRequestInterface;
use LAZ\example\services\CrosswordService;
use LAZ\example\businessObjects\Crossword;

class CrosswordApiController implements Resource { // changed from CrosswordController

    /**
     * @var Resource
     */
    private $resource;

    /**
     * @var CrosswordService
     */
    private $crosswordService;

    public function __construct() {
        $this->crosswordService = new CrosswordService ();
    }

    public function saveUserState($arr) {
        return "worked!";
    }

    public function getCrossword() {
        return $this->crosswordService->getCrossword();
    }

    public function setResource($resource) {
        $this->resource = $resource;
    }

}
