<?php
namespace LAZ\objects\base;

Interface IAppServices
{
    public function getLogger($forUsageReport); // return the instance of Logger; file name is implementation dependent
    public function getFeatureCheck();          // return the instance of FeatureCheck
    public function isFeatureEnabled($feature);
    public function getAccountsbackWebservice();    // return the instance of AccountsbackWebservice
    public function getGoogleAnalyticsHelper(); // return the instance of GoogleAnalyticsHelper
    public function getAccountsMasterDm();
}