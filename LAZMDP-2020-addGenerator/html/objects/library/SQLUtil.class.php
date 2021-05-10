<?php
namespace LAZ\objects\library;


class SQLUtil {
    
    //Construct sql fragment of the form colname = expression[, colname = expression ...]
    static function getValuesEqualSql($values, $columnNames = null) {
        //If valid column name provided (recommended), remove invalid columns
        if (!is_null($columnNames)) {
            foreach ($values as $key => $value) {
                if (!in_array($key, $columnNames)) {
                    unset($values[$key]);
                }
            }
        }
        return join(', ', array_map(function ($key, $value) {
            if (is_null($value)) {
                $assignValue = 'null';
            } else {
                $assignValue = '\'' . addslashes($value) . '\'';
            }
            return "$key = $assignValue";
        }, array_keys($values), $values));
    }

    static function parameterizedDictionary($map){
        $params = array();
        foreach ($map as $name => $parameter) {
            $params[$name] = SQLUtil::asQueryParameter($parameter);
        }

        return $params;
    }

    static function escapeString($parameter){
        return addslashes($parameter);
    }

    static function asQueryParameter($parameter){
        if(is_null($parameter) || !isset($parameter)){
            return "null";
        } else {
            return "'".addslashes($parameter)."'";
        }
    }
}