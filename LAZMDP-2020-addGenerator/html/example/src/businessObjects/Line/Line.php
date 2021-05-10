<?php

namespace LAZ\example\businessObjects\Line;

use LAZ\example\businessObjects\Field;
use LAZ\example\businessObjects\Word;

/**
 * Crossword line (row or column)
 */
abstract class Line {

    /**
     * Line type: Column
     */
    const TYPE_COLUMN = 'column';

    /**
     * Line type: Row
     */
    const TYPE_ROW = 'row';

    /**
     * Type of allocation: right
     */
    const PLACE_RIGHT = 'placeRight';

    /**
     * Type of allocation: left
     */
    const PLACE_LEFT = 'placeLeft';

    /**
     * Type of allocation: center
     */
    const PLACE_CENTER = 'placeCenter';

    /**
     * Type of allocation: random
     */
    const PLACE_RANDOM = 'placeRandom';

    /**
     * @var string self::TYPE_* Current line type
     */
    public $type = null;

    /**
     * @var array|Field[]
     */
    public $fields = array();

    /**
     * @var string|null
     */
    protected $mask = '';

    /**
     * @var int
     */
    protected $index;

    /**
     * @param $index
     */
    public function __construct($index) {
        $this->setIndex($index);
    }

    /**
     * @return null|string Pattern current line
     */

    // _ _t _ a _ 
    public function getMask() {
        if(empty($this->mask)) {
            $nullCount = 0;
            foreach($this->getFields() as $field) {
                $char = $field->getChar();
                if(is_null($char)) {
                    $nullCount++;
                } else {
                    if($nullCount > 0) {
                        $this->mask .= '[a-z]{1,' . $nullCount . '}';
                    }
                    $this->mask .= $char;
                }
            }
            if($nullCount > 0) {
                $this->mask .= '[a-z]{1,' . $nullCount . '}';
            }
            if(!empty($this->mask)) {
                $this->mask = '!' . $this->mask . '!ui';
            }
        }
        return $this->mask;
    }

    /**
     * Placing a word on a line
     *
     * @param \LAZ\example\businessObjects\class $_word
     * @param bool $isFirstWord
     * @param string $place Type of allocation SELF::PLACE_*
     * @return bool The word is placed or not
     */
    public function position(Word $_word, $isFirstWord = false, $place = self::PLACE_RANDOM){
        $word = $_word->getWord();
        $fields = $this->getFields();
        $wordLength = strlen($word);
        $fieldsCount = count($fields);
        $type = $this->getType();

        // Make the word into an array
        $chars = array();
        for($i = 0; $wordLength > $i; $i++) {
            $chars[] = substr($word, $i, 1);
        }

        // Find places to put letters (| | |a|p|p|l|e| 2 places to put letters) ???
        // Находим все смещения (| | |с|л|о|в|о| Тут смещение будет равно 2)
        $maxOffsets = $fieldsCount - count($chars);
        $offsets = array();
        for($i = 1; $maxOffsets >= $i; $i++) {
            $offsets[] = $i;
        }

        // Sort offsets by placements
        if(empty($offsets)) {
            $offsets[] = 0;
        } elseif(count($offsets) > 1) {
            switch($place) {
                case self::PLACE_RANDOM:
                    shuffle($offsets);
                    break;
                case self::PLACE_RIGHT:
                    arsort($offsets);
                    break;
                case self::PLACE_LEFT:
                    asort($offsets);
                    break;
                case self::PLACE_CENTER:
                    break;
            }

        }

        // Trying to arrange the word at each offset
        foreach($offsets as $offset) {
            $_fields = array_slice($fields, $offset);

            // With such an offset, you can arrange the word or not
            $check = true;
            // When placing at least one field with the letter
            $oneChar = false;

            // An array(0 => array('char' => ..., 'field' => ...))
            // If the word is successfully located, all fields from $ storage will be filled with letters
            // Otherwise, the array will be reset to zero.
            $storage = array();
            $i = 0;
            $isFirst = true;
            $isLast = false;
            foreach($_fields as $_field) {
                if(($i + 1) > $wordLength) {
                    continue;
                }
                if(($i + 1) == $wordLength) {
                    $isLast = true;
                }

                // Letter in the current field
                $char = $_field->getChar();
                // The letter we want to place in the coordinate
                $newChar = $chars[$i];
                // Line parallel to the word line
                $lineCurrent = ($type == self::TYPE_COLUMN) ? $_field->getColumn() : $_field->getRow();
                // Line perpendicular to the word line
                $lineCross = ($type == self::TYPE_COLUMN) ? $_field->getRow() : $_field->getColumn();

                // If the field is locked or the letter does not match, the word cannot be positioned
                if($_field->isBlock() || (!empty($char) && $char != $newChar)) {
                    $check = false;
                    break;
                }

                // To place a letter, adjacent fields must be empty
                if(empty($char)) {
                    $lineNeighbors = $lineCurrent->getNeighbors();
                    foreach($lineNeighbors as $lineNeighbor) {
                        $field = $lineNeighbor->getByIndex($lineCross->getIndex());
                        if(!empty($field)) {
                            $neighborChar = $field->getChar();
                            if(!empty($neighborChar)) {
                                $check = false;
                                break;
                            }
                        }
                    }
                }

                // If this is the first or last field, the adjacent field must be empty
                if($isFirst || $isLast) {
                    $neighbor = $isFirst ? $_field->getPrev($type) : $_field->getNext($type);
                    if(!empty($neighbor)) {
                        $neighborChar = $neighbor->getChar();
                        if(!empty($neighborChar)) {
                            $check = false;
                            break;
                        }
                    }
                }

                // If the field can be positioned
                if($check) {
                    if(!empty($char)) {
                        $oneChar = true;
                    }
                    $storage[] = array(
                        'field' => $_field,
                        'char' => $newChar
                    );
                }

                $isFirst = false;
                $i++;
            }

            // If the word can be positioned and at the same time at least one letter is touched (Or this is the first word)
            if($check && ($oneChar || $isFirstWord)) {
                $isFirst = true;
                $isLast = false;
                $count = 1;
                foreach($storage as $row) {
                    if($count == count($storage)) {
                        $isLast = true;
                    }

                    $field = $row['field'];
                    $char  = $row['char'];

                    // Lock the fields on the sides, they will no longer be used
                    if($isFirst || $isLast) {
                        $neighbor = $isFirst ? $field->getPrev($type) : $field->getNext($type);

                        if(!empty($neighbor)) {
                            $neighbor->setBlock(true);
                        }

                        if ($isFirst && $neighbor) {
                            $neighbor->addWordsStarted($_word);
                        }
                    }

                    // Set the letter for the field
                    if(is_null($field->getChar())) {
                        $field->setChar($char);
                    }

                    // Set the column or line on which the word is located
                    // And also fields or columns that affect the word
                    if($type == self::TYPE_COLUMN) {
                        $_word->setBaseColumn($field->getColumn());
                        $_word->addRow($field->getRow());
                    } elseif($type == self::TYPE_ROW) {
                        $_word->setBaseRow($field->getRow());
                        $_word->addCol($field->getColumn());
                    }

                    $isFirst = false;
                    $count++;
                }
                // Now the word is used in a crossword puzzle.
                $_word->setIsUsed(true);

                return true;
            }
        }
        return false;
    }

    /**
     * @return null|string
     */
    public function getType() {
        return $this->type;
    }

    /**
     *
     */
    public function resetMask() {
        $this->mask = '';
    }

    /**
     * @param $mask
     */
    public function setMask($mask) {
        $this->mask = (string) $mask;
    }

    /**
     * @return int
     */
    public function getIndex() {
        return $this->index;
    }

    /**
     * @param $index
     */
    public function setIndex($index) {
        $this->index = (int) $index;
    }

    /**
     * @return array|Field[]
     */
    public function getFields() {
        return $this->fields;
    }

    /**
     * @param $index
     * @return bool
     */
    public function getByIndex($index) {
        $fields = $this->getFields();
        if(array_key_exists($index, $fields)) {
            return $fields[$index];
        }
        return false;
    }

    /**
     * Returns neighbors
     *
     * @abstract
     */
    abstract public function getNeighbors();

    /**
     * Adding a field to a line
     *
     * @abstract
     * @param Field $field
     */
    abstract public function addField(Field $field);

}