<?php
namespace LAZ\example\dataAccess;

use LAZ\objects\data\DataManager;
use LAZ\objects\library\SQLUtil;

class WordsDbGateway {

    /** query word and definition*/
    function getWords($wordsList){
        
        $query = "SELECT word, definition FROM vsc_words WHERE ";
        foreach ($wordsList as $word) {
            $query .= "word = '$word' OR ";
        }
        $query = substr($query, 0, -4);

        //$query = "SELECT word, definition FROM vsc_words WHERE vsc_words_id <= 10";
        //uncomment this to get random words
        //$query = "SELECT word, definition FROM vsc_words ORDER BY RAND() LIMIT " . $numWords;
        $exampleDm = $this->getDataManager();
        $exampleDm->query($query);
        return $exampleDm->fetchAll();
    }

    /** @return DataManager */
    public function getDataManager() {
        return new DataManager(DataManager::DB_EXAMPLE, DataManager::LOC_MASTER);
    }
}