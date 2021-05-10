<?php
namespace LAZ\objects\library;


class Environment {
    public static function getLazUrl(){
        return $_ENV['LAZ_HTTP_SERVER'];
    }

    public static function getCsiUrl(){
        return $_ENV['CSI_HTTP_SERVER'];
    }

    public static function getEmailTrackUrl(){
        return $_ENV['email_open_track_host'];
    }

    public static function getInstance(){
        return $_ENV['LP_INSTANCE'];
    }

    public static function getErrorEmail(){
        return $_ENV['ERR_EMAIL'];
    }
}
