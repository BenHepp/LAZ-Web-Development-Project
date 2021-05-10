<?php
namespace LAZ\example\tests;

use PHPUnit\Framework\TestCase;
use LAZ\example\services\WordsService;
use LAZ\example\services\CrosswordService;
use LAZ\example\dataAccess\premadeLessonGateway;

class premade_tests extends TestCase {

    /**
     * @var premadeLessonGateway
     */
    private $dbGateway1;
    public function testNormal1() {
        $this->dbGateway1 = new premadeLessonGateway();
        $start_time = microtime(true);
        $lessonNum = 2;
        echo "Lesson " . $lessonNum;
        $wordsArr = $this->dbGateway1->getLesson($lessonNum);
        // add for loop to test all lessons
        $crosswordService = new CrosswordService($wordsArr);
        $end_time = microtime(true); 
        $execution_time = ($end_time - $start_time);
        echo " Execution time of script = ".$execution_time." sec";
        $this->assertLessThan($execution_time, 4);
    }

    
        // function skeleton for puzzle of "islands"



    // regeneration back end code
    //    - issue with tutorial
    // we are in the middle of testing the premade lesson plans 
    //    - have everything hooked up/in the db/ready to go, just have to write tests

}
