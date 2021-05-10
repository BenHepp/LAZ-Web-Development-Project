<?php
namespace LAZ\objects\base;

use LAZ\objects\tools\AccountsbackWebservice;
use LAZ\objects\data\DataManager;
use LAZ\objects\library\GoogleAnalyticsHelper;
use LAZ\objects\tools\Logger;

class AppServicesFactory
{
    public static function createLogger($fname = 'DefaultLog', $forUsageReports = false)
    {
        return new Logger($fname, $forUsageReports);
    }

    public static function createFeatureCheck()
    {
        //return new FeatureCheck();
    }

    public static function createAccountsbackWebservice()
    {
        return new AccountsbackWebservice();
    }

    public static function createGoogleAnalyticsHelper()
    {
        return new GoogleAnalyticsHelper();
    }

    public static function createAccountMasterDm()
    {
        return new DataManager(DataManager::DB_ACCOUNTS, DataManager::LOC_MASTER);
    }
}