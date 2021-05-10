<?php
namespace LAZ\example\modules;

use LAZ\example\services\WordLocationsService;
use LAZ\example\services\WordsService;
use LAZ\objects\base\Controller;
use LAZ\example\services\CrosswordService;

class Crossword extends Controller {

    public function control(ModuleRegistry $moduleRegistry=null) {
        $wordsService = new WordsService();

        // INPUT ARRAY
        $wordsArray = array();
        //array_push($wordsArray, "dog");
        //array_push($wordsArray, "rabbits");
        array_push($wordsArray, "library");
        array_push($wordsArray, "centrist");
        array_push($wordsArray, "hydrogen fuel cell");
        array_push($wordsArray, "abhor");
        array_push($wordsArray, "absent");
        array_push($wordsArray, "absorb");
        array_push($wordsArray, "Abuja");
        array_push($wordsArray, "accelerate");
        array_push($wordsArray, "access");

        $wordList = $wordsService->getWords($wordsArray); // determines which words are grabbed from database
        $this->view->assign('words', $wordList);

        $crosswordService = new CrosswordService($wordList);
        $crossword = $crosswordService->getCrossword();
       
        $wordLocationsService = new WordLocationsService($crossword, $wordList);
        $this->view->assign('wordLocations', $wordLocationsService->getWordLocations());
        $this->view->assign('crossword', $wordLocationsService->getAdjustedCrossword());
        //assigns main page as crossword.html
        $this->view->assign('content', 'crossword');   
    }

    public function getModel() {
    }

}