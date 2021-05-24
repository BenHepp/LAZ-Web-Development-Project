<?php
namespace LAZ\example\dataAccess;

use LAZ\objects\data\DataManager;
use LAZ\objects\library\SQLUtil;

class SaveStateDbGateway {

    public function createTable($obj) { //should also insert answer key to other db table
        $crosswordDM = $this->getDataManager();

        $jsonUserArr = json_encode($obj->userArray);
        $jsonAnsKey = json_encode($obj->answerKey);
        $studentID = $obj->studentID;

        //echo "TESTESTest";
        //        
        // $currentPuzzle = "SELECT * FROM crossword_game.incomplete_crossword";// WHERE example_student_id = $studentID ";
        // $crosswordDM->query($currentPuzzle);
        // //console.log($crosswordDM->fetchAll());
        // if ($crosswordDM->fetchAll()) {
        //     //console.log("Entered if statement");
        //     return $crosswordDM->fetchAll();
        // }




        //$insertUserArr = "INSERT INTO crossword_game.incomplete_crossword (example_student_id, crossword, answer_key) VALUES ($studentID, '$jsonUserArr', '$jsonAnsKey')";
        //$crosswordDM->query($insertUserArr);
        $currentPuzzle = "SELECT crossword FROM crossword_game.incomplete_crossword WHERE example_student_id = $studentID ";
        $crosswordDM->query($currentPuzzle);
        //console.log($crosswordDM->fetchAll());
        $resultOutput = $crosswordDM->fetchAll();
        if ($resultOutput) {
            //console.log("Entered if statement");
            return $resultOutput;
        }
        $insertUserArr = "INSERT INTO crossword_game.incomplete_crossword (example_student_id, crossword, answer_key) VALUES ($studentID, '$jsonUserArr', '$jsonAnsKey')";
        $crosswordDM->query($insertUserArr);
        return "nothing to regenerate";

        // //get incomplete-crossword-id
        // $getIncompleteID = "SELECT MAX(incomplete_crossword_id) FROM crossword_game.incomplete_crossword WHERE $studentID = example_student_id";
        // $crosswordDM->query($getIncompleteID);
        
        // return $crosswordDM->fetchAll()[0]["MAX(incomplete_crossword_id)"];

        // If student already has an incomplete puzzle in the database, 
        //  it is deleted and replaced with the current puzzle.





        // $queryForNums = "SELECT word FROM vsc_words WHERE word LIKE '%''%'";
        // // AND word LIKE '%[^A-Z]%'";
        // // // OR word LIKE '%,%'";
        // // // OR word LIKE '%^%'
        // // // OR word LIKE '%&%'
        // // // OR word LIKE '%*%'
        // // // OR word LIKE '%(%'";
        // // word REGEXP '[^a-z ]'";

        // $crosswordDM->query($queryForNums);
        // return $crosswordDM->fetchAll();
    }

    /** push current user state into incomplete_crossword db*/
    public function pushState($obj){
        $crosswordDM = $this->getDataManager(); 

        $studentID = $obj->studentID;
        $updatedUserArr = json_encode($obj->userArray);
        $arrayID = $ojb->incomplete_xword_id;
        $update = "UPDATE crossword_game.incomplete_crossword SET crossword = '$updatedUserArr' WHERE example_student_id = $studentID AND incomplete_crossword_id = $arrayID";
        $crosswordDM->query($update);
        return $crosswordDM->fetchAll();
        //Consider adding in: what happens if "WHERE example_student_id = $studentID    
        // finds no matches?
    }

    /** push final user state into finished_puzzles table*/
    public function pushCompletedPuzzle($obj){
        $crosswordDM = $this->getDataManager(); 

        $studentID = $obj->studentID;
        $finishedUserArr = json_encode($obj->userArray);
        $arrayID = $obj->incomplete_xword_id;
        $update = "INSERT INTO crossword_game.finished_crossword (completed_at, example_student_id, crossword) VALUES (NOW(), $studentID, '$finishedUserArr')";
        $crosswordDM->query($update);

        $delete = "DELETE FROM crossword_game.incomplete_crossword WHERE example_student_id = $studentID AND incomplete_crossword_id = $arrayID";
        $crosswordDM->query($delete);
    }
    
    /** @return DataManager */
    public function getDataManager() {
        return new DataManager(DataManager::DB_EXAMPLE, DataManager::LOC_MASTER);
    }
}