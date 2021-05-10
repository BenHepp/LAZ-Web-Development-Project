<?php
namespace LAZ\objects\base;


/**
 *Observer that passes off signals to handling objects.
 *
 *@author	Learningpage.com, Inc.
 *@version	1	Mar	5,	2004
 *@package base
 */
class MessageController {

    /**
     *@var	array
     */
    var $_handlers;

    function __construct() {
        $this->_handlers = array();
    }

    /**
     *@param	string	signal 'type' or 'level' you want to handle, 'debug' is a catch-all
     *@param	&object	object to handle signal
     */
    function setHandler($type, &$handler) {
        $this->_handlers[$type] =& $handler;
    }

    function receive(&$signal) {
        if (isset($this->_handlers['debug'])) {
            $this->_handlers['debug']->receive($signal);
        }
        foreach ($this->_handlers as $type => $handler) {
            if (($signal['level'] == $type) || ($signal['type'] == $type)) {
                $handler->receive($signal);
            }
        }
    }

    /**
     *@param	string
     *@param	string
     */
    function notice($message, $type = "debug") {
        $signal = array();
        $signal['type'] = $type;
        $signal['level'] = "notice";
        $signal['message'] = $message;
        $signal['class'] = "raw invocation";
        $this->receive($signal);
    }

    /**
     *@param	string
     *@param	string
     */
    function warning($message, $type = "debug") {
        $signal = array();
        $signal['type'] = $type;
        $signal['level'] = "warning";
        $signal['message'] = $message;
        $signal['class'] = "raw invocation";
        $this->receive($signal);
    }

    /**
     *@param	string
     *@param	string
     */
    function error($message, $type = "debug", $data = null) {
        $signal = array();
        $signal['type'] = $type;
        $signal['level'] = "error";
        $signal['message'] = $message;
        $signal['class'] = "raw invocation";
        $signal['data'] = $data;
        $this->receive($signal);
    }
}

