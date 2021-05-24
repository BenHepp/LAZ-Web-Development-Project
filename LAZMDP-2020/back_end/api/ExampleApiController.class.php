<?php
namespace LAZ\example\api;

use LAZ\objects\library\Router\Resource;
use Psr\Http\Message\ServerRequestInterface;
use LAZ\example\services\CrosswordService;
use LAZ\example\services\SaveStateService;
use LAZ\example\businessObjects\Crossword;
use LAZ\example\businessObjects\UserArray;

class ExampleApiController implements Resource {

    /**
     * @var Resource
     */
    private $resource;

    /**
     * @var SaveStateService
     */
    private $SaveStateService;

    public function __construct() {
        $this->SaveStateService = new SaveStateService();
    }

    public function createState() {
        $userArrObj = new UserArray($this->resource);
        return $this->SaveStateService->createTable($userArrObj);
    }

    public function updateState() {
        $userArrObj = new UserArray($this->resource);
        return $userArrObj;
        return $this->SaveStateService->saveUserState($userArrObj); // validate that resource array is in the state we expect
    }

    public function finalState() {
        $userArrObj = new UserArray($this->resource);
        return $this->SaveStateService->completedPuzzle($userArrObj);
    }

    public function setResource($resource) {
        $this->resource = $resource;
    }

    // add student
        // $student = ExampleStudent::fromArray($this->resource);
        // $studentId = $this->studentService->addStudent($student);
        // return $this->studentService->getStudent($studentId);

    // public function getHelloWorld() {
    //     return "Hello world";
    // }

    // public function getAllStudents() {
    //     return "hello there!";
    //     //return $this->studentService->getAllStudents();
    // }

    

    // public function removeStudent(ServerRequestInterface $request) {
    //     $studentId = (int)$request->getAttribute('id');
    //     return $this->studentService->removeStudent($studentId);
    // }

    // public function updateStudent() {
    //     $student = ExampleStudent::fromArray($this->resource);
    //     $this->studentService->updateStudent($student);
    //     return $this->studentService->getStudent($student->studentId);
    // }

    

}