<?php
namespace LAZ\objects\library;

use DateTime;
use DateTimeZone;
use LAZ\objects\data\DataManager;
use LAZ\objects\tools\ShardDataMigration\Subscription\SubscriptionShardConfigManager;

class SystemStatus {
  
  /**
  * Detects whether KAZ is in degraded mode (whether external reports slaves are available).
  * Please use isShardedExternalReportsUnavailable() instead.
  * 
  * @param string[optional] shardConfigurationId
  * <p>
  * Pass a value for the shardConfigurationId when it's necessary to query <b>within a single subscription</b> for
  * a database that has been sharded. The shardConfigurationId should be obtained from the session auth information
  * for the customer facing PHP webapps. Otherwise, the shardConfigurationId can be determined by querying the
  * deployment_configuration.subscription_shared_configuration table through the context of accounts by joining from
  * the accounts.subscription table. A shardConfigurationId should be omitted when quering across subscriptions.
  * </p>
  *
  *@deprecated
  */
  public static function isKazInDegradedMode($shardConfigurationId = null){
    // At this point, but sharded and unsharded external reports must be up for KAZ to operate properly not in degraded mode.
    
    // We might in the figure choose to make Kaz not rely on unsharded external reports, but that is not the state today.
    $dm = new DataManager(DataManager::DB_RK_ACTIVITY, DataManager::LOC_EXTERNAL_REPORTS, $shardConfigurationId);
    $isShardedExternalReportsUp = $dm->isUp();
    
    $dm = new DataManager(DataManager::DB_ACCOUNTS, DataManager::LOC_EXTERNAL_REPORTS);
    $isUnshardedExternalReportsUp = $dm->isUp();
    return !($isShardedExternalReportsUp && $isUnshardedExternalReportsUp);
  }
  
  public static function isShardedExternalReportsUnavailable($shardConfigurationId) {
      $dm = new DataManager(DataManager::DB_RK_ACTIVITY, DataManager::LOC_EXTERNAL_REPORTS, $shardConfigurationId);
      $isShardedExternalReportsUp = $dm->isUp();
      
      return !$isShardedExternalReportsUp;
  }
  
  public static function areAnyShardedExternalReportsUnavailable() {
      $subscriptionShardConfigManager = new SubscriptionShardConfigManager();
      $areAnyShardedExternalReportsUnavailable = false;
      foreach ($subscriptionShardConfigManager->getAvailableAndUpShardConfigurationIds() as $shardConfigurationId) {
          $areAnyShardedExternalReportsUnavailable = $areAnyShardedExternalReportsUnavailable || self::isShardedExternalReportsUnavailable($shardConfigurationId);
      }
      
      return $areAnyShardedExternalReportsUnavailable;
  }
  
  public static function isUnshardedExternalReportsUnavailable() {
      $dm = new DataManager(DataManager::DB_ACCOUNTS, DataManager::LOC_EXTERNAL_REPORTS);
      $isUnshardedExternalReportsUp = $dm->isUp();
      
      return !$isUnshardedExternalReportsUp;
  }
  
  public static function isInternalReportsUnavailable() {
      $dm = new DataManager(DataManager::DB_ACCOUNTS, DataManager::LOC_INTERNAL_REPORTS);
      return !$dm->isUp();
      
  }
  
  public static function isInternalReportsUp(){
      return !self::isInternalReportsUnavailable();
  }
  
  private static function isMaintenanceAnnouncementValid($info){
    $valid = false;
    if ($info) {
      $now = new DateTime('now', new DateTimeZone(MaintenanceConstants::MAINTENANCE_TIME_ZONE));
      $maintenanceStart = new DateTime($info['start_at'], new DateTimeZone(MaintenanceConstants::MAINTENANCE_TIME_ZONE));
      $deltaH = ($maintenanceStart->getTimestamp() - $now->getTimestamp()) / 3600;
      $valid = $deltaH > 0 && $deltaH <= MaintenanceConstants::HOURS_BEFORE_ANNOUNCEMENT;
    }
    return $valid;
  }
  
  private static function getMaintenanceAnnouncementInfo(){
    $dm = new DataManager(DataManager::DB_ACCOUNTS, DataManager::LOC_MASTER);
    $dm->query(
        "select start_at, end_at, message from maintenance_message mm
	join maintenance_message_site mms on mm.maintenance_message_id = mms.maintenance_message_id
	join maintenance_site ms on mms.maintenance_site_id = ms.maintenance_site_id
	where site_id = ".SITE_ID." and removed_at is null
    order by added_at desc limit 1;");
    return $dm->fetch();
  }

  private static function isMaintenanceStartAndEndOnSameDay($startInfo, $endInfo) {
    $start = new DateTime(date('Y-m-d', strtotime($startInfo)), new DateTimeZone(MaintenanceConstants::MAINTENANCE_TIME_ZONE));
    $end = new DateTime(date('Y-m-d', strtotime($endInfo)), new DateTimeZone(MaintenanceConstants::MAINTENANCE_TIME_ZONE));
    $diff = $start->diff($end);
    return $diff->d === 0;
  }

  public static function getMaintenanceAnnouncement(){
      return;
    $announcement = $_SESSION['maintenance_announcement'];
    if (!$announcement) {
      $info = self::getMaintenanceAnnouncementInfo();
      if (self::isMaintenanceAnnouncementValid($info)) {
        if (self::isMaintenanceStartAndEndOnSameDay($info['start_at'], $info['end_at'])) {
          $startStr = "on ".date('F j', strtotime($info['start_at']))." from ".date('g:ia', strtotime($info['start_at']));
          $endStr = date('g:ia', strtotime($info['end_at']));
        } else {
          $startStr = "from ".date('F j', strtotime($info['start_at']))." at ".date('g:ia', strtotime($info['start_at']));
          $endStr = date('F j', strtotime($info['end_at']))." at ".date('g:ia', strtotime($info['end_at']));
        }
        $placeHolders = array(MaintenanceConstants::START_TIME_PH, MaintenanceConstants::END_TIME_PH);
        $replaceValues = array($startStr, $endStr);
        $announcement = str_replace($placeHolders, $replaceValues, $info['message']);
        $_SESSION['maintenance_announcement'] = $announcement;
      }
    }
    return $announcement;
  }
}

class MaintenanceConstants {
  const MAINTENANCE_TIME_ZONE = 'America/Detroit';
  const HOURS_BEFORE_ANNOUNCEMENT = 48;
  /*Maintenance announcement placeholder constants*/
  const START_TIME_PH = '<start_at>';
  const END_TIME_PH = '<end_at>';
}