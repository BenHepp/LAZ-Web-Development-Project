<?php

namespace LAZ\example\businessObjects\Generate\BaseLine;

use LAZ\example\businessObjects\Generate\Generate;
use LAZ\example\businessObjects\Line\Line;
use LAZ\example\businessObjects\Word;

/**
 * 1 Word crossword generation
 */
abstract class BaseLine extends Generate
{

    /**
     * @var \LAZ\example\businessObjects\class
     */
    protected $firstWord;

    /**
     * @return \LAZ\example\businessObjects\Line\Line
     */
    abstract protected function getCenterLine();

    /**
     * @return \LAZ\example\businessObjects\Line\Line
     */
    abstract protected function getBaseLine();

    protected function positionFirstWord()
    {
        $centerLine = $this->getCenterLine();
        $mask = $centerLine->getMask();

        $word = $this->crossword->getWords()->getByMask($mask, true);

        if(!empty($word)) {
            $this->firstWord = $word;

            $centerLine->position($word, true, Line::PLACE_LEFT);
            return true;
        }
        return false;
    }

    protected function positionWord(Word $word)
    {
        $line = $this->getBaseLine();

        if(!empty($line)) {
            $line->position($word, false);
        }
    }

}