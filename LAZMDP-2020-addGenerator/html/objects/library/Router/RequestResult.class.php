<?php
namespace LAZ\objects\library\Router;


class RequestResult {
    public $status;
    public $result;

    public function __construct($status, $result) {
        $this->status = $status;
        $this->result = $result;
    }

    /**
     * @return mixed
     */
    public function getStatus() {
        return $this->status;
    }

    /**
     * @return mixed
     */
    public function getResult() {
        return $this->result;
    }
}