<?php

namespace LAZ\example\businessObjects\Collection;
use LAZ\example\businessObjects\Line\Column as LineCol;

/**
 * Column Collection
 */
class Column extends Collection{

    /**
     * @param LineCol $col
     */
    public function addCol(LineCol $col){
        parent::add($col, $col->getIndex());
    }

    /**
     * @return array
     */
    public function getColumns(){
        return $this->items;
    }

}
