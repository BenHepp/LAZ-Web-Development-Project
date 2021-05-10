<?
namespace LAZ\objects\tools;



class RedirectingErrorHandler {
    private $logger;
    
    function __construct() {
        $this->logger = new Logger('RedirectingErrorHandler');
    }
    
    function receive($signal) {
        $this->printError($signal['message'], $signal['class']);
        $this->handleError($signal);
    }
    
    function printError($message, $sender) {
        $this->logger->logError("$message from $sender");
    }
    
    function handleError($signal=NULL) {
        $this->redirect('/');
    }
    
    function redirect($location) {
        header("Location: $location");
        exit();
    }
}

