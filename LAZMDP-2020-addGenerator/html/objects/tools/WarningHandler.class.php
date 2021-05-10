<?
namespace LAZ\objects\tools;


/**
 *Warning Handler for MessageController
 *@package	tools
 */
class WarningHandler {
	
	function __construct() {
	}
	
	function receive(&$signal) {
		$this->printWarning($signal['message'], $signal['class']);
	}
	
	function printWarning($message, $sender) {
		echo '<div id="warning">'."\n";
		echo '<h4 id="warning">';
		echo "Warning: ".$message;
		echo '</h4>';
		echo "<span> From ".$sender."</span>";
		echo "\n".'</div>';
	}
}
