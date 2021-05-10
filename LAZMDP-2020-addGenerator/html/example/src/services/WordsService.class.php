<?php
namespace LAZ\example\services;

use LAZ\example\dataAccess\WordsDbGateway;


// use LAZ\example\businessObjects\ExampleStudent;
// use LAZ\example\validators\ExampleStudentValidator;

class WordsService {

    /**
     * @var WordsDbGateway
     */
    private $dbGateway;

    public function __construct() {
        $this->dbGateway = new WordsDbGateway();
    }

    /**
     * @return word string 
     */
    public function getWords($wordsList) {
        $words = $this->dbGateway->getWords($wordsList);
        //HERE ^^

        for($index = 0; $index < count($words); ++$index){
            $cleanWord = str_replace(' ', '', $words[$index]['word']);
            $words[$index]['word'] = $cleanWord;
        }
        return $words;

        // use logger to keep track of words not used
    //     $newWords = array();

    //     //Removes extra spaces in words and make lowercase
    //     for($index = 0; $index < count($numWords); ++$index){ //words
    //         $cleanWord = str_replace(' ', '', $numWords[$index]['word']); // numwords should be "words"
    //         if($numWords[$index]['definition'] != "" && $numWords[$index]['word'] != "") { //numwords = words
    //             echo "include";
    //             $newWords[$index]['word'] = $cleanWord;
    //             $newWords[$index]['definition'] = $numWords[$index]['definition']; //should be "words"
    //         }
    //     }
    //     //$words[0]['word'] = 'library';
    //     return $newWords;
    }

}