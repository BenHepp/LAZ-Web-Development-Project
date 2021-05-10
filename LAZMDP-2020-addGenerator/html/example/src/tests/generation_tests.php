<?php
namespace LAZ\example\tests;

use PHPUnit\Framework\TestCase;
use LAZ\example\services\WordsService;
use LAZ\example\services\CrosswordService;

class generation_tests extends TestCase {

    // ------------------------- NORMAL TEST CASE ------------------------- //

    // public function normal1() {
    //     $start_time = microtime(true);
    //     // should generate two islands
    //     $wordsArr = array(
    //         array("word" => "cat", "definition" => "definition"),
    //         array("word" => "boat", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan($execution_time, 4);
    // }
    
    // ------------------------- MUTUALLY EXCLUSIVE ------------------------- // 

    // public function testMutuallyExclusiveWords1() {
    //     $start_time = microtime(true);
    //     // should generate two islands
    //     $wordsArr = array(
    //         array("word" => "cat", "definition" => "definition"),
    //         array("word" => "dog", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan($execution_time, 4);
    // } 

    // public function testMutuallyExclusiveWords2() {
    //     $start_time = microtime(true);
    //     // all three technically fit, but one should be an island
    //     $wordsArr = array(
    //         array("word" => "cat", "definition" => "definition"),
    //         array("word" => "bat", "definition" => "definition"),
    //         array("word" => "rat", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan($execution_time, 4); //swap values to make test case fail
    // } 

    // public function testMutuallyExclusiveWords3() {
    //     $start_time = microtime(true);
    //     // ron doesn't fit, should produce an island
    //     $wordsArr = array(
    //         array("word" => "cat", "definition" => "definition"),
    //         array("word" => "bat", "definition" => "definition"),
    //         array("word" => "ron", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan($execution_time, 4);
    // } 

    // public function testMutuallyExclusiveWords4() {
    //     $start_time = microtime(true);
    //     // crossword should generate without error or islands
    //     $wordsArr = array(
    //         array("word" => "cat", "definition" => "definition"),
    //         array("word" => "boat", "definition" => "definition"),
    //         array("word" => "rot", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    // } 

    // public function testMutuallyExclusiveWords5() {
    //     $start_time = microtime(true);
    //     // should generate with one island, ensure >= 1 space between every pair of horz/vert words
    //     $wordsArr = array(
    //         array("word" => "can", "definition" => "definition"),
    //         array("word" => "boa", "definition" => "definition"),
    //         array("word" => "rot", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan($execution_time, 4);
    // } 

    // // ------------------------- MISSING DEFINITION ------------------------- // 
    
    // public function testAllDefintionsExist1() {
    //     $start_time = microtime(true);
    //     // should generate without first word
    //     $wordsArr = array(
    //         array("word" => "boat", "definition" => ""),
    //         array("word" => "riot", "definition" => "definition"),
    //         array("word" => "can", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($this->Crossword->words.length(), 2);
    // } 

    // public function testAllDefintionsExist2() {
    //     $start_time = microtime(true);
    //     // should generate without first word
    //     $wordsArr = array(
    //         array("word" => "hydrogenfuelcell", "definition" => "Coming Soon"),
    //         array("word" => "boa", "definition" => "definition"),
    //         array("word" => "roll", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($crosswordService->getCrossword()->words.length(), 3); // should ultimately change to 2
    // } 

    // // ------------------------- MISSING WORD ------------------------- // 

    // public function testAllWordsExist1() {
    //     $start_time = microtime(true);
    //     // should generate puzzle without first word
    //     $wordsArr = array(
    //         array("word" => "", "definition" => "definition"),
    //         array("word" => "riot", "definition" => "definition"),
    //         array("word" => "cab", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($crosswordService->getCrossword()->words.length(), 2);
    // } 

    // // ------------------------- SPECIAL CHARACTER ------------------------- // 

    // public function testSpecialCharacters1() {
    //     $start_time = microtime(true);
    //     // puzzle should only contain last word
    //     $wordsArr = array(
    //         array("word" => "word12345", "definition" => "definition"),
    //         array("word" => "word", "definition" => "definition"),
    //         array("word" => "two-timer", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($crosswordService->getCrossword()->words.length(), 1);
    // } 

    // public function testSpecialCharacters2() {
    //     $start_time = microtime(true);
    //     // puzzle should generate with all three words (no islands)
    //     $wordsArr = array(
    //         array("word" => "test-hyphens$", "definition" => "definition"),
    //         array("word" => "hyphens", "definition" => "definition"),
    //         array("word" => "two-timer", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($$crosswordService->getCrossword()->words.length(), 3);
    // } 

    // public function testSpecialCharacters3() {
    //     $start_time = microtime(true);
    //     // puzzle should generate with both words (no islands)
    //     $wordsArr = array(
    //         array("word" => "don't", "definition" => "definition"),
    //         array("word" => "isn't", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($crosswordService->getCrossword()->words.length(), 2);
    // } 

    // public function testSpecialCharacters4() {
    //     $start_time = microtime(true);
    //     // combo, puzzle should generate with all three words (no islands)
    //     $wordsArr = array(
    //         array("word" => "don't", "definition" => "definition"),
    //         array("word" => "is-not", "definition" => "definition"),
    //         array("word" => "creative", "definition" => "definition"),
    //     );
    //     $crosswordService = new CrosswordService($wordsArr);
    //     //echo var_dump($crosswordService->getCrossword());
    //     $end_time = microtime(true); 
    //     $execution_time = ($end_time - $start_time);
    //     echo " Execution time of script = ".$execution_time." sec";
    //     $this->assertLessThan(4, $execution_time);
    //     //$this->assertEquals($crosswordService->getCrossword()->words.length(), 3);
    // } 


    public function testNoDefinition() {
        $start_time = microtime(true);
        // combo, puzzle should generate with all three words (no islands)

        $wordsService = new WordsService();
        $wordsArr = array(
            array("word" => "three", "definition" => ""), // use [] instead
            array("word" => "", "definition" => "definition"),
            array("word" => "two", "definition" => "definition"),
        );
        $wordsArr = $wordsService->getWords($wordsArr);

        $crosswordService = new CrosswordService($wordsArr);
        echo var_dump($crosswordService->getCrossword());
        $end_time = microtime(true); 
        $execution_time = ($end_time - $start_time);
        echo " Execution time of script = ".$execution_time." sec";
        $this->assertLessThan(4, $execution_time);
        //$this->assertEquals($crosswordService->getCrossword()->words.length(), 3);
    } 


    // one or some (but not all) of the words have "mutually exclusive characters"
    // missing definition
    // missing word
    // only include "-" and "  '  " (hyphens and apostrophes) for non-letters


    // what we learned from first round of testing (11/1) 
    // 1.) MIT already checks for special characters (now excluding hyphens/apostrophes) and throws an error if any word contains "bad" characters
    // 2.) MIT asserts that word must be non-empty 
    // 3.) Numbers are currently allowed to exist in words (should we be letting this happen/how to properly handle this)


    // Ben TODOs:
    // 1.) download/integrate pre-made lessons into separate file
    // 2.) download phpunit on droplet DONE
    // 3.) clean up this file

    // Easy TODOs:
    // 1.) don't allow words in puzzle that don't have definition DONE
    // 2.) omit any empty words ("") before generation begins DONE

    // Harder TODOs:
    // 1.) Write function to handle "islands"
    // 2.) test wordlocationsservice
    // 3.) "grey out" hyphens and apostrophes
}
