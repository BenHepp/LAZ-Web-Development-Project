<?php

namespace LAZ\example\businessObjects\Generate;

use LAZ\example\businessObjects\Crossword;
use LAZ\example\businessObjects\Word;

/**
 * Crossword Generation Base Class
 *
 * To create a new type of generation you need:
 *  1. Create a new class inherited from the current one.
 *  2. Write the location functions of the first word. @see $this->_positionFirstWord();
 *  3. Write the location functions of the remaining words. @see $this->_positionWord($word);
 *
 * To place a word on a line or column, you need to call the method CrosswordLine::position();
 */
abstract class Generate{

    /**
     * Max count of crossword generation
     */
    const MAX_GENERATE_ATTEMPTS = 200;

    /**
     * Max count of words positioning
     */
    const MAX_WORD_POSITION_ATTEMPTS = 200;

    /**
     * Type of generation. Random
     */
    const TYPE_RANDOM = 'random';

    /**
     * Type of generation. Based on a single word vertically
     */
    const TYPE_BASE_LINE_COLUMN = 'baseLine\\Column';

    /**
     * Type of generation. Based on one word horizontally
     */
    const TYPE_BASE_LINE_ROW = 'baseLine\\Row';

    /**
     * Type of generation. Based on a single number
     */
    const TYPE_SEED = 'seed';

    /**
     * @var \LAZ\example\businessObjects\Crossword
     */
    protected $crossword;

    /**
     * @param \LAZ\example\businessObjects\Crossword $crossword
     */
    public function __construct(Crossword $crossword)
    {
        $this->crossword = $crossword;
    }

    /**
     * @param bool $needAllWords Generate crossword with all words
     * @param int $maxGenerateAttempts Max count of crossword generation
     * @param int $maxWordPositionAttempts Max count of words positioning
     *
     * @return bool Return true if crossword is generated
     */
    public function generate(
        $needAllWords = false,
        $maxGenerateAttempts = self::MAX_GENERATE_ATTEMPTS,
        $maxWordPositionAttempts = self::MAX_WORD_POSITION_ATTEMPTS
    ) {
        while ($maxGenerateAttempts != 0) {
            $crossword = $this->crossword;
            $isPosition = $this->positionFirstWord();
            $maxWordPositionAttemptsInGenerate = $maxWordPositionAttempts;

            if (!$isPosition) {
                $maxGenerateAttempts--;
                $this->crossword->clear();
                continue;
            }

            while ($maxWordPositionAttemptsInGenerate != 0) {
                $words = $crossword->getWords()->notUsed();

                if ($words->notEmpty()) {
                    $this->positionWord($words->getRandom());
                } else {
                    break;
                }

                $maxWordPositionAttemptsInGenerate--;
            }

            // If need all words and we have not used - regenerate crossword
            if ($needAllWords && count($crossword->getWords()->notUsed())) {
                $maxGenerateAttempts--;
                $this->crossword->clear();
                continue;
            }

            return true;
        }

        if ($needAllWords && count($this->crossword->getWords()->notUsed())) {
            return false;
        }

        return true;
    }

    /**
     * First word location function
     *
     * @abstract
     */
    abstract protected function positionFirstWord();

    /**
     * Location Functions for Other Words
     *
     * @abstract
     * @param LAZ\example\businessObjects\Word $word
     * @return
     */
    abstract protected function positionWord(Word $word);

    /**
     * @static
     * @param string $generateType SELF::TYPE_*
     * @param \LAZ\example\businessObjects\Crossword $crossword
     * @return Generate
     * @throws \Exception
     */
    static public function factory($generateType, Crossword $crossword)
    {
        $generateType = ucfirst($generateType);
        $className = 'LAZ\\example\\businessObjects\\Generate\\' . $generateType;
        if(class_exists($className)) {
            return new $className($crossword);
        }
        throw new \Exception('Class not found ' . $className);
    }

    /**
     * @return mixed CrosswordLineRow
     */
    protected function getCenterRow()
    {
        return $this->crossword->getRows()->getByIndex((int) round($this->crossword->getRowsCount() / 2));
    }

    /**
     * @return mixed CrosswordLineCol
     */
    protected function getCenterCol()
    {
        return $this->crossword->getColumns()->getByIndex((int) round($this->crossword->getColumnsCount() / 2));
    }

}