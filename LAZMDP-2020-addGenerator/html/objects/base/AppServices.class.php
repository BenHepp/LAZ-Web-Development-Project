<?php
namespace LAZ\objects\base;

use LAZ\objects\data\DataManager;
use LAZ\objects\library\GoogleAnalyticsHelper;
use LAZ\objects\tools\AccountsbackWebservice;
use LAZ\objects\tools\FeatureCheck;
use LAZ\objects\tools\Logger;


class AppServices implements IAppServices
{
    /**
     * @var FeatureCheck
     */
    private $featureCheck;

    /**
     * @var Logger
     */
    private $logger;

    /**
     * @var AccountsbackWebservice
     */
    private $accountsback_ws;

    /**
     * @var GoogleAnalyticsHelper
     */
    private $googleHelper;

    /**
     * @var DataManager
     */
    private $_accountsMasterDm;

    public function isFeatureEnabled($feature)
    {
        return $this->getFeatureCheck()->isFeatureEnabled($feature);
    }

    public function getFeatureCheck()
    {
        if (! $this->featureCheck) {
            $this->featureCheck = AppServicesFactory::createFeatureCheck();
        }
        return $this->featureCheck;
    }

    //override in parent to set forUsageReports format
    public function getLogger($forUsageReport=false)
    {
        if(!$this->logger) {
            $this->logger = AppServicesFactory::createLogger(get_class($this), $forUsageReport);
        }
        return $this->logger;
    }

    public function getAccountsbackWebservice()
    {
        if(! $this->accountsback_ws instanceof AccountsbackWebservice) {
            $this->accountsback_ws = AppServicesFactory::createAccountsbackWebservice();
        }
        return $this->accountsback_ws;
    }

    public function getGoogleAnalyticsHelper()
    {
        if(! $this->googleHelper) {
            $this->googleHelper = AppServicesFactory::createGoogleAnalyticsHelper();
        }
        return $this->googleHelper;
    }

    public function getAccountsMasterDm()
    {
        if(! $this->_accountsMasterDm) {
            $this->_accountsMasterDm = AppServicesFactory::createAccountMasterDm();
        }
        return $this->_accountsMasterDm;
    }

}