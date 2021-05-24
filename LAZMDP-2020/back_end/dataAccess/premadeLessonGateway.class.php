<?php
namespace LAZ\example\dataAccess;

use LAZ\objects\data\DataManager;
use LAZ\objects\library\SQLUtil;

class premadeLessonGateway {

    public function createLesson() { 
        $crosswordDM = $this->getDataManager();
        $allLessonPlans = file_get_contents("/var/www/html/example/src/dataAccess/razPremadeLesson.sql");
       
        $lessonPlansArr = explode(";", $allLessonPlans);

        for($i = 0; $i < count($lessonPlansArr); ++$i) {
            $insertLesson = $lessonPlansArr[$i];
            $crosswordDM->query($insertLesson);
        }
    }

    /** push final user state into finished_puzzles table*/
    public function getLesson($lessonNum){
        $crosswordDM = $this->getDataManager(); 

        $select = "SELECT FROM crossword_game.raz_premade_lesson WHERE raz_premade_lesson_id = $lessonNum";
        $crosswordDM->query($select);
        return $crosswordDM->fetchAll();
    }
    
    /** @return DataManager */
    public function getDataManager() {
        return new DataManager(DataManager::DB_EXAMPLE, DataManager::LOC_MASTER);
    }
}