<?php
namespace LAZ\objects\tools;

use LAZ\objects\library\PHPUtil;
use LAZ\objects\admin2\administration\services\FeatureService;

require_once($_ENV['RAZ3_OBJECTS_DIR']."/config/config.inc.php");

/**
 * Despite the fact that the implementation of this class rests on session caching, this is
 * appropriate for use not only when you have a named user / subscription but if you have a php
 * script that is not associated with a named user (e.g. you are running "anonymously").
 * 
 * To use this anonymously, instantiate an object of this type and call isFeatureEnabled().
 * 
 * Please note that you must not flip back and forth within the same script between anonymous
 * and named because the non-anonymous features will be cached in the session.
 * @author bwells
 *
 */
class FeatureCheck {	
    public function __construct() {
    }

    public function isFeatureEnabled($featureName) {
        $featureMap = self::getEnabledFeaturesMap();
        $featureValue = !empty($featureMap[$featureName]) ? $featureMap[$featureName] : null;
        return PHPUtil::valueOrDefault($featureValue, false);
    }

    public static function getEnabledFeaturesMap() {
        foreach (array('authInfo', 'kevo', 'teacherAccountInfo', 'cs_authorization') as $key) {
            if (isset($_SESSION[$key]['enabledFeatures'])) {
                return $_SESSION[$key]['enabledFeatures'];
            }
        }

        if (isset($_SESSION['enabledFeatures'])) {
            return $_SESSION['enabledFeatures'];
        }

        // If not set, check session for anonymous guest
        if (!isset($_SESSION['anonymousFeatures'])) {
            $_SESSION['anonymousFeatures'] = FeatureService::getEnabledAnonymousFeatures();
        }
        return $_SESSION['anonymousFeatures'];

    }

    public static function getEnabledFeatures($memberId, $shardId = null) {
        return FeatureService::getEnabledFeatures($memberId, $shardId);
    }
    
    /**
     * Given a firefly user_id value, return an array of all features enabled "for that user".
     * This includes features assigned at any of the following levels:
     * - anonymous ("everyone")
     * - subscription
     * - ff user
     * - member (but only if this user is a TLC)
     * @param int $ffUserId
     */
    public static function getEnabledFeaturesForFFUserId($ffUserId) {
        return FeatureService::getEnabledFeaturesForFFUserId($ffUserId);
    }

    public static function clearAnonymousFeatures() {
        unset($_SESSION['anonymousFeatures']);
    }
}
