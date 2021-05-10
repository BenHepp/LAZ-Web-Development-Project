<?php
namespace LAZ\objects\library;


class Instance {
    const DEV = 'dev';
    const INFRA = 'infra';
    const LOCAL = 'local';
    const MFG = 'mfg';
    const POSTPROD = 'postprod';
    const PREPROD = 'preprod';
    const PROD = 'prod';

    public static function isProd(){
        return Environment::getInstance() == self::PROD;
    }

    public static function isTest(){
        return !in_array(Environment::getInstance(), [self::PROD, self::MFG]);
    }

    public static function isDeveloperOnly(){
        return in_array(Environment::getInstance(), [self::LOCAL, self::DEV]);
    }

    public static function showDetailedErrors() {
        return self::isTest();
    }

    public static function domainPrefix($domain) {
        switch (Environment::getInstance()) {
            case Instance::LOCAL:    return "local.";
            case Instance::DEV:      return "dev.";
            case Instance::INFRA:    return "infra.";
            case Instance::MFG:      return "mfg.";
            case Instance::PREPROD:  return "pre.";
            case Instance::POSTPROD: return "post.";
            case Instance::PROD:     return $domain == "accounts.learninga-z.com" ? "" : "www.";
            default:                 return "";
        }
    }

}