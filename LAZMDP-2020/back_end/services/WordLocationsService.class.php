<?php
namespace LAZ\example\services;

class location {
    public $row;
    public $col;
}

class wordData {
    public $definition;
    public $startLocation;
    public $endLocation;
    public $id;
}

class cellData {
    public $letter;
    public $horizontalWord;
    public $verticalWord;
}

class WordLocationsService {
    private $crossword;
    private $letterToWordGrid;
    private $wordList;
    private $wordDataArray;
    private $CROSSWORDSIZE;
    
    public function initializeCellData(){
        for($row = 0; $row < $this->CROSSWORDSIZE; ++$row){ 
            $this->letterToWordGrid[$row] = [];
          for($col = 0; $col < $this->CROSSWORDSIZE; ++$col){ 
                $letter = $this->crossword[$row][$col][0];
                $this->letterToWordGrid[$row][$col] = new CellData;
                $this->letterToWordGrid[$row][$col]->letter = $letter;
                $this->letterToWordGrid[$row][$col]->horizontalWord = null;
                $this->letterToWordGrid[$row][$col]->verticalWord = null;
            }
        }
    }

    public function __construct($crossword, $wordList) {
        $this->crossword = $crossword;
        $this->CROSSWORDSIZE = count($crossword);
        $this->wordList = $wordList;
        $this->wordDataArray = array();
        $this->initializeCellData();
    }
     
    /* 
    Returns true if the two uppercase words are the same
    */
    public function isSameWord($left, $right){
        if ($left == $right){
            return true;
        }
        return false;
    }
    
    /*
    Returns the definition or null
    */
    public function getDefinition($findWord){
        $findWord = strtoupper($findWord);
        foreach ($this->wordList as $index => $dict){
            $wordUpper = strtoupper($dict["word"]);
            if ($this->isSameWord($wordUpper, $findWord)){
                return $dict["definition"];
            }
        }
        return null;     
    }

    /*Assumes that the grid is a square*/
    public function isEndOfWordEndOfGrid($cellLocation) {
        return $cellLocation == $this->CROSSWORDSIZE - 1;
    }
    
    public function getEndLocationVertical($row, $col, $char){
        if($this->isEndOfWordEndOfGrid($row) && $char) {
            $endLocation = new location;
            $endLocation->row = $this->CROSSWORDSIZE - 1;
            $endLocation->col = $col;
            return $endLocation;
        }
        $endLocation = new location;
        $endLocation->row = $row - 1;
        $endLocation->col = $col;
        return $endLocation;
    }
    
    public function getEndLocationHorizontal($row, $col, $char){
        if($this->isEndOfWordEndOfGrid($col) && $char) {
            $endLocation = new location;
            $endLocation->row = $row;
            $endLocation->col = $this->CROSSWORDSIZE - 1;
            return $endLocation;
        }
        $endLocation = new location;
        $endLocation->row = $row;
        $endLocation->col = $col - 1;
        return $endLocation;
    }

    public function isLastLetterOfWord($previousChar, $char, $cellLocation) {
        return ($previousChar && !$char) || ($char && $cellLocation == $this->CROSSWORDSIZE - 1);
    }

    /* 
    Checks if beginning of horizontal word has been discovered
    */
    public function isFirstLetterOfWord($previousChar, $char) {
        return !$previousChar && $char;
    }
    
    public function appendWordDataToEachLetter($word, $wordObject) {
        $startRow = $wordObject->startLocation->row;
        $startCol = $wordObject->startLocation->col;
        $endRow = $wordObject->endLocation->row;
        $endCol = $wordObject->endLocation->col;
        for($row = $startRow; $row <= $endRow; ++$row) {
            for($col = $startCol; $col <= $endCol; ++$col) {
                if($startRow === $endRow) {
                    $this->letterToWordGrid[$row][$col]->horizontalWord = $word;
                }
                else {
                    $this->letterToWordGrid[$row][$col]->verticalWord = $word;
                }
            }
        }
    }

    /* 
    Scans grid for vertical words 
    */
    public function saveVerticalWords(&$idCounter) {
        $verticalWords = [];
        $wordObject = new wordData;
        for($col = 0; $col < $this->CROSSWORDSIZE; ++$col){ 
            $word = '';
            $previousChar = null; 
            $startLocation = null;
            $endLocation = null;

            for($row = 0; $row < $this->CROSSWORDSIZE; ++$row){ 
                $char = $this->crossword[$row][$col][0];
                
                if($this->isFirstLetterOfWord($previousChar, $char)) {
                    //REMINDER: May have to delete unused words. 
                    $wordObject = new wordData;
                    $word = '';
                    $wordObject->startLocation = new location;
                    $wordObject->startLocation->row = $row;
                    $wordObject->startLocation->col = $col;
                }
                $word .= $char;
                
                if($this->isLastLetterOfWord($previousChar, $char, $row)) {
                    $definition = $this->getDefinition($word);
                    if ($definition){
                        $wordObject->id = $idCounter;
                        ++$idCounter;
                        $wordObject->definition = $definition;
                        $wordObject->endLocation = $this->getEndLocationVertical($row, $col, $char);
                        $verticalWords[$word] = $wordObject;
                        //now append word to crossword for each letter
                        $this->appendWordDataToEachLetter($word, $wordObject);
                    }
                }
                $previousChar = $char;
            }
        }
        return $verticalWords;
    }
    
    /* 
    Scans grid for horizontal words 
    */
    public function saveHorizontalWords(&$idCounter) {
        $horizontalWords = [];
        $wordObject = new wordData;

        for($row = 0; $row < $this->CROSSWORDSIZE; ++$row){ 
            $word = '';
            $previousChar = null;
            $startLocation = null;
            $endLocation = null;

            for($col = 0; $col < $this->CROSSWORDSIZE; ++$col){ 
                $char = $this->crossword[$row][$col][0];
                
                if($this->isFirstLetterOfWord($previousChar, $char)) {
                    //REMINDER: May have to delete unused words. 
                    $wordObject = new wordData;
                    $word = '';
                    $wordObject->startLocation = new location;
                    $wordObject->startLocation->row = $row;
                    $wordObject->startLocation->col = $col;
                }
                $word .= $char;
                if($this->isLastLetterOfWord($previousChar, $char, $col)) {    
                    $definition = $this->getDefinition($word);
                    if ($definition){
                        $wordObject->id = $idCounter;
                        ++$idCounter;
                        $wordObject->definition = $definition;
                        $wordObject->endLocation = $this->getEndLocationHorizontal($row, $col, $char);
                        $horizontalWords[$word] = $wordObject;
                        //now append word to crossword for each letter
                        $this->appendWordDataToEachLetter($word, $wordObject);
                    }
                }
                $previousChar = $char;
            }
        }
        return $horizontalWords;
    }

    public function getWordLocations() {  
        $idCounter = 0;
        $horizontalWords = $this->saveHorizontalWords($idCounter);
        $verticalWords = $this->saveVerticalWords($idCounter);
        $this->wordDataArray = $horizontalWords + $verticalWords;
        return $this->wordDataArray;
    }

    public function getAdjustedCrossword() {
        return $this->letterToWordGrid;
    }
}
