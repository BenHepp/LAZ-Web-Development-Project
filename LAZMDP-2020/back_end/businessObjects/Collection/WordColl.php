<?php

namespace LAZ\example\businessObjects\Collection;
use LAZ\example\businessObjects\Word;
/**
 * Collection of words
 */
class WordColl extends Collection
{

    /**
     * @param array $words
     */
    public function __construct(array $words = array())
    {
        foreach($words as $key => $word) {
            $params = [];

            if (is_array($word)) {
                $params = $word;
                $word = $key;
            }

            parent::add(new Word($word, $params));
        }
    }

    /**
     * Returns a random word by mask
     *
     * @param string $mask Pattern
     * @param bool $most Greatest word (most common?)
     * @return bool WordColl
     */
    public function getByMask($mask, $most = false)
    {
        $words = new WordColl();
        foreach($this as $word) {
            if($word->inMask($mask)) {
                $words->add($word);
            }
        }
        if($most) {
            $most = null;
            foreach($words as $word) {
                if(empty($most)) {
                    $most = $word;
                //} elseif(mb_strlen($word->getWord(), 'UTF-8') > mb_strlen($most->getWord(), 'UTF-8')) {
                } elseif( strlen($word->getWord()) >  strlen($most->getWord())) {
                    $most = $word;
                }
            }
            return $most;
        }
        return $words->getRandom();
    }

    /**
     * @return WordColl Collection of unused words
     */
    public function notUsed()
    {
        $words = new WordColl();
        foreach($this->getwords() as $word) {
            if(!$word->isUsed()) {
                $words->add($word);
            }
        }
        return $words;
    }

    /**
     * @return bool|\LAZ\example\businessObjects\Word Random word from the collection
     */
    public function getRandom()
    {
        $words = $this->getWords();
        if(!empty($words)) {
            $randKey = array_rand($words);
            return $words[$randKey];
        }
        return false;
    }

    /**
     * @return \LAZ\example\businessObjects\Word[]
     */
    public function getWords()
    {
        return $this->items;
    }
}
