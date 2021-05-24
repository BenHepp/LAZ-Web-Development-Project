<?php
namespace LAZ\example\services;

use LAZ\example\dataAccess\SaveStateDbGateway;
use LAZ\example\dataAccess\premadeLessonGateway;

class SaveStateService {

    /**
     * @var SaveStateDbGateway
     */
    private $dbGateway;
    /**
     * @var premadeLessonGateway
     */
    private $dbGateway1;

    public function __construct() {
        $this->dbGateway = new SaveStateDbGateway();
        $this->dbGateway1 = new premadeLessonGateway();
    }

    public function createTable($obj) {
        return $this->dbGateway->createTable($obj);
        // uncomment to add premade lesson plans to DB
        // $this->dbGateway1->createLesson(); 
    }

    public function saveUserState($updatedCellObj){
        return $this->dbGateway->pushState($updatedCellObj);
    }

    public function completedPuzzle($obj) {
        return $this->dbGateway->pushCompletedPuzzle($obj);
    }

}