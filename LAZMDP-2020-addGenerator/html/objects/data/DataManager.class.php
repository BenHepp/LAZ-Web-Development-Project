<?php
namespace LAZ\objects\data;

use Exception;
use LAZ\objects\tools\Logger;

class DataManager {
    
  //Database Constants
  const DB_ACCOUNTS = 'accounts';
  const DB_ACCOUNTS_HISTORY = 'accounts_history';
  const DB_DATA_COPY = 'data_copy';
  const DB_DEPLOYMENT_CONFIGURATION = 'deployment_configuration';
  const DB_DICTIONARY_CONTENT = 'dictionary_content';
  const DB_EXAMPLE_STUDENTS = 'example_students';
  const DB_EXTERNAL_USER = 'external_user';
  const DB_EXAMPLE = 'example_students';
  const DB_FF_EXTERNAL_USER = 'ff_external_user';
  const DB_FF_USER = 'ff_user';
  const DB_FIREFLY_FILE_CACHE = 'firefly_file_cache';
  const DB_HEADSPROUT_CONTENT = 'headsprout_content';
  const DB_INCOMPLETE_ORDERS = 'incomplete_orders';
  const DB_INFORMATION_SCHEMA = 'information_schema';
  const DB_IPLOC_CONTENT = 'iploc_content';
  const DB_KI_ACCOUNTS = 'ki_accounts';
  const DB_KI_CONTENT = 'ki_content';

  const DB_LAZ_MKTG_CONTENT = 'laz_mktg_content';
  const DB_ORGANIZATIONS = 'organizations';
  const DB_PERCONA = 'percona';
  const DB_PLAYER_CONTENT = 'player_content';
  const DB_PMI_CONTENT = 'pmi_content';
  const DB_RAZ_CONTENT = 'raz_content';
  const DB_RAZ_USER = 'raz_user';
  const DB_REPLICATION_STATS = 'replication_stats';
  const DB_RK_ACTIVITY = 'rk_activity';
  const DB_RK_CONTENT = 'rk_content';
  const DB_RT_CONTENT = 'rt_content';
  const DB_SAZ_CONTENT = 'saz_content';
  const DB_SALESFORCE_LOADER = 'salesforce_loader';
  const DB_SITE_CONTENT = 'site_content';
  const DB_SPRITE_CONTENT = 'sprite_content';
  const DB_TESTPREP_CONTENT = 'testprep_content';
  const DB_TR_CONTENT = 'tr_content';
  const DB_TILE_CONTENT = 'tile_content';
  const DB_TRACKING = 'tracking';
  const DB_USAGE_DATA = 'usage_data';
  const DB_USAGE_ROLLUP = 'usage_rollup';
  const DB_VOCAB_CONTENT = 'vocab_content';
  const DB_VOCAB_USER = 'vocab_user';
  const DB_WAZ_CONTENT = 'waz_content';
  const DB_KI_GOLDMINE = 'ki_goldmine';

  //Location Constants
  const LOC_MASTER = 'master';
  const LOC_RELAY = 'relay';
  const LOC_EXTERNAL_REPORTS = 'external-reports';
  const LOC_INTERNAL_REPORTS = 'internal-reports';
  const LOC_BACKUP = 'backup';
  const LOC_AABACKUP = 'aabackup';
  const LOC_SOLR = 'solr';
  const LOC_TEST = 'test';
  const LOC_WEB = 'web';

  // trigger management types
  const TRIGGER_MANAGEMENT_TYPE_CREATE = 'create';
  const TRIGGER_MANAGEMENT_TYPE_DROP = 'drop';
  const TRIGGER_MANAGEMENT_TYPE_SHOW = 'show';

  //Regex constants
  const REGEX_WHITESPACE_CLEANUP = '/\s+/';
  const REGEX_SELECTED = '/^[^a-z]*(select|show)/';
  const REGEX_AFFECTED = '/^[^a-z]*(insert|update|delete|replace|create|drop|alter)/';
  const REGEX_INSERTED = '/^[^a-z]*insert/';

  static private $connectionPool;

  private $allShardsWereQueried;
  private $querySuccess;
  private $results;
  private $rowsSelected;
  private $rowsAffected;
  private $lastInsertId;
  private $database;
  private $location;
  private $shardConfigurationId;
  private $logger;
  private $connectionInfo;
  
  static private $totalQuerySecondsForRequest;
  static private $totalQueryCountForRequest;
  
  private $isReportQueryTime = false;
  
  private $isReportTotalRequestQueryTime = false;

  /**
   * Creates a new DataManager instance.
   * @param string - database string <p>Use the predefined "Database Constants" (e.g. DataManager::DB_ACCOUNTS).</p>
   * @param string - location string <p>Use the predefined "Location Constants" (e.g. DataManager::LOC_MASTER).</p>
   * @param int - shardConfigurationId string[optional]
   * <p>
   * Pass a value for the shardConfigurationId when it's necessary to query <b>within a single subscription</b> for
   * a database that has been sharded. The shardConfigurationId should be obtained from the session auth information
   * for the customer facing PHP webapps. Otherwise, the shardConfigurationId can be determined by querying the
   * deployment_configuration.subscription_shared_configuration table through the context of accounts by joining from
   * the accounts.subscription table.
   * </p>
   *
   * <p>A shardConfigurationId should be omitted in the following cases:</p>
   * <lu>
   *   <li>queries referencing only content dbs</li>
   *   <li>queries across subscriptions</li>
   * </lu>
   *
   * <p><b>
   * Note that the "$location" parameter should always be "DataManager::LOC_WEB" for queries against the content
   * databases in the customer facing web apps.  "DataManager::LOC_MASTER" in context of querying content DBs should
   * only be used for php database change scripts or for content DB interaction in the cms web apps.
   * </b></p>
   */
  public function __construct($database, $location, $shardConfigurationId = null) {

    if(!static::$connectionPool){
      static::$connectionPool = array();
    }
    
    if (is_null(static::$totalQuerySecondsForRequest)) {
        static::$totalQuerySecondsForRequest = 0;
    } 
    
    if (is_null(static::$totalQueryCountForRequest)) {
        static::$totalQueryCountForRequest = 0;
    }

    $this->reset();
    $this->database = $database;
    $this->location = $location;
    $this->shardConfigurationId = (($shardConfigurationId) ? "$shardConfigurationId" : null);

    $this->logger = new Logger("DataManager");

    $deploymentConfiguration = new DeploymentConfiguration();
    $this->connectionInfo = $deploymentConfiguration->getConnectionInfo($this->database, $this->location);

    // Log query times if we're at debug log level.
    $this->isReportQueryTime = ($_ENV['LOG_LEVEL'] === 'DEBUG' );
    
    // Change this to true if you want to see cumulative query times / counts per request.
    $this->isReportTotalRequestQueryTime = ($_ENV['LOG_LEVEL'] === 'DEBUG' );

    $this->alwaysReportStackTrace = ($_ENV['LOG_LEVEL'] === 'DEBUG' && $_ENV['LP_INSTANCE'] === 'local');
  }

  public function getLogFileName() {
      return $this->logger->getLogFile();
  }

  private function reset(){
    $this->allShardsWereQueried = false;
    $this->querySuccess = array();
    $this->results = array();
    $this->rowsSelected = array();
    $this->rowsAffected = array();
    $this->lastInsertId = array();
  }

  private function callStack($backTrace){
    $stackTrace = '';
    foreach($backTrace as $calledFrom){
      if($stackTrace){
        $stackTrace .= ', ';
      }
      $fileSegments = explode(DIRECTORY_SEPARATOR, $calledFrom['file']);
      $file = array_pop($fileSegments);
      $function = (($calledFrom['function']) ? ($calledFrom['function'] . '()') : '');
      $line = $calledFrom['line'];
      $stackTrace .= "($file, $function, $line)";
    }
    return "[$stackTrace]";
  }

  private function getConnection($server, $username, $password){
      if($server['socket']){
          $poolKey = $server['socket'];
      }
      else {
          $poolKey = "{$server['host']}:{$server['port']}";
      }
      $poolKey = strtolower("{$poolKey}_{$username}_{$password}");
      
      //$connection = static::$connectionPool[$poolKey];
      if (!(isset($connection) && mysqli_ping($connection))) {
          $connection = @mysqli_connect($server['host'], $username, $password, null, $server['port'], $server['socket']);
          if ($connection) {
              static::$connectionPool[$poolKey] = $connection;
          }
      }

      return $connection;
  }

  /**
   * @return array - an array containing slave status.
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function getSlaveStatus(){
    $this->queryByUser('show slave status', 'monitor', 'pw4monitor');
    $results = $this->fetch();
    return ($results ? $results : array());
  }

  /**
   * Execute a trigger management operation.
   *
   * This is only intended for use for non-persistent triggers.  Persistent triggers should be installed via db_changes.
   * Non-persistent triggers are late-installed triggers used as part of a migration process.
   * @param string $triggerManagementType   :  Must be DbManager::TRIGGER_MANAGEMENT_TYPE_CREATE, DbManager::TRIGGER_MANAGEMENT_TYPE_DROP,
   *                                        or DbManager::TRIGGER_MANAGEMENT_TYPE_SHOW.
   * @param string $triggerName             The name of the trigger to be created or dropped.
   * @param string $triggerBody             The body of the trigger to be created.  Ignored for TRIGGER_MANAGEMENT_TYPE_DROP.
   * @param string $dbName                  The database in which to look for the trigger(s).  Only used for TRIGGER_MANAGEMENT_TYPE_SHOW.
   * @return array|null
   * @throws DataManagerException
   */
  public function executeManageTriggerSql($triggerManagementType, $triggerName = null, $triggerBody = null, $dbName = null) {
    if($triggerManagementType != self::TRIGGER_MANAGEMENT_TYPE_SHOW){
      if(!$triggerName){
        throw new DataManagerException("DataManager::executeManageTriggerSql() called without a trigger name.");
      }
      if(($triggerManagementType == self::TRIGGER_MANAGEMENT_TYPE_CREATE) && (!$triggerBody)){
        throw new DataManagerException("DataManager::executeManageTriggerSql() called without a trigger body.");
      }
    }

    if ($triggerManagementType == self::TRIGGER_MANAGEMENT_TYPE_CREATE) {
        $sql = "create trigger $triggerName
        		   $triggerBody";
    } else if ($triggerManagementType == self::TRIGGER_MANAGEMENT_TYPE_DROP) {
        $sql = "drop trigger if exists $triggerName";
    } else if ($triggerManagementType == self::TRIGGER_MANAGEMENT_TYPE_SHOW) {
        if (!is_null($dbName)) {
            $sql = "show triggers from $dbName";
        } else {
            $sql = "show triggers";
        }
    } else {
        throw new DataManagerException("DataManager::executeManageTriggerSql() called with unrecognized trigger management type '$triggerManagementType'.");
    }

    $this->queryByUser($sql, 'trigger', 'pw4trigger');

    if ($triggerManagementType == self::TRIGGER_MANAGEMENT_TYPE_SHOW) {
      return $this->fetchAll();
    }
    return null;
  }

   /**
   * Tests connectivity to database, shard, or all shards based on whether a shardConfigurationId
   * was provided during object construction.
   *
   * @return bool - true on success or false on failure.
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function isUp() {
      try {
          if (!$this->connectionInfo) {
              throw new DataManagerException("No configuration for {$this->database} on {$this->location} was found. Call Stack: " . $this->callStack(debug_backtrace()));
          }

          $servers = array();
          if ($this->shardConfigurationId) {
              $shardConnectionInfo = is_array($this->connectionInfo['shards']) ? $this->connectionInfo['shards'][$this->shardConfigurationId] : false;
              if ($shardConnectionInfo) {
                  $servers[] = $shardConnectionInfo['server'];
              } else {
                  throw new DataManagerException("A shardConfigurationId of {$this->shardConfigurationId} was not found for {$this->database} on {$this->location}. Call Stack: " . $this->callStack(debug_backtrace()));
              }
          } else if ($this->connectionInfo['database']) {
              $servers[] = $this->connectionInfo['database']['server'];
          } else if (is_array($this->connectionInfo['shards'])) {
              foreach ($this->connectionInfo['shards'] as $shardConnectionInfo) {
                  $servers[] = $shardConnectionInfo['server'];
              }
          } else {
              throw new DataManagerException("A configuration for {$this->database} on {$this->location} was not found. Call Stack: " . $this->callStack(debug_backtrace()));
          }

          $isUp = true;
          foreach ($servers as $server) {
              $connection = $this->getConnection($server, $_ENV['DB_USER'], $_ENV['DB_PASSWORD']);
              if (!$connection) {
                  $isUp = false;
                  break;
              }
          }
          return $isUp;

      } catch (DataManagerException $dataManagerException) {
          $this->logger->logError($dataManagerException->getMessage());
          return false;
      }
  }

  private function submitQuery($queryId, $sql, $server, $user, $password){
      $mysqlInstance = $server['socket'];
      if(!$mysqlInstance){
          $mysqlInstance = "{$server['host']}:{$server['port']}";
      }

      $this->querySuccess["$queryId"] = false;
      $formattedSql = preg_replace(self::REGEX_WHITESPACE_CLEANUP,' ', $sql);
      if ($this->isReportQueryTime) {
          $startMicroTime = microtime();
      }

      $connection = $this->getConnection($server, $user, $password);
      if($connection){
          if(mysqli_select_db($connection, $this->database)){
              $results = mysqli_query($connection, $sql);
              if($results){
                  $rowsSelected = 0;
                  $rowsAffected = 0;
                  $lastInsertId = 0;
  
                  if(preg_match(self::REGEX_SELECTED, strtolower($formattedSql)) === 1){
                      $rowsSelected = mysqli_num_rows($results);
                      if(mysqli_error($connection) !== ''){
                          throw new DataManagerException("Could not retrieve selected row count on $mysqlInstance ({$this->location}) for {$this->database}. MySql Error: " . mysqli_errno($connection) . ": " . mysqli_error($connection) . " Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
                      }
                  }
                  else if(preg_match(self::REGEX_AFFECTED, strtolower($formattedSql)) === 1){
                      $rowsAffected = mysqli_affected_rows($connection);
                      if(mysqli_error($connection) !== ''){
                          throw new DataManagerException("Could not retrieve affected row count on $mysqlInstance ({$this->location}) for {$this->database}. MySql Error: " . mysqli_errno($connection) . ": " . mysqli_error($connection) . " Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
                      }
                      else if(preg_match(self::REGEX_INSERTED, strtolower($formattedSql)) === 1){
                          $lastInsertId = mysqli_insert_id($connection);
                          if(mysqli_error($connection) !== ''){
                              throw new DataManagerException("Could not retrieve the last insert id on $mysqlInstance ({$this->location}) for {$this->database}. MySql Error: " . mysqli_errno($connection) . ": " . mysqli_error($connection) . " Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
                          }
                      }
                  }
  
                  $this->querySuccess["$queryId"] = true;
                  if(!is_bool($results)){
                      $this->results["$queryId"] = $results; //& $results; //ref is no longer needed
                  }
                  $this->rowsSelected["$queryId"] = $rowsSelected;
                  $this->rowsAffected["$queryId"] = $rowsAffected;
                  $this->lastInsertId["$queryId"] = $lastInsertId;
  
                  $stats = "";
                  if(preg_match(self::REGEX_SELECTED, strtolower($formattedSql)) === 1){
                      $stats = "Rows selected: $rowsSelected.";
                  }
                  else if(preg_match(self::REGEX_AFFECTED, strtolower($formattedSql)) === 1){
                      $stats = "Rows affected: $rowsAffected.";
                      if(preg_match(self::REGEX_INSERTED, strtolower($formattedSql)) === 1){
                          $stats .= " Last insert id: $lastInsertId.";
                      }
                  }
                  
                  if ($this->isReportQueryTime) {
                      $endMicroTime = microtime();
                      list($startMicroseconds, $startSeconds) = explode(' ', $startMicroTime);
                      list($endMicroseconds, $endSeconds) = explode(' ', $endMicroTime);

                      $elapsedQuerySeconds = $endSeconds + $endMicroseconds - ($startSeconds + $startMicroseconds);
                      static::$totalQuerySecondsForRequest += $elapsedQuerySeconds;
                      static::$totalQueryCountForRequest++;
                      
                      $stats .= " Elapsed seconds: " . number_format($elapsedQuerySeconds, 5) . ".";
                      
                      if ($this->isReportTotalRequestQueryTime) {
                        $stats .= " Total queries / elapsed query seconds across request: " . static::$totalQueryCountForRequest . "/" . number_format(static::$totalQuerySecondsForRequest, 5) . ".";
                      }
                  }

                  $stackTraceMessage = $this->alwaysReportStackTrace ? "; Call Stack: " . $this->callStack(debug_backtrace()) : "";
                  $this->logger->logDebug("Query successful on $mysqlInstance ({$this->location}) for {$this->database}. $stats Query: $formattedSql {$stackTraceMessage}");
              }
              else {
                  $formattedError = preg_replace(self::REGEX_WHITESPACE_CLEANUP,' ', mysqli_error($connection));
                  throw new DataManagerException("Query problem on $mysqlInstance ({$this->location}) for {$this->database}. MySql Error: " . mysqli_errno($connection) . ": " . $formattedError . " Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
              }
          }
          else {
              throw new DataManagerException("Unable to change database on $mysqlInstance ({$this->location}) for {$this->database}.  MySql Error: " . mysqli_errno($connection) . ": " . mysqli_error($connection) . " Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
          }
      }
      else {
          throw new DataManagerException("Unable to connect to MySql using [$mysqlInstance, $user, $password] ({$this->location}) for {$this->database}.  Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
      }
  }
  
  private function queryByUser($sql, $user, $password) {
      try {
          $this->reset();
          $formattedSql = preg_replace(self::REGEX_WHITESPACE_CLEANUP, ' ', $sql);

          if (!$this->connectionInfo) {
              throw new DataManagerException("No configuration for {$this->database} on {$this->location} was found. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
          }

          if ($this->shardConfigurationId) {
              $shardConnectionInfo = is_array($this->connectionInfo['shards']) ? $this->connectionInfo['shards'][$this->shardConfigurationId] : false;
              if ($shardConnectionInfo) {
                  $queryId = $this->shardConfigurationId;
                  $server = $shardConnectionInfo['server'];
              } else {
                  throw new DataManagerException("A shardConfigurationId of {$this->shardConfigurationId} was not found for {$this->database} on {$this->location}. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
              }
          } else {
              if ($this->connectionInfo['database']) {
                  $queryId = "0";
                  $server = $this->connectionInfo['database']['server'];
              }
              else if(is_array($this->connectionInfo['shards'])){
                  throw new DataManagerException("A shardConfigurationId must be provided on the constructor call for {$this->database} on {$this->location}.  Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
              }
              else {
                  throw new DataManagerException("A database configuration was not found for {$this->database} on {$this->location}. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
              }
          }

          $this->submitQuery($queryId, $sql, $server, $user, $password);
          $temp = array_values($this->querySuccess);
          return array_shift($temp) === true;
      } catch (DataManagerException $dataManagerException) {
          $this->logger->logError($dataManagerException->getMessage());
          throw $dataManagerException;
      }
  }

  /**
   * Queries a database or shard based on whether a shardConfigurationId was provided
   * during object construction.
   *
   * @param string -$sql string <p>The sql statement to be executed.</p>
   *
   * @return bool -true on success or false on failure.
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function query($sql){
    return $this->queryByUser($sql, $_ENV['DB_USER'], $_ENV['DB_PASSWORD']);
  }

  /**
   * Queries all of the shards building a separate result set for each.  Use this
   * function if you need to query spanning multiple subscriptions.
   *
   * @param string -$sql string <p>The sql statement to be executed.</p>
   *
   * @return array|bool - an associative array keyed by shardConfigurationId with value of true or false
   * indicating query success over respective shard.
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function queryAllShards($sql) {
      try {
          $this->reset();
          $formattedSql = preg_replace(self::REGEX_WHITESPACE_CLEANUP, ' ', $sql);

          if (!$this->connectionInfo) {
              throw new DataManagerException("No configuration for {$this->database} on {$this->location} was found. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
          }

          if ($this->shardConfigurationId) {
              throw new DataManagerException("queryAllShards is intended to used across all shards. Remove the shardConfigurationId on the constructor call. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
          }

          if ($this->connectionInfo['shards']) {
              $this->allShardsWereQueried = true;
              foreach ($this->connectionInfo['shards'] as $shardConfigurationId => $shardConnectionInfo) {
                  $this->submitQuery("$shardConfigurationId", $sql, $shardConnectionInfo['server'], $_ENV['DB_USER'], $_ENV['DB_PASSWORD']);
              }
          }
          else {
              throw new DataManagerException("A shardConfigurationId was not found for {$this->database} on {$this->location}. Query: $formattedSql; Call Stack: " . $this->callStack(debug_backtrace()));
          }

          return $this->querySuccess;
      } catch (DataManagerException $dataManagerException) {
          $this->logger->logError($dataManagerException->getMessage());
          throw $dataManagerException;
      }
  }

  /**
   * @return array|bool - an associative array or false if no more rows to retrieve.
   *
   * <p>
   * When calling this function after the queryAllShards function, an extra key/value pair
   * will be added to the returned array denoting which shardConfiguration the data was
   * retrieved from.
   * </p>
   */

  public function fetch(){
      $row = false;
      if(count($this->results) > 0){
          $temp = array_values($this->results);
          $results = array_shift($temp);
          $row = mysqli_fetch_assoc($results);
          if($row){
              if($this->allShardsWereQueried){
                  $temp = array_keys($this->results);
                  $shardConfigurationId = array_shift($temp);
                  $row['shard_configuration_id'] = $shardConfigurationId;
              }
          }
          else {
              $this->results = array_slice($this->results, 1, null, true);
              $row = $this->fetch();
          }
      }
      return $row;
  }
  
  /**
   * @return array - an array of associative array results or an empty array if no results were found
   *
   * <p>
   * As with the fetch function, calling this function after the queryAllShards function will insert
   * an extra key/value pair denoting which shardConfiguration the data was retrieved from.
   * </p>
   * <p>
   * <b>Note: You should only be calling this function if you are going to use all of the
   * results from the query and if you are not going to iterate through the returned array
   * performing business logic over each individual result.</b>
   * </p>
   */
  public function fetchAll(){
    $rows = array();
    while($row = $this->fetch()){
      $rows[] = $row;
    }
    return $rows;
  }

  /**
   * @return int
   *
   * <p>
   * When calling this function after the queryAllShards function, each individual
   * shard rowsSelectedCount will be summed for a grand total.
   * </p>
   */
  public function rowsSelected(){
    return array_sum($this->rowsSelected);
  }

  /**
   * @return array - an associative array
   *
   * <p>
   * May only used after calling the queryAllShards function.  Each key/value pair
   * maps an individual shardConfigurationId/rowsSelectedCount.
   * </p>
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function rowsSelectedByShard(){
    if(!$this->allShardsWereQueried){
      throw new DataManagerException("getRowsSelectedByShard() can only be called after querying all shards. Call Stack: " . $this->callStack(debug_backtrace()));
    }
    return $this->rowsSelected;
  }

  /**
   * @return int
   *
   * <p>
   * When calling this function after the queryAllShards function, each individual
   * shard rowsAffectedCount will be summed for a grand total.
   * </p>
   */
  public function rowsAffected(){
    return array_sum($this->rowsAffected);
  }

  /**
   * @return array - associative array
   *
   * <p>
   * May only used after calling the queryAllShards function.  Each key/value pair
   * maps an individual shardConfigurationId/rowsAffectedCount.
   * </p>
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * handler (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function rowsAffectedByShard(){
    if(!$this->allShardsWereQueried){
      throw new DataManagerException("getRowsAffectedByShard() can only be called after querying all shards. Call Stack: " . $this->callStack(debug_backtrace()));
    }
    return $this->rowsAffected;
  }

  /**
   * @return int
   *
   * <p>
   * The autoIncrementId generated from the last inserted row.
   * </p>
   */
  public function lastId(){
    $arrayValues = array_values($this->lastInsertId);
    return array_pop($arrayValues);
  }

  /**
   * @return array - associative array
   *
   * <p>
   * May only used after calling the queryAllShards function.  Each key/value pair
   * maps an individual shardConfigurationId/autoIncrementId.
   * </p>
   *
   * @throws DataManagerException <p>This exception is intended to propagate all the way up to the top level
   * hander (i.e. main or index.php). If caught somewhere in between, please re-throw it so that we can
   * see the stack trace in the non-production environments and the dberror page in production.</p>
   */
  public function lastIdByShard(){
    if(!$this->allShardsWereQueried){
      throw new DataManagerException("getLastInsertIdByShard() can only be called after querying all shards. Call Stack: " . $this->callStack(debug_backtrace()));
    }
    return $this->lastInsertId;
  }

  /**
   * Determine whether this configuration (database/location/shard) is up.
   *
   * Unlike isUp(), this will not throw an exception if the configuration is unknown to us.
   *
   * @return bool
   */
  public function isDbServerUp() {
    // Give up quick if we have no connection info.
    if (!$this->connectionInfo) {
      return false;
    }
      
    try {
      $isDbServerUp = $this->isUp();
    } catch (Exception $e) {
      $isDbServerUp = false;
    }
    return $isDbServerUp;
  }

  /**
   * Return whatever the shard configuration id is.
   * This can be injected into query templates.
   *
   * @return int
   */
  public function getShardConfigurationId() {
      return $this->shardConfigurationId;
  }

  /**
   * Return whatever the location is.
   *
   * @return string
   */
  public function getLocation() {
      return $this->location;
  }
}
