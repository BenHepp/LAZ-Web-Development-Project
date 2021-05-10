<?php
/**
 * Configuration of the Aura autoloader with multiple PSR-4 anchors to accommodate directories with dashes.
 * Classmap entries are used for files with multiple classes defined therein.
 */

use LAZ\objects\config\LazLoader;

require_once $_ENV['ROOT_WWW_PATH'].'/vendor/composer/autoload.php';
require_once 'LazLoader.php';
$loader = new LazLoader();
$loader->register();

$loader->addPrefix('\LAZ\objects', dirname(__DIR__));
$loader->addPrefix('\LAZ\scripts', $_ENV['ROOT_WWW_PATH'].'/scripts/php');
$loader->addPrefix('\LAZ\example', $_ENV['ROOT_WWW_PATH'].'/html/example/src');
