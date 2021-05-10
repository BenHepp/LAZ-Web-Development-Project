<?php
namespace LAZ\objects\data;


use DOMDocument;
use mysqli;

class DeploymentConfiguration {

    static private $configurationsCache;

    private $dbServer;
    private $dbPort;
    private $dbUsername;
    private $dbPassword;
    private $instance;
    private $xmlFilePath;
    private $dbError;

    public function __construct() {
        if (!static::$configurationsCache) {
            static::$configurationsCache = array();
        }

        list($server, $port) = explode(':', "127.0.0.1:3306");//$_ENV['DB_SERVER']);
        $this->dbServer = $server;
        $this->dbPort = $port;
        $this->dbUsername = $_ENV['DB_USER'];
        $this->dbPassword = $_ENV['DB_PASSWORD'];
        $this->instance = $_ENV['LP_INSTANCE'] ? $_ENV['LP_INSTANCE'] : 'local';
        $this->xmlFilePath = "{$_ENV['DEPLOYMENT_CONFIG_PATH']}/DeploymentConfiguration.xml";
        $this->dbError = null;
    }

    public function generateXml() {
        $doc = new \DOMDocument('1.0', 'utf-8');
        $doc->formatOutput = true;

        $deploymentConfiguration = $this->addElement($doc, $doc, 'deployment_configuration');
        $this->addAttribute($doc, $deploymentConfiguration, 'db_server', "{$this->dbServer}:{$this->dbPort}");
        $this->addAttribute($doc, $deploymentConfiguration, 'instance', $this->instance);
        $this->addAttribute($doc, $deploymentConfiguration, 'path', $this->xmlFilePath);
        $this->addAttribute($doc, $deploymentConfiguration, 'generated', date('Y-m-d H:i:s T'));

        $shardQueryResults = $this->queryForShards();
        if ((!$shardQueryResults) && ($this->instance != 'infra')) {
            $this->addElement($doc, $deploymentConfiguration, 'db_error', $this->dbError);
        } else {
            $dbQueryResults = $this->queryForDbs();
            if (!$dbQueryResults) {
                $this->addElement($doc, $deploymentConfiguration, 'db_error', $this->dbError);
            }
        }

        if (!$this->dbError) {
            if ($shardQueryResults) {
                $shardConfigurations = $this->addElement($doc, $deploymentConfiguration, 'shard_configurations');
                $shardConfigurationId = null;
                $shardName = null;
                foreach ($shardQueryResults as $row) {
                    if ($row['shard_configuration_id'] != $shardConfigurationId) {
                        $shardConfigurationId = $row['shard_configuration_id'];

                        $shardConfiguration = $this->addElement($doc, $shardConfigurations, 'shard_configuration');
                        $this->addElement($doc, $shardConfiguration, 'id', $row['shard_configuration_id']);
                        $this->addElement($doc, $shardConfiguration, 'is_default', $row['is_default']);
                        $shards = $this->addElement($doc, $shardConfiguration, 'shards');

                        $shardName = null;
                    }

                    if ($row['db_name'] != $shardName) {
                        $shardName = $row['db_name'];

                        $shard = $this->addElement($doc, $shards, 'shard');
                        $this->addElement($doc, $shard, 'name', $row['db_name']);

                        $replicants = $this->addElement($doc, $shard, 'replicants');
                    }

                    $replicant = $this->addElement($doc, $replicants, 'replicant');
                    $this->addElement($doc, $replicant, 'type', $row['replicant_type']);
                    $this->addElement($doc, $replicant, 'host', $row['machine_name']);
                    $this->addElement($doc, $replicant, 'port', $row['port']);
                }
            }

            if ($dbQueryResults) {
                $databases = $this->addElement($doc, $deploymentConfiguration, 'databases');
                $dbName = null;
                foreach ($dbQueryResults as $row) {
                    if ($row['db_name'] != $dbName) {
                        $dbName = $row['db_name'];

                        $database = $this->addElement($doc, $databases, 'database');
                        $this->addElement($doc, $database, 'name', $row['db_name']);

                        $replicants = $this->addElement($doc, $database, 'replicants');
                    }

                    $replicant = $this->addElement($doc, $replicants, 'replicant');
                    $this->addElement($doc, $replicant, 'type', $row['replicant_type']);
                    $this->addElement($doc, $replicant, 'host', $row['machine_name']);
                    $this->addElement($doc, $replicant, 'port', $row['port']);

                    if (($row['machine_name'] == 'localhost') && ($this->instance != 'local')) {
                        $this->addElement($doc, $replicant, 'socket', "/k12/database/{$this->instance}-{$row['replicant_type']}/tmp/socket");
                    }
                }
            }
        }

        if (file_exists($this->xmlFilePath) && ($this->instance != 'local')) {
            if (!file_exists("{$_ENV['DEPLOYMENT_CONFIG_PATH']}/previous_versions")) {
                mkdir("{$_ENV['DEPLOYMENT_CONFIG_PATH']}/previous_versions");
            }
            $xmlBackupFilePath = "{$_ENV['DEPLOYMENT_CONFIG_PATH']}/previous_versions/DeploymentConfiguration.xml" . date('_Ymd_His');
            copy($this->xmlFilePath, $xmlBackupFilePath);
        }

        $doc->save($this->xmlFilePath);
    }

    public function getError() {
        return $this->dbError;
    }

    private function addElement($doc, $parent, $name, $value = null) {
        $element = $doc->createElement($name);
        if ($value) {
            $element->appendChild($doc->createTextNode($value));
        }
        $parent->appendChild($element);
        return $element;
    }

    private function addAttribute($doc, $element, $name, $value) {
        $attribute = $doc->createAttribute($name);
        $attribute->value = $value;
        $element->appendChild($attribute);
        return $attribute;
    }

    private function queryForShards() {
        $sql = "select
              shard_configuration.shard_configuration_id,
              shard_configuration.is_default,
              db.db_name,
              replicant.replicant_type,
              machine.machine_name,
              mysql_instance.port
            from shard_configuration
              inner join shard_sharing on shard_sharing.shard_configuration_id = shard_configuration.shard_configuration_id
              inner join shard on shard.shard_id = shard_sharing.shard_id
              inner join db on db.db_id = shard.db_id
              inner join mysql_shard on mysql_shard.shard_id = shard.shard_id
              inner join mysql on mysql.mysql_id = mysql_shard.mysql_id
              inner join mysql_instance on mysql_instance.mysql_id = mysql.mysql_id
                                       and mysql_instance.shard_configuration_id = shard_sharing.shard_configuration_id
              inner join machine on machine.machine_id = mysql_instance.machine_id
              inner join replicant on replicant.replicant_id = mysql.replicant_id
            where mysql_instance.instance_type = '{$this->instance}'
            and mysql_instance.instance_config_only = 'n'
            and ( 
                 replicant.replicant_type != 'backup'
                 or
                 (replicant.replicant_type = 'backup' and machine.machine_name like 'milazbdb%')
            )
            order by shard_configuration.shard_configuration_id, db.db_name, replicant.display_sort_order";

        return $this->query($sql);
    }

    private function queryForDbs() {
        $sql = "select
              db.db_name,
              replicant.replicant_type,
              machine.machine_name,
              mysql_instance.port
            from db
              inner join mysql_db on mysql_db.db_id = db.db_id
              inner join mysql on mysql.mysql_id = mysql_db.mysql_id
              inner join mysql_instance on mysql_instance.mysql_id = mysql.mysql_id
              inner join machine on machine.machine_id = mysql_instance.machine_id
              inner join replicant on replicant.replicant_id = mysql.replicant_id
            where mysql_instance.instance_type = '{$this->instance}'
            and mysql_instance.instance_config_only = 'n'
            and ( 
                 replicant.replicant_type != 'backup'
                 or
                 (replicant.replicant_type = 'backup' and machine.machine_name like 'milazbdb%')
            )
            order by db.db_name, replicant.display_sort_order";

        return $this->query($sql);
    }

    private function query($sql) {
        $rows = false;
        $this->dbError = null;

        $mysql = new mysqli($this->dbServer, $this->dbUsername, $this->dbPassword, 'deployment_configuration', $this->dbPort);
        if ($mysql->connect_error === null) {
            $mysqlResult = $mysql->query($sql);
            if ($mysqlResult) {
                $rows = array();
                while ($row = $mysqlResult->fetch_assoc()) {
                    array_push($rows, $row);
                }
            } else {
                $this->dbError = "Query problem. MySql Error: {$mysql->errno}: {$mysql->error}";
            }
        } else {
            $this->dbError = "Unable to connect to MySql.";
        }

        return $rows;
    }

    public function diskXmlToString() {
        $doc = new DOMDocument('1.0', 'utf-8');
        $doc->load($this->xmlFilePath);
        return $doc->saveXML();
    }

    public function getConnectionInfo($databaseName, $replicantType) {
        $cacheKey = "{$databaseName}_{$replicantType}";

        if (empty(static::$configurationsCache[$cacheKey])) {
            $xmlFilePath = $this->xmlFilePath;
            if (!empty($_ENV['DEV_DB_PROXY']) && strtolower($_ENV['DEV_DB_PROXY']) === 'y') {
                $xmlFilePath = "{$_ENV['DEPLOYMENT_CONFIG_PATH']}/DeploymentConfiguration_proxy.xml";
            }
            $deployment_configuration = simplexml_load_file($xmlFilePath);
            if (!$deployment_configuration->db_error) {
                $configurations = array();

                $temp = $deployment_configuration->databases->xpath("database[name='$databaseName']");
                $database = array_shift($temp);
                if ($database) {
                    $temp = $database->replicants->xpath("replicant[type='$replicantType']");
                    $replicant = array_shift($temp);
                    if ($replicant) {
                        $server = array();
                        $server['host'] = (string)$replicant->host;
                        $server['port'] = (string)$replicant->port;
                        $server['socket'] = ($replicant->socket ? (string)$replicant->socket : null);
                        $configurations['database'] = array('server' => $server);
                    }
                }

                $shards = array();
                foreach ($deployment_configuration->shard_configurations->shard_configuration as $shard_configuration) {
                    if (($deployment_configuration['instance'] == 'local') && ($shard_configuration->is_default == 'n') && (!$_ENV['MULTIPLE_SHARDS'])) {
                        continue;
                    }
                    $temp = $shard_configuration->shards->xpath("shard[name='$databaseName']");
                    $shard = array_shift($temp);
                    if ($shard) {
                        $temp = $shard->replicants->xpath("replicant[type='$replicantType']");
                        $replicant = array_shift($temp);
                        if ($replicant) {
                            $server = array();
                            $server['host'] = (string)$replicant->host;
                            $server['port'] = (string)$replicant->port;
                            $server['socket'] = null;
                            $shardConfig = array('id' => (string)$shard_configuration->id, 'server' => $server);
                            $shards["{$shard_configuration->id}"] = $shardConfig;
                        }
                    }
                }
                if (count($shards) > 0) {
                    $configurations['shards'] = $shards;
                }

                if(count($configurations) > 0){
                    static::$configurationsCache[$cacheKey] = $configurations;
                }
            }
        }
        $cacheValue = !empty(static::$configurationsCache[$cacheKey]) ? static::$configurationsCache[$cacheKey] : null;

        return $cacheValue;
    }

    /**
     * Get shard ids for the current instance
     * @return array
     */
    public function getShardIds() {
        $connectionInfo = $this->getConnectionInfo(DataManager::DB_RK_ACTIVITY, DataManager::LOC_MASTER);
        return array_column($connectionInfo['shards'], 'id');

    }
}
