<?php

namespace LAZ\objects\tools;

use Monolog\Formatter\LineFormatter;
use Monolog\Handler\StreamHandler;
use Monolog\Processor\PsrLogMessageProcessor;
use Psr\Log\AbstractLogger;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

/**
 * Logging class used for file based logging.
 */
class Logger extends AbstractLogger {
    /**
     * @var Monolog\Logger;
     */
    private $monoLogger;

    /**
     * @var string
     */
    private $logFilename;

    /**
     * Create and set the logFile
     * $logFile String log filename, if blank, no log file is created
     */
    function __construct($logFile, $forUsage = false) {
        if ($logFile == '' || $logFile == null) {
            throw new \InvalidArgumentException('Log file name required');
        }

        // file path for the logger
        $logPath = isset($_ENV['LOG_PATH']) ? $_ENV['LOG_PATH'] : false;

        // no log path
        if (!$logPath) {
            trigger_error("The LOG_PATH environment variable has not been set.");
        }
        //no permission to use the path
        if (!is_dir($logPath)) {
            trigger_error("The LOG_PATH given does not exist: " . $logPath);
        }
        if (!is_writable($logPath)) {
            trigger_error("The LOG_PATH given is not writable: " . $logPath);
        }

        $logFileElements = explode('\\', $logFile); // only variables can be passed by ref to array_pop
        $logName = array_pop($logFileElements);

        $usageSuffix = $forUsage ? '_usage' : '';
        $this->logFilename = "$logPath/$logName$usageSuffix." . date("Y-m-d") . ".log";
        $this->monoLogger = new \Monolog\Logger($logName);
        $streamHandler = new StreamHandler($this->logFilename, self::getMonologLevel(), true, 0666);
        $streamHandler->setFormatter(new LineFormatter(
            $forUsage
            //TODO Can we remove the leading double quote from the usage logs?
                ? '"%datetime%%message%' . PHP_EOL
                : '%datetime%  | %extra.psr_level_name% | %message%' . PHP_EOL,
            'd M Y H:i:s'));
        $this->monoLogger->pushHandler($streamHandler);
        $this->monoLogger->pushProcessor(new PsrLogMessageProcessor());
        $this->monoLogger->pushProcessor(function ($record) {
            $record['extra']['psr_level_name'] = strtolower($record['level_name']);
            return $record;
        });
    }

    /**
     * @inheritdoc
     */
    public function log($level, $message, array $context = array()) {
        $this->monoLogger->log($level, self::toMessageString($message), $context);
    }

    /**
     * Get the log filename
     *
     * @return string
     */
    public function getLogFile() {
        return $this->logFilename;
    }

    /**
     * @deprecated Use error
     * @see error
     */
    function logUsage($message) {
        $this->error($message);
    }

    /**
     * Log a message or object at the error log level.
     * @deprecated Use error
     * @see error
     * @param string or object $message  This can be either a string or an object.  Objects will
     * be expanded out in the log.
     */
    function logError($message) {
        $this->error($message);
    }

    /**
     * Log a message or object at the info log level.
     * @deprecated Use info
     * @see info
     * @param string or object $message  This can be either a string or an object.  Objects will
     * be expanded out in the log.
     */
    function logInfo($message) {
        $this->info($message);
    }

    /**
     * Log a message or object at the warning log level.
     * @deprecated Use warning
     * @see warning
     * @param string or object $message  This can be either a string or an object.  Objects will
     * be expanded out in the log.
     */
    function logWarning($message) {
        $this->warning($message);
    }

    /**
     * Log a message or object at the debug log level.
     * @deprecated Use debug
     * @see debug
     * @param string or object $message  This can be either a string or an object.  Objects will
     * be expanded out in the log.
     */
    function logDebug($message) {
        $this->debug($message);
    }

    private static function toMessageString($message) {
        if (is_object($message)) {
            if (method_exists($message, '__toString')) {
                return (string)$message;
            } else {
                return print_r($message, true);
            }
        } elseif (is_array($message)) {
            return print_r($message, true);
        } else {
            return $message;
        }
    }

    private static function getMonologLevel() {
        try {
            return \Monolog\Logger::toMonologLevel(isset($_ENV['LOG_LEVEL']) ? $_ENV['LOG_LEVEL'] : LogLevel::DEBUG);
        } catch (\InvalidArgumentException $e) {
            return \Monolog\Logger::DEBUG;
        }
    }
}