<?php
namespace LAZ\objects\tools;

use LAZ\objects\base\Observable;

/**
 * An object to handle the displaying of front end content stored in the 'content' table
 *
 *@author	sam
 *@version	1	May	20	2004
 *@package	tools
 */
class Content extends Observable {
	/**
	 *@var array An associative array to store variables to be assigned to a template
	 */
	var $_content_vars;

	/**
	 * @var String location of the current content directory, must _not_ end in a "/"
	 */
	var $_content_location = "content";

	public function __construct($name, &$observer = null) {
		$this->_content_vars = array();
		parent::__construct($observer);
	}

	/**
	 *Include a string as if it were a PHP file
	 */
	public function strInclude($string) {
		foreach ($this->_content_vars as $key => $value) {
			${$key} = $value;
		}
		eval("?>".$string."<?");
	}

	/**
	 *Assign variables to the content pages
	 *@param string	Name of the variable in the content scope
	 *@param mixed	the value of that variable
	 */
	public function assign($key, $value) {
		return $this->_content_vars[$key] = $value;
	}

	/**
	 *Displace a page of content with the name $name
	 *@param string Name of a page of content
	 */
	public function display($name) {
		$this->makeNotice("Begin content '$name'");

		$__filename = $this->_content_location . "/" . $name . ".html";
		$__filename = str_replace(" ", "", $__filename);

		if (!file_exists($__filename)) {
		  $this->makeNotice("File not found '$name'");
		  return;
		}

		foreach ($this->_content_vars AS $key => $value) {
            ${$key} = $value;
		}

		require_once($__filename);

		$this->makeNotice("End content '$name'");
	}

	public function isContent($name) {
		$filename =  $this->_content_location . "/" . $name . ".html";
		$filename = str_replace(" ", "", $filename);

		return is_file($filename);
	}

	function fetch($name) {}

	public function setContentLocation($dir) {
	    $this->_content_location = $dir;
	}

	public function getContentLocation(){
		return $this->_content_location;
	}

	public function getContentFileName(){
		return $this->_content_vars['content'];
	}
}
