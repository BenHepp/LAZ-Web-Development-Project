<?php
namespace LAZ\objects\library;

use DateTime;
use JsonSerializable;
use LAZ\objects\data\DataManager;
use LAZ\objects\tools\Logger;
use LAZ\objects\tools\BadSessionContextLogger;

class PHPUtil {
    //return the value if variable is set, default otherwise
    static function valueOrDefault($value, $default) {
        return isset($value) ? $value : $default;
    }

    static function json_encode_windows1252($object) {
    	$utf8Object = PHPUtil::convertObjectToUtf8($object);
    	return PHPUtil::json_encode($utf8Object, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE);
    }

    static function convertObjectToUtf8 ($data) {
    	if (!is_array($data)) {
    		if (is_string($data)) {
    		   return utf8_encode($data);
    		}
    		return $data;
    	}
    	$result = array();
    	foreach ($data as $index=>$item) {
            $index = is_string($index)? utf8_encode($index) : $index;
    		if (is_array($item)) {
    			$result[$index] = array();
    			foreach($item as $key=>$value) {
                    $key = is_string($key)? utf8_encode($key) : $key;
    				if ($value instanceof JsonSerializable) {
                        $result[$index][$key] = PHPUtil::convertObjectToUtf8($value->jsonSerialize());
                    } else {
                        $result[$index][$key] = PHPUtil::convertObjectToUtf8($value);
                    }
    			}
    		}
    		else if ($item instanceof JsonSerializable) {
                $result[$index] = PHPUtil::convertObjectToUtf8($item->jsonSerialize());
            }
    		else if (is_object($item)) {
    		    // TODO: do we want to utf8 encode object property names?
    			$result[$index] = array();
    			foreach(get_object_vars($item) as $key=>$value) {
    				$result[$index][$key] = PHPUtil::convertObjectToUtf8($value);
    			}
    		}
    		else {
    			$result[$index] = PHPUtil::convertObjectToUtf8($item);
    		}
    	}
    	return $result;
    }

    static function json_decode_windows1252($object) {
    	$utf8Object = json_decode($object, true);
        return PHPUtil::convertObjectFromUtf8($utf8Object);
    }

    static function convertObjectFromUtf8 ($data) {
    	if (!is_array($data)) {
    		if (is_string($data)) {
    		   return utf8_decode($data);
    		}
    		return $data;
    	}
    	$result = array();
    	foreach ($data as $index=>$item) {
    		if (is_array($item)) {
    			$result[$index] = array();
    			foreach($item as $key=>$value) {
    				$result[$index][$key] = PHPUtil::convertObjectFromUtf8($value);
    			}
    		}
    		else if (is_object($item)) {
    			$result[$index] = array();
    			foreach(get_object_vars($item) as $key=>$value) {
    				$result[$index][$key] = PHPUtil::convertObjectFromUtf8($value);
    			}
    		}
    		else {
    			$result[$index] = PHPUtil::convertObjectFromUtf8($item);
    		}
    	}
    	return $result;
    }

    static function snakeToCamel($val) {
        return str_replace(' ', '', ucwords(str_replace('_', ' ', $val)));
    }

    static function camelToSnake($val) {
        $val = lcfirst($val);
        return  preg_replace_callback('/([A-Z])/',
                               function ($match) { return '_' . strtolower($match[0]); },
                               $val);
    }

    /*
     * Return first arg that isset
     */
    static function firstSet() {
        $args = func_get_args();
        foreach ($args as $arg) {
            if (isset($arg)) {
                return $arg;
            }
        }
        return null;
    }
    
    /*
     * Return if an array is indexed or not
     */
    public static function isIndexedArray($array) {
        return (is_array($array) && $array === array_values($array));
    }

    /*
     * Shifts the associative array into a single element indexed array containing the associative array.
     * If the array is already indexed, the array is returned untouched.
     */
    public static function shiftAssociativeArray($array) {        
        if (is_array($array) && !self::isIndexedArray($array)) {
            $tempArray = $array;
            unset($array);
            $array[] = $tempArray;
        }
        return $array;
    }
    
    /**
     * Returns true if the check date is before the comparison date
     * 
     * @param string $dateStringToCheck <p>The date to check</p>
     * @param string $dateStringCompare <p>The date to compare against</p>
     * @return boolean
     */
    public static function isDateStringBefore($dateStringToCheck, $dateStringCompare) {
        $isDateTimeBefore = false;
        if (!empty($dateStringToCheck) && !empty($dateStringCompare)) {
            $dtA = new DateTime($dateStringToCheck);
            $dtB = new DateTime($dateStringCompare);
            $isDateTimeBefore = $dtA < $dtB;
        }
        return $isDateTimeBefore;
    }
    
    /**
     * Returns true if the check date is after the comparison date
     *
     * @param string $dateStringToCheck <p>The date to check</p>
     * @param string $dateStringCompare <p>The date to compare against</p>
     * @return boolean
     */   
    public static function isDateStringAfter($dateStringToCheck, $dateStringCompare) {
        $isDateTimeAfter = false;
        if (!empty($dateStringToCheck) && !empty($dateStringCompare)) {
            $dtA = new DateTime($dateStringToCheck);
            $dtB = new DateTime($dateStringCompare);
            $isDateTimeAfter = $dtA > $dtB;
        }
        return $isDateTimeAfter;
    }

    /**
     * Returns true if the check date is between date1 and date2 inclusive
     *
     * @param string $dateStringToCheck <p>The date to check</p>
     * @param string $dateStringCompareStart <p>The start date to compare against</p>
     * @param string $dateStringCompareEnd <p>The end date to compare against</p>
     * @return boolean
     */
    public static function isDateStringBetween($dateStringToCheck, $dateStringCompareStart, $dateStringCompareEnd) {
        $isDateTimeBetween = false;
        if (!empty($dateStringToCheck) && !empty($dateStringCompareStart) && !empty($dateStringCompareEnd)) {
            $dtA = new DateTime($dateStringToCheck);
            $dtB = new DateTime($dateStringCompareStart);
            $dtC = new DateTime($dateStringCompareEnd);
            $isDateTimeBetween = $dtA >= $dtB && $dtA <= $dtC;
        }
        return $isDateTimeBetween;
    }
    
    /**
     * Transform arrays with array-like keys (e.g. $foo['bar[bip]'] = 1) to structured array (as is done for $_POST in forms) (e.g. $foo['bar']['bip'] = 1)
     * Useful for array-like fieldnames in queries
     * @param  $array
     */
    static function parseAsKeyedArray($array) {
        $result = array();
        foreach ($array as $key => $value) {
            if (strpos($key, '[') !== false) {
                $key = urlencode($key);
                $value = urlencode($value);
                $parsedValue = array();
                parse_str("$key=$value", $parsedValue);
                $result = array_merge_recursive($result, $parsedValue);
            } else {
                $result[$key] = $value;
            }
        }
        return $result;
    }
    
    /**
     * Transform array of keyed arrays (e.g. from fetchAll) using parseAsKeyedArray 
     * Usually used with fetchAll
     * @param  $array
     */
    static function parseAllAsKeyedArray($array) {
        return array_map('self::parseAsKeyedArray', $array);
    }

    /**
     * Convert array of uniform associative arrays (e.g. query result set) to array keyed by one of the columns
     */
    static function keyArrayByColumn($array, $columnKey) {
        return array_combine(array_column($array ?: [], $columnKey), $array);
    }

    /**
     * Strip string of non windows-1252 characters
     */
    static public function convertString( $source, $target_encoding ) {
        // detect the character encoding of the incoming text
        $encoding = mb_detect_encoding( $source, "auto" );
    
        // escape all of the question marks so we can remove artifacts from
        // the unicode conversion process
        $target = str_replace( "?", "[question_mark]", $source );

        // convert the string to the target encoding
        $target = mb_convert_encoding( $target, $target_encoding, $encoding);

        // remove any question marks that have been introduced because of illegal characters
        $target = str_replace( "?", "", $target );

        // replace the token string "[question_mark]" with the symbol "?"
        $target = str_replace( "[question_mark]", "?", $target );

        return $target;
    }
    
    /**
     * Strip a string of (most) unnecessary characters
     */
    
    static public function stripSpecialCharacters($source) {
    	$result = trim(strip_tags($source));
    	
    	$result = self::convertString($result, "WINDOWS-1252");
    	
    	return $result;
    }
    
    /**
     * Wrapper around json_encode() that will detect and log errors in the encoding process.
     * For now, if the json_encode() attempt fails, this will attempt to convert from 1252 to utf8, then retry
     * the json_encode() operation.
     * @param $input
     * @param int $options Optional - the normal flags for json_encode().
     * @return string the json-encoded input.
     */
    static public function json_encode($input, $options=null) {
        $result = null;
        if (is_null($options)) {
            $result = json_encode($input);
        } else {
            $result = json_encode($input, $options);
        }
        
        $jsonLastError = json_last_error();
        if ($jsonLastError != JSON_ERROR_NONE) {
            // Don't log in this case - we expect a *lot* of traffic through this path now.
            /*
            $logger = new Logger('JsonEncodeError');
            $logger->logError("PHPUtil::json_encode() encountered encoding error [$jsonLastError].  Stack trace and encode source follow.");
            $logger->logError("Stack trace:");
            BadSessionContextLogger::logTrace($logger);
            $logger->logError("Encode source:");
            $trimmedDebugOutput = print_r($input, true);
            if (strlen($trimmedDebugOutput) > 1000) {
                $trimmedDebugOutput = substr($trimmedDebugOutput, 0, 1000) . "\n...\n";
            }
            $logger->logError($trimmedDebugOutput);
            */
            $utf8EncodedInput = PHPUtil::convertObjectToUtf8($input);
            
            if (is_null($options)) {
                $result = json_encode($utf8EncodedInput);
            } else {
                $result = json_encode($utf8EncodedInput, $options);
            }
            $jsonLastError = json_last_error();
            
            if ($jsonLastError != JSON_ERROR_NONE) {
                $logger = new Logger('JsonEncodeError');
                $logger->logError("Stack trace:");
                BadSessionContextLogger::logTrace($logger);
                $logger->logError("Encode source:");
                $trimmedDebugOutput = print_r($input, true);
                if (strlen($trimmedDebugOutput) > 1000) {
                    $trimmedDebugOutput = substr($trimmedDebugOutput, 0, 1000) . "\n...\n";
                }
                $logger->logError("PHPUtil::json_encode() json encode attempt after conversion from 1252 to utf8 also failed.");
            }
        }
        
        return $result;
    }

    /*
     * These are the unix settings detected in php -i for mb_string
        mbstring.detect_order => no value => no value
        mbstring.encoding_translation => Off => Off
        mbstring.func_overload => 0 => 0
        mbstring.http_input => no value => no value
        mbstring.http_output => no value => no value
        mbstring.http_output_conv_mimetypes => ^(text/|application/xhtml\+xml) => ^(text/|application/xhtml\+xml)
        mbstring.internal_encoding => no value => no value
        mbstring.language => neutral => neutral
        mbstring.strict_detection => Off => Off
        mbstring.substitute_character => no value => no value
     */
    public static function convertEncodingToWin1252AndRemoveSpecialChars($str) {
        $encoding = mb_detect_encoding($str, 'auto');
        if ($encoding == "UTF-8") {
            $str = mb_convert_encoding($str, "Windows-1252", $encoding);
        }
        //145: _‘_, 146: _’_, 147: _“_, 148: _”_, 150: _–_, 151: _—_, 133: _…_
        $str = str_replace(
            array(chr(145), chr(146), chr(147), chr(148), chr(150), chr(151), chr(133)),
            array("'", "'", '"', '"', '-', '--', '...'),
            $str);

        return $str;
    }

    /**
     * Returns the first value of the provided array
     * @param $array
     * @return mixed
     */
    public static function getFirstArrayValue($array) {
        foreach ($array as $value) return value;
    }

    public static function convertFlvToMp3($recordingId, $shardId, $path) {
        list($usec, $sec) = explode(" ", microtime());
        $timeOfRequest = $sec . substr($usec, 2, 3);

        $ffmpegDir = "/k12/products/admin/ffmpeg";
        if(strtolower(current(explode(" ", php_uname()))) == 'windows'){
            $ffmpegDir = "c:/ffmpeg/bin/ffmpeg.exe";
        }
        if (!file_exists($ffmpegDir)) {
            mkdir($ffmpegDir);
        }
        $mp3Dir = "$ffmpegDir/mp3";
        if (!file_exists($mp3Dir)) {
            mkdir($mp3Dir);
        }
        $mp3Subdir = $timeOfRequest;
        if (!file_exists("$mp3Dir/$mp3Subdir")) {
            mkdir("$mp3Dir/$mp3Subdir");
        }

        $subdirectory = substr('000'.$recordingId, -3);
        $directory = $path . 'shard'.$shardId.'/students/'.$subdirectory.'/';
        $mp3FileWithPath = $directory.$recordingId.'.mp3';

        $success = false;
        if (is_file($mp3FileWithPath) && file_exists($mp3FileWithPath)) {
            $success = true;
        } else {
            $sql = "select student.student_first_name, student.student_last_name, ifnull(raz_books.title, rk_resources.name) book_title 
                    from student
                    join student_account on student.student_id = student_account.student_id
                    join recording on recording.student_account_id = student_account.student_account_id
                    join rk_content.rk_resources rk_resources on recording.resource_id = rk_resources.id 
                    left join raz_content.book_description_tb raz_books on raz_books.BookID = rk_resources.raz_book_id and raz_books.LanguageID = 1 
                    where recording.recording_id = $recordingId";

            $rkActivityDm = new DataManager(DataManager::DB_RK_ACTIVITY, DataManager::LOC_MASTER, $shardId);
            $rkActivityDm->query($sql);
            $metaData = array();
            if ($rkActivityDm->rowsSelected() > 0) {
                $metaData = $rkActivityDm->fetch();
                $studentFirstName = ucwords(trim(strtolower(preg_replace('/[^\w]/', '', $metaData['student_first_name']))));
                $studentLastName = ucwords(trim(strtolower(preg_replace('/[^\w]/', '', $metaData['student_last_name']))));

                $bookTitle = trim(strtolower(preg_replace('/[^\w \s]/', '', $metaData['book_title'])));
                $bookTitle = preg_replace('/^(a |the |we |he |she |they |an |for)/', '', $bookTitle);
                $bookTitle = preg_replace('/( a | the | we | he | she | they | an | for )/', ' ', $bookTitle);
                $bookTitleWords = preg_split('/\s+/', ucwords(trim($bookTitle)));
                if (sizeof($bookTitleWords) > 3) {
                    $bookTitle = $bookTitleWords[0] . $bookTitleWords[1] . $bookTitleWords[2];
                } else {
                    $bookTitle = join('', $bookTitleWords);
                }
                $metaData['student_first_name'] = $studentFirstName;
                $metaData['student_last_name'] = $studentLastName;
                $metaData['book_title'] = $bookTitle;
            } else {
                $metaData['student_first_name'] = 'unknown';
                $metaData['student_last_name'] = '';
                $metaData['book_title'] = 'unknown';
            }
            $mp3FileName = "$mp3Subdir/$recordingId.mp3";
            $mp3 = "$mp3Dir/$mp3FileName";
            $bitRate = $_ENV['mp3_bit_rate'];

            $flvDir = "00" . $recordingId;
            if (strlen($flvDir) > 3) {
                $flvDir = substr($flvDir, - 3);
            }

            $flvFileName = $recordingId . ".flv";
            $flv = "{$_ENV['ARCHIVED_RECORDINGS_STORAGE_ROOT']}$shardId/students/$flvDir/$flvFileName";

            $stats = trim(preg_replace('/(=\s*)/', '=', exec("/tools/ffmpeg -i $flv -vn -acodec libmp3lame -ar 44100 -ab {$bitRate}k -ac 2 $mp3 2>&1 | grep size")));
            $logger = new Logger("mp3Conversion", true);
            $accountId = $_SESSION['teacherAccountInfo']['account_id'];
            if ((file_exists($mp3)) && (filesize($mp3) > 0)) {
                $stats = substr($stats, 0, strpos($stats, '/s') + 2);
                exec("/tools/id3v2 --album \"Raz Kids\" --artist \"{$metaData['student_first_name']} {$metaData['student_last_name']}\" --song \"{$metaData['book_title']}\" $mp3");
                $logger->logInfo(" success ==> account=$accountId flv=$flvFileName sampling=44100Hz $stats mp3=$mp3FileName");
                rename($mp3, $mp3FileWithPath);
                $success = true;
            } else {
                touch($mp3);
                $logger->logError(" failure ==> account=$accountId flv=$flvFileName sampling=44100Hz mp3=$mp3FileName");
                $success = false;
            }
        }

        return $success;
    }

    /**
     * Support function for interfaces that take scalar values or arrays of values.  Normalize scalars/array inputs to array.
     */
    public static function scalarToArray($value) {
        return is_array($value) ? $value : [$value];
    }

    /**
     * Evaluates, captures, and returns the contents of a specified file
     * @param string $file - the path to the included html file
     * @param array $vars - key value pairs of variables $file depends on
     * @return string
     */
    public static function include2string($file, array $vars = array()) {
        extract($vars);
        ob_start();
        include($file);
        return addslashes(trim(str_replace(array("\r", "\n"), '', ob_get_clean())));
    }

    public static function isAssociative($array) {
        return array_values($array) !== $array;
    }

    public static function getDirectory($location) {
        $directoryLocation = $location;
        if (!file_exists($directoryLocation)) {
            mkdir($directoryLocation, 0777);
        }
        return $directoryLocation;
    }

    public static function asArrayOfInt(array $array) {
        return array_map(function ($item) {
           return (int)$item;
        }, $array);
    }

    public static function asSetOfInt($array) {
        $result = [];
        foreach ($array as $key => $value) {
            $result[(int) $value] = (int) $value;
        }
        return $result;
    }

    public static function array_concat(&$arr_1, $arr_2) {
        if($arr_2) {
            foreach($arr_2 as $elem) array_push($arr_1, $elem);
        }
    }

    /**
     * Gets Associative Array Difference recursively, preserving the empty array and using a soft comparison
     * @param array $array1
     * @param array $array2
     * @return null | array The filtered array or null if everything has been filtered and array1 didn't start as the empty array.
     * */
    public static function arrayDifferenceRecursive(array $array1, array $array2){
        $difference = [];
        foreach($array1 as $array1Index => $array1Value){
            if(is_array($array1Value)){
                $filteredSubArray = self::arrayDifferenceRecursive($array1Value, $array2[$array1Index]);
                if($filteredSubArray !== null){
                    $difference[$array1Index] = $filteredSubArray;
                }
            } else if($array1Value != $array2[$array1Index]){
                $difference[$array1Index] = $array1Value;
            }
        }

        return (empty($difference) && !empty($array1)) ? null : $difference;
    }

    public static function cloneArrayForKeys($fromArray, ...$keys){
        $result = [];
        foreach($keys as $key){
            if(array_key_exists($key, $fromArray)){
                $result[$key] = $fromArray[$key];
            }
        }
        return $result;
    }

}
