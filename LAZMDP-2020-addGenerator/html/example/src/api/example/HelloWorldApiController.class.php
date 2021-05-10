<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\Resource;
use Psr\Http\Message\ServerRequestInterface;
// use LAZ\example\services\ExampleStudentService;
// use LAZ\example\businessObjects\ExampleStudent;

class HelloWorldApiController {

    public function __construct() {
    }

    public function getHelloWorld() {
        return "Hello world";
    }

}