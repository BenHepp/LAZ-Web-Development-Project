<?php
namespace LAZ\example\dataAccess;

use LAZ\objects\data\DataManager;
use LAZ\objects\library\SQLUtil;

class ExampleStudentsDbGateway {

    public function getWords() {
        $studentId = (int)$studentId;
        $query = "SELECT word, definition          FROM vsc_words";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->fetch()[0];
    }

    public function createStudent($screenName, $firstName, $lastName, $password) {
        $screenName = SQLUtil::escapeString($screenName);
        $firstName = SQLUtil::escapeString($firstName);
        $lastName = SQLUtil::escapeString($lastName);
        $password = SQLUtil::escapeString($password);

        $query = "INSERT INTO example_student 
                    (screen_name, student_first_name, student_last_name, password_text, added_at)
                  VALUES ('$screenName', '$firstName', '$lastName', '$password', NOW())";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->lastId();
    }

    public function getStudent($studentId) {
        $studentId = (int)$studentId;
        $query = "SELECT example_student_id, screen_name, student_first_name, student_last_name, password_text, added_at, removed_at
                  FROM example_student
                  WHERE example_student_id = $studentId
                    AND removed_at IS NULL";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->fetch();
    }

    public function getAllStudents() {
        $query = "SELECT example_student_id, screen_name, student_first_name, student_last_name, password_text, added_at, removed_at
                  FROM example_student
                  WHERE removed_at IS NULL";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->fetchAll();
    }

    public function updateStudent($studentId, $screenName, $firstName, $lastName, $password) {
        $studentId = (int)$studentId;
        $screenName = SQLUtil::escapeString($screenName);
        $firstName = SQLUtil::escapeString($firstName);
        $lastName = SQLUtil::escapeString($lastName);
        $password = SQLUtil::escapeString($password);

        $query = "UPDATE example_student
                    SET screen_name = '$screenName', student_first_name = '$firstName', student_last_name = '$lastName', password_text = '$password'
                  WHERE example_student_id = $studentId
                    AND removed_at is NULL";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->rowsAffected();
    }

    public function deleteStudent($studentId) {
        $studentId = (int)$studentId;
        $query = "UPDATE example_student SET removed_at = NOW() WHERE example_student_id = $studentId AND removed_at is NULL";
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->rowsAffected();
    }

    /** @return DataManager */
    public function getDataManager() {
        return new DataManager(DataManager::DB_EXAMPLE, DataManager::LOC_MASTER);
    }

}