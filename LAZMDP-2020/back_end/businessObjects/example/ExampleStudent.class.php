<?php
namespace LAZ\example\businessObjects;


class ExampleStudent {
    public $studentId;
    public $screenName;
    public $studentFirstName;
    public $studentLastName;
    public $passwordText;
    public $addedAt;
    public $removedAt;

    /**
     * @param $arr
     * @return ExampleStudent
     */
    public static function fromArray($arr) {
        if ($arr['screen_name']) {
            return new ExampleStudent($arr['example_student_id'], $arr['screen_name'], $arr['student_first_name'],
                $arr['student_last_name'], $arr['password_text'], $arr['added_at'], $arr['removed_at']);
        }
        return new ExampleStudent($arr['studentId'], $arr['screenName'], $arr['studentFirstName'],
            $arr['studentLastName'], $arr['passwordText'], $arr['addedAt'], $arr['removedAt']);
    }

    /**
     * @param $arr
     * @return ExampleStudent[]
     */
    public static function fromArrays($arrays) {
        return array_map(function ($arr) {
            return ExampleStudent::fromArray($arr);
        }, $arrays);
    }

    /**
     * @param int $studentId
     * @param string $screenName
     * @param string $studentFirstName
     * @param string $studentLastName
     * @param string $passwordText
     * @param string $addedAt
     * @param string $removedAt
     */
    public function __construct($studentId, $screenName, $studentFirstName, $studentLastName, $passwordText, $addedAt,
        $removedAt) {
        $this->studentId = (int)$studentId;
        $this->screenName = $screenName;
        $this->studentFirstName = $studentFirstName;
        $this->studentLastName = $studentLastName;
        $this->passwordText = $passwordText;
        $this->addedAt = $addedAt;
        $this->removedAt = $removedAt;
    }
}