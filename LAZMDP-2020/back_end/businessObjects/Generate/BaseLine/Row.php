<?php

namespace LAZ\example\businessObjects\Generate\BaseLine;

/**
 * Crossword based on one word horizontally
 */
class Row extends BaseLine {

    protected function getCenterLine()
    {
        return $this->getCenterRow();
    }

    protected function getBaseLine()
    {
        return $this->firstWord->getColumns()->getRandom();
    }

}