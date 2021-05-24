<?php
namespace LAZ\example\services;

use LAZ\example\dataAccess\ExampleStudentsDbGateway;
use LAZ\example\businessObjects\ExampleStudent;
use LAZ\example\businessObjects\Word;
use LAZ\example\validators\ExampleStudentValidator;

class ExampleStudentService {

    /**
     * @var ExampleStudentsDbGateway
     */
    private $dbGateway;

    public function __construct() {
        $this->dbGateway = new ExampleStudentsDbGateway ();
    }

    public function getWords() {
        $studentRows = $this->dbGateway->getWords();
        return ExampleStudent::fromArrays($studentRows);
    }

    /**
     * @return ExampleStudent[]
     */
    public function getAllStudents() {
        $studentRows = $this->dbGateway->getAllStudents();
        return ExampleStudent::fromArrays($studentRows);
    }

    /** @return ExampleStudent */
    public function addStudent(ExampleStudent $student) {
        ExampleStudentValidator::validate($student, $isNew = true);
        $studentId =
            $this->dbGateway->createStudent($student->screenName, $student->studentFirstName, $student->studentLastName,
                $student->passwordText);
        return $studentId;
    }

    public function removeStudent($studentId) {
        $this->dbGateway->deleteStudent($studentId);
        return true;
    }

    /**
     * @param ExampleStudent
     * @return ExampleStudent
     */
    public function updateStudent(ExampleStudent $student) {
        ExampleStudentValidator::validate($student, $isNew = false);
        $this->dbGateway->updateStudent($student->studentId, $student->screenName, $student->studentFirstName,
            $student->studentLastName, $student->passwordText);
    }

    /**
     * @param $id
     * @return ExampleStudent
     */
    public function getStudent($studentId) {
        $studentRow = $this->dbGateway->getStudent($studentId);
        return ExampleStudent::fromArray($studentRow);
    }
}