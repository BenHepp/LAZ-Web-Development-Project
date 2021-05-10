<?php

namespace LAZ\example\businessObjects;

use LAZ\example\businessObjects\Collection\Column;
use LAZ\example\businessObjects\Collection\Row;
use LAZ\example\businessObjects\Line\Row as LineRow;
use LAZ\example\businessObjects\Line\Column as LineCol;

/**
 * Crossword Word
 */
class Word
{

    /**
     * @var string
     */
    protected $word;

    /**
     * @var array
     */
    protected $params;

    /**
     * @var Row|null|\LAZ\example\businessObjects\Line\Row[]
     */
    protected $rows = null;

    /**
     * @var Column|null
     */
    protected $columns = null;

    /**
     * @var null
     */
    protected $baseColumn = null;

    /**
     * @var null
     */
    protected $baseRow = null;

    /**
     * @var bool
     */
    public $isUsed;//protected $isUsed;

    /**
     * Word constructor.
     *
     * @param $word
     * @param array $params
     */
    public function __construct($word, $params = []){
        $this->setWord($word);

        $this->params = $params;
        $this->rows = new Row();
        $this->columns = new Column();

        $this->validate($word);
    }

    /**
     * @param LineCol $col
     */
    public function addCol(LineCol $col){
        $this->columns->add($col);
    }

    /**
     * @return Column|null
     */
    public function getColumns(){
        return $this->columns;
    }

    /**
     * @param LineRow $row
     */
    public function addRow(LineRow $row){
        $this->rows->add($row);
    }

    /**
     * @return Row|null|\LAZ\example\businessObjects\Line\Row[]
     */
    public function getRows(){
        return $this->rows;
    }

    /**
     * @param LineCol $col
     */
    public function setBaseColumn(LineCol $col){
        $this->baseColumn = $col;
    }

    /**
     * @return LineCol
     */
    public function getBaseColumn(){
        return $this->baseColumn;
    }

    /**
     * @param LineRow $col
     */
    public function setBaseRow(LineRow $col){
        $this->baseRow = $col;
    }

    /**
     * @return LineRow
     */
    public function getBaseRow(){
        return $this->baseRow;
    }

    /**
     * @param $mask
     * @return int
     */
    public function inMask($mask){
        return preg_match($mask, $this->getWord());
    }

    /**
     * @return string
     */
    public function getWord(){
        return $this->word;
    }

    /**
     * @param $word
     */
    public function setWord($word){
        $this->word = (string) trim(strtolower($word));
    }

    /**
     * @return array
     */
    public function getParams(){
        return $this->params;
    }

    /**
     * @param array $params
     */
    public function setParams($params){
        $this->params = $params;
    }

    /**
     * @return bool
     */
    public function isUsed(){
        return $this->isUsed;
    }

    /**
     * @param $isUsed
     */
    public function setIsUsed($isUsed){
        $this->isUsed = (bool) $isUsed;
    }

    /**
     * Word validation
     *
     * @throws \Exception
     */
    protected function validate($word){
        if(empty($word)) {
            throw new Exception('Word is empty!');
        }
    
        //if(!preg_match('/^\w+$/ui', $word)) {
        if(preg_match('/[\/~`\!@#\$%\^&\*\(\)_\+=\{\}\[\]\|;:"\<\>,\.\?\\\]/', $word)) {
            throw new Exception('Wrong word (/^\w+$/ui) (' . $word . ')');
        }
    }

}
