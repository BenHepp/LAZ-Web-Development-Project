<?php
namespace LAZ\objects\base;

use LAZ\objects\library\SystemStatus;
use LAZ\objects\tools\AccountsbackWebservice;
use LAZ\objects\tools\Content;

/**
 *Base Class for all Controller objects
 *@package	base
 *@author	Sam@ReadingA-Z.com
 */
class Controller implements IAppServices
{
    //references to AppServices objects
    private $_featureCheck=null;
    private $_logger=null;
    private $_accountsback_ws;
    private $_googleHelper;
    private $_accountsMasterDm;
    /**
     * @var	Content
     */
    protected $view;

    /**
     * @var object Observer Object
     */
    protected $output;

    /**
     * @var object Model Object
     */
    public $model = null;

    // This method could be made abstract
    public function control() {}

    public function __construct() {
        $this->setViewOutputObjects();
        $this->getModel(); // some derived classes override
        $this->setMaintenanceVars();
        $this->control(); // most (all?) derived classes override
    }

    private function setViewOutputObjects() {
        global $content, $output;
        $this->view = $content;
        $this->output = $output;
    }

    protected function setModel() {
        $class = get_class($this) . 'Model';
        $this->model = new $class($this); //$this gives models access to IAppServices
    }

    public function getModel() {
        if (! $this->model) {
            $this->setModel();
        }
        return $this->model;
    }

    protected function isLinuxOS() {
        return strtoupper(php_uname('s')) == 'LINUX';
    }

    /**
     * @param string
     * @return string
     */
    protected function windowsParseUri($uri) {
        // Need to detect whether this is a Windows development instance because we'll bounce off of preprod (not postprod) for content in that case.
        if (! $this->isLinuxOS()) {
            $uri = explode("?start_debug", $uri);
            $uri = $uri[0];
        }
        return $uri;
    }

    public function authorize() {
        if (isset($_SESSION['authorized'])) {
            return true;
        }

        $this->view->assign("uri", $_SERVER['REQUEST_URI']);
        $this->view->assign("content", "sign_in");
        $this->view->assign("title", "Please Sign In");

        return false;
    }

    public function redirectNoPostBack($location) {
        header("HTTP/1.1 303 See Other");
        header("Location: $location");
        exit();
    }

    /**
     * Redirect to a specified location and call exit().
     * @param string $location
     */
    public function redirect($location) {
        header("Location: $location");
        exit();
    }

    public function setNotice($msg) {
        $_SESSION['notice'] = $msg;
    }

    protected function badRequest() {
        header('HTTP/1.1 400 Bad Request');
    }

    protected function forbidden() {
        header('HTTP/1.1 403 Forbidden');
    }

    protected function internalServerError() {
        header('HTTP/1.1 500 Internal Server Error');
    }

    // App services methods

    public function isFeatureEnabled($feature) {
        return false; // $this->getFeatureCheck()->isFeatureEnabled($feature);
    }

    public function getFeatureCheck() {
        if (! $this->_featureCheck) {
            $this->_featureCheck = null; // AppServicesFactory::createFeatureCheck();
        }
        return $this->_featureCheck;
    }

    //override in parent to set forUsageReports format
    public function getLogger($forUsageReport=false) {
        if(!$this->_logger) {
            $this->_logger = AppServicesFactory::createLogger(get_class($this), $forUsageReport);
        }
        return $this->_logger;
    }

    public function getAccountsbackWebservice() {
        if(! $this->_accountsback_ws instanceof AccountsbackWebservice) {
            $this->_accountsback_ws = AppServicesFactory::createAccountsbackWebservice();
        }
        return $this->_accountsback_ws;
    }

    public function getGoogleAnalyticsHelper() {
        if (! $this->_googleHelper) {
            $this->_googleHelper = AppServicesFactory::createGoogleAnalyticsHelper();
        }
        return $this->_googleHelper;
    }

    public function getAccountsMasterDm() {
        if (!$this->_accountsMasterDm) {
            $this->_accountsMasterDm = AppServicesFactory::createAccountMasterDm();
        }
        return $this->_accountsMasterDm;
    }

    public function redirectIfNotAuthorized(){
        if (!$this->authorize()) {
            $_SESSION['redirectUri'] = $_SERVER['REQUEST_URI'];
            header("LOCATION: /main/Login");
            exit();
        }
    }

    /**
     * Redirect to a maintenance page if sharded external reports is unavailable.
     */
    public function redirectIfInMaintenance() {
        if (SystemStatus::isShardedExternalReportsUnavailable($_SESSION['teacherAccountInfo']['shardConfigurationId'])) {
            header("Location:/main/ViewPage/name/maintenance");
            exit;
        }
    }

    public function setMaintenanceVars() {
        if ($_ENV['LP_INSTANCE'] != "devinfra"){
            $this->view->assign('maintenance_announcement', SystemStatus::getMaintenanceAnnouncement());
        }
    }
}
