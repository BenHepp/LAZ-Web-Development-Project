<?php

namespace LAZ\example\businessObjects\Collection;

use LAZ\example\businessObjects\Line\Row as LineRow;

/**
 * String collection
 */
class Row extends Collection
{

    /**
     * @param LineRow $rol
     */
    public function addRow(LineRow $rol) {
        parent::add($rol, $rol->getIndex());
    }

    /**
     * @return array
     */
    public function getRows() {
        return $this->items;
    }

}
