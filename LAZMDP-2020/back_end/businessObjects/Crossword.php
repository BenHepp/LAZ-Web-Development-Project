<?php

namespace LAZ\example\businessObjects;

use LAZ\example\businessObjects\Generate\Generate;
use LAZ\example\businessObjects\Collection\WordColl;
use LAZ\example\businessObjects\Collection\Column;
use LAZ\example\businessObjects\Collection\Row;
use LAZ\example\businessObjects\Line\Column as LineCol;
use LAZ\example\businessObjects\Line\Row as LineRow;
use LAZ\example\businessObjects\Word as Word;

/**
 * Generating a crossword from a list of words. 
 * It is possible to generate a crossword puzzle in a random order or based on a single word.
 * The library is written so that the generation methods can be written by yourself and easily added to the code.
 * 
 * @author Mironov Dmitriy <MironovDW@bk.ru> 
 */ 
class Crossword{

    /**
     * @var int Number of columns
     */
    public $columnsCount;

    /**
     * @var int Number of rows
     */
    public $rowsCount;

    /**
     * @var Column Column collection
     */
    protected $columns;

    /**
     * @var Row String collection
     */
    public $rows;

    /**
     * @var array
     */
    public $originWords;

    /**
     * @var Word Collection of words
     */
    public $words; //protected $words;

    // // ADDED holds array of objects containing the word,location,definition
    // /**
    //  * @var array 
    //  */
    // protected $wordLocations;

    /**
     * @params int $colsCount Number of columns
     * @params int $rowsCount Number of rows
     * @params array $words   Word list
     */
    public function __construct($colsCount, $rowsCount, array $words){
        $this->setColumnsCount($colsCount);
        $this->setRowsCount($rowsCount);
        $this->setOriginWords($words);
        $this->init();
    }

    /**
     * Class initialization
     */
    protected function init(){
        $this->words = new WordColl($this->originWords);
        $this->generateFields();
        $this->wordLocations = [];
    }

    public function clear(){
        $this->init();
    }

    /**
     * Automatically generates a crossword from a list of words
     * The type of generation can be selected from the CrosswordGenerate class, there you can also see how to write your type.
     *
     * @param string $type Type of generation (CrosswordGenerate::RANDOM, CrosswordGenerate::BASE_LINE, ...)
     * @param bool $needAllWords
     * @param int $maxGenerateAttempts Max count of crossword generation
     * @param int $maxWordPositionAttempts Max count of words positioning
     *
     * @return bool Crossword generated or not
     */
    public function generate(
        $type = Generate::TYPE_RANDOM,
        $needAllWords = false,
        $maxGenerateAttempts = Generate::MAX_GENERATE_ATTEMPTS,
        $maxWordPositionAttempts = Generate::MAX_WORD_POSITION_ATTEMPTS
    ) {
        return Generate::factory($type, $this)->generate($needAllWords, $maxGenerateAttempts, $maxWordPositionAttempts);
    }

    /**
     * Based on the number of columns and rows, generates the required number of columns, rows and fields
     */
    protected function generateFields(){
        $columnsCount = $this->getColumnsCount();
        $rowsCount = $this->getRowsCount();

        $columns = new Column();
        $rows = new Row();

        $first = true;
        for($i = 1 ; $columnsCount >= $i ; $i++) {
            $col = new LineCol($i, $this);
            $columns->addCol($col);

            for($k = 1 ; $rowsCount >= $k ; $k++) {
                if($first) {
                    $row = new LineRow($k, $this);
                    $rows->addRow($row);
                }
                $_row = $rows->getByIndex($k);
                $field = new Field($col, $_row);

                $col->addField($field);
                $_row->addField($field);
            }
            $first = false;
        }

        $this->setRows($rows);
        $this->setColumns($columns);
    }

    /**
     * @return Word Column Collection
     */
    public function getWords(){
        return $this->words;
    }

    /**
     * @return Column Column Collection
     */
    public function getColumns(){
        return $this->columns;
    }

    /**
     * @params Cols String collection
     */
    public function setColumns(Column $columns){
        $this->columns = $columns;
    }

    /**
     * @return Row String collection
     */
    public function getRows(){
        return $this->rows;
    }

    /**
     * @params Row String collection
     */
    public function setRows(Row $rows){
        $this->rows = $rows;
    }

    /**
     * @return int Number of columns
     */
    public function getColumnsCount(){
        return $this->columnsCount;
    }

    /**
     * @params int Number of columns
     */
    public function setColumnsCount($columnsCount){
        $this->columnsCount = (int) $columnsCount;
    }

    /**
     * @return int Number of lines
     */
    public function getRowsCount(){
        return $this->rowsCount;
    }

    /**
     * @params int Number of lines
     */
    public function setRowsCount($rowsCount){
        $this->rowsCount = (int) $rowsCount;
    }

    /**
     * @return array
     */
    public function getOriginWords(){
        return $this->originWords;
    }

    /**
     * @param array $originWords
     */
    public function setOriginWords($originWords){
        $this->originWords = $originWords;
    }

    // /**
    //  * @return array $wordLocations
    //  */
    // public function getWordLocations(){
    //     return $this->wordLocations;
    // }

    // /**
    //  * @deprecated @see $this->toArray()
    //  * @return array
    //  */
    // public function _toArray(){
    //     $array = [];
    //     $index = 0;
    //     foreach ($this->getRows() as $row) {
    //         foreach ($row->getFields() as $field) {
    //             $array[$index][] = ($field->getChar() ? $field->getChar() : ' ');
    //         }
    //         $index++;
    //     }
    //     return $array;
    // }

    public function toArray(){
        $array = [];

        foreach ($this->getRows() as $rowIndex => $row) {
            foreach ($row->getFields() as $fieldIndex => $field) {
                $temp = $rowIndex;
                if (!$field->getChar()) {
                    $rIndex = $rowIndex;
// ADDED SUBTRACT BY ONE SO THAT THE CROSSWORD ARRAY IS 0 INDEXED - LAZ TEAM CHANGE
                    $array[$rIndex-1][$fieldIndex-1] = array('');
                }
                $rIndex = $rowIndex;
// ADDED SUBTRACT BY ONE SO THAT THE CROSSWORD ARRAY IS 0 INDEXED - LAZ TEAM CHANGE
                $array[$rIndex - 1][$fieldIndex - 1] = array($field->getChar());
            }
        }
        return $array;
    }
}