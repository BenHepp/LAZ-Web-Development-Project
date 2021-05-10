<?php
namespace LAZ\objects\tools;


/**
 *The Debug Handler extension for the MessageController
 *@package tools
 */
class DebugHandler {
	
	var $_mode;
	
	/**
	 *
	 *
	 */
	function __construct($mode = "TEXT") {
		$this->_mode = strtoupper($mode);
	}
	
	function receive(&$signal) {
		switch ($this->_mode) {
			case "HTML";
				$this->_print("\n<!--");
				$this->_print("LEVEL\t=>\t".$signal['level']);
				$this->_print("TYPE\t=>\t".$signal['type']);
				$this->_print("CLASS\t=>\t".$signal['class']);
				$this->_print("MESSAGE\t=>\t".$signal['message']);
				$this->_print("-->");
				
			break;
			
			case "QUIET":
			break;
			
			case "TEXT":
				$this->_print("\n");
				$this->_print("LEVEL\t=>\t".$signal['level']);
				$this->_print("TYPE\t=>\t".$signal['type']);
				$this->_print("CLASS\t=>\t".$signal['class']);
				$this->_print("MESSAGE\t=>\t".$signal['message']);
				$this->_print("");	//new line
			break;
			
			default:
				$this->_print("\n<!--	DebugHandle hit default 'mode' case -->");
		}
		
	}

	function _print($string) {
		/*
		switch ($this->_mode) {
			case "TEXT":
				echo "\n$string";
			break;
			
			case "HTML":
				echo "<br/>".nl2br($string);
			break;
			
			case "QUIET":
				echo "<!--\n$string\n-->";
			break;
			
			case "LOG":
			break;
			
			default:
			echo "<!-- Hit default DebugHandler mode -->";
		}
		if ($this->_nl2br) {
			echo nl2br("\n$string");
		} else {
			echo "\n$string";
		}
		*/
		echo $string."\n";
	}
}
