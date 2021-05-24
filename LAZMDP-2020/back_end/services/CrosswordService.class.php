<?php
namespace LAZ\example\services;

// use LAZ\crossword\dataAccess\ExampleStudentsDbGateway; //Need to connect to wordsDbGateway
use LAZ\example\businessObjects\Crossword;
use LAZ\example\businessObjects\Generate\Generate; // as Generate;
// use LAZ\crossword\validators\ExampleStudentValidator; // Need to connect to wordValidator

class CrosswordService {

    /**
     * @var
     */
    private $Crossword;

    public function __construct($words) {

        $wordsInput = array();
        $longestWord = 0;
        foreach($words as $word){
            $value = array($word['definition']);
            $cleanWord = strtoupper($word['word']);
            $wordsInput[$cleanWord] = $value;
            if($longestWord < strlen($cleanWord)) {
                $longestWord = strlen($cleanWord);
            }
        }
        
        // $this->Crossword = new \LAZ\example\businessObjects\Crossword(20, 20, $wordsInput);
        // $this->Crossword->generate(\LAZ\example\businessObjects\Generate\Generate::TYPE_RANDOM, true);
        $start_time = microtime(true);
        $gridSize = max($longestWord, count($wordsInput));
        //$gridSize = 3;
        while((!$this->Crossword || !$this->Crossword->words->items[0]->isUsed) && $gridSize < 30) { //checks if first word is used (if first is used, all are used)
            $this->Crossword = null;
            $this->Crossword = new Crossword($gridSize, $gridSize, $wordsInput);
            $this->Crossword->generate(Generate::TYPE_RANDOM, true);
            ++$gridSize;
            $end_time = microtime(true);
            if($end_time - $start_time > 4) {
                // use logger here too (state why you can't generate crossword)
                //echo "Generation took more than 4 seconds\n";
                break;
            }
            //break;
        }

        // if crossword hasn't been generated, create puzzle of islands
        /*if(!$this->Crossword->words->items[0]->isUsed) {
            //all words horizontal (with spaces in between)
            //grid size = numWords * 2
            // regenerate with new size
            $gridSize = max($longestWord, count($wordsInput)) * 2;
            // if $longestWord > 2 * count($wordsInput) {
                $gridSize = $longestWord;
            }
            $this->Crossword = new Crossword($gridSize, $gridSize, $wordsInput);
            $this->Crossword->generate(Generate::TYPE_RANDOM, true);
            // for each row, add in words
            for($r = 1; $r <= count($wordsInput) * 2; $r++) {
                $currentWord = $words[$r / 2]['word'];
                if($r % 2 == 1) {
                    for($c = 1; $c <= strlen($currentWord); $c++) {
                        $letter = $currentWord[$c - 1];
                        $this->Crossword->rows->items[$r]->fields[$c]->char = $letter;
                    } 
                }
                
            }
            // for($r = 0; $r < $gridSize; $r++) {
            //     $currentWord = $wordsInput[0];
            //     for($c = 0; $c < $gridSize; $c++) {
            //         if($c < count($currentWord)) {
            //             $this->getCrossword->columns->items->$r->fields->$c->char = $currentWord[$c];
            //         }
            //         else  {
            //             $this->getCrossword->columns->items->$r->fields->$c->char = null;
            //         }
            //     }
            // }
            // ->rows->items
            // ->columns->items->[1-n]->fields->[1-n]->char
        }*/
    }

    public function getCrossword() {
        return $this->Crossword->toArray();
        
    }

    public function printArray() {
        echo $this->Crossword->rows;
        // foreach($this->Crossword as $row) {
        //     echo $row;
        // } 
    }

    // public function getLocations() {
    //     return $this->Crossword->findCoordinates();
    // }


























}