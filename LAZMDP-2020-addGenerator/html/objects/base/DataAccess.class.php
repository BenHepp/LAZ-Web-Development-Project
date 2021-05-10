<?php
namespace LAZ\objects\base;


abstract class DataAccess implements IDataAccess {

	protected $dbGateway;
	
	public function getDbGateway() {		
		return $this->dbGateway;
	}

    protected static function addPropertyIfExists(&$toArray, $toProperty, $fromArray, $fromProperty){
        if(array_key_exists($fromProperty, $fromArray)){
            $toArray[$toProperty] = $fromArray[$fromProperty];
        }
        return $toArray;
    }
}