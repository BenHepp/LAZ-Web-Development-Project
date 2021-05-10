<?
namespace LAZ\objects\base;


/**
 *This is a core class for subclassing.
 *Observable fully implements the 'Observable' design pattern
 *Basically this allows all objects to talk to eachother.
 *
 *The Observer and Observable patterns are part of Suns Java API since Java 1.2
 *See below for more info on PHP implementations
 *
 *An Observer.class.php, Observerable.class.php and Messenger.class.php where coded for the
 *original set of objects [for RAZ 2] (That is what allowed the orignal Debug object to work).
 *
 *@author	Learningpage.com, Inc
 *@version	2	Feb 25, 2004
 *@package base
 *@see		http://www.phppatterns.com/index.php/article/articleview/27/1/1/
 *@todo This should probably be a core package class
 */
class Observable {
	
	/**
	 *@var	array	_observers is an array of _reference_ objects. they will get the broadcast();
	 */
	var $_observers;
	
	/**
	 *Usage: $observed = new Observable($observer);
	 *
	 *@param	Object	$observer
	 */
	function __construct(&$observer = null) {
		$this->_observers = array();
		
		if ($observer != null) {
			$this->setObserver($observer);
		}
		return true;
	}
	
	/**
	 *Creates a reference of the passed object and stores that in it's
	 *internal _observers array, so that $this can be observed by $observer
	 *
	 *Usage: $someObj->setObserver( $someOtherObj );
	 *
	 *@param	object	Observer to observe this object
	 *@return	bool	Only true at this point
	 *@see		Usage
	 */
	function setObserver(&$observer) {
		$this->_observers[] =& $observer;
		return true;
	}
	
	/**
	 *This is method sends all observers $signal, which is an associative array
	 *
	 *@param	array	An associative array
	 *@return	bool	Only true
	 */
	function broadcast($signal) {
		$signal['class'] = get_class($this);
		$signal['reference'] =& $this;
		
		$recipients = count($this->_observers);
		for ($i = 0; $i < $recipients; $i++) {
			$this->_observers[$i]->receive($signal);
		}
		return true;
	}
	
	/**
	 *This is the hook to catch signals from observables.
	 *Overriding this implements the Observer pattern
	 *An observer must have this function prototype to handle calls
	 *
	 *@param	array	A referenced associative array, contains a reference of the sending object under key 'reference'
	 *@see		MessageController.class.php
	 */
	/*
	function receive(&$signal) {
	}
	*/
	
	/**
	 *@param	string	The message
	 *@param	string	The optional message type
	 *@return	array	A Signal of level 'notice' and type $type
	 */
	function makeNotice($message, $type = false) {
		$signal = array();
		$signal['message'] = $message;
		$signal['level'] = "notice";
		if ($type) {
			$signal['type'] = $type;
		}
		return $signal;
	}

	/**
	 *@param	string	The message
	 *@param	string	The optional message type
	 *@return	array	A Signal of level 'warning' and type $type
	 */	
	function makeWarning($message, $type = false) {
		$signal = array();
		$signal['message'] = $message;
		$signal['level'] = "warning";
		if ($type) {
			$signal['type'] = $type;
		}
		return $signal;
	}

	/**
	 *@param	string	The message
	 *@param	string	The optional message type
	 *@return	array	A signal of level 'error' and type $type
	 */	
	function makeError($message, $type = false) {
		$signal = array();
		$signal['message'] = $message;
		$signal['level'] = "error";
		if ($type) {
			$signal['type'] = $type;
		}
		return $signal;
	}

	/**
	 *@param	string	The message
	 *@param	string	The optional essage type
	 *@return	array	A signal of level 'request' and type $type
	 */	
	function makeRequest($message, $type = false) {
		$signal = array();
		$signal['message'] = $message;
		$signal['level'] = "request";
		if ($type) {
			$signal['type'] = $type;
		}
		return $signal;
	}
}
?>
