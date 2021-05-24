<?php
namespace LAZ\example\businessObjects;

class UserArray { 
    public $incomplete_xword_id;
    public $userArray; 
    public $answerKey;
    public $studentID;

    /**
     * @param array $arr
     */
    public function __construct($arr) {
        $this->incomplete_xword_id = $arr["incomplete_xword_id"];
        $this->userArray = $arr["userArray"];
        $this->answerKey = $arr["answerKey"];
        $this->studentID = $arr["studentID"];
    }
}