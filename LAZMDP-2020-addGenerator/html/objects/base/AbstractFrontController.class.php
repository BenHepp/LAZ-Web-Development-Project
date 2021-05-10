<?php
namespace LAZ\objects\base;

use LAZ\objects\library\OrderedSites;
use LAZ\objects\library\SystemStatus;

abstract class AbstractFrontController extends Controller
{
    const MODULE_IDX = 2;
    protected $inDegradedMode;
    /** @var OrderedSites */
    protected $orderedSites;
    
    public function control() {}

    protected function getBundleBarLinks() {
        $this->setOrderedSites();
        $result = $this->orderedSites->getBundleBarSites();
        $this->setBundleBarAuthLinksNew($result);
        return $result;
    }

    protected function getBundleBarUnlicensedLinks() {
        $this->setOrderedSites();
        $result = $this->orderedSites->getBundleBarUnlicensedSites();
        $this->setBundleBarAuthLinksNew($result);
        return $result;
    }

    private function setOrderedSites() {
        if (!isset($this->orderedSites)) {
            $sessionSubscriptions = !empty($_SESSION['subscriptions']) ? $_SESSION['subscriptions'] : null;
            $subscriptions = (!empty($_SESSION['teacherAccountInfo'])) ? $_SESSION['teacherAccountInfo']['subscriptions'] : $sessionSubscriptions;
            $this->orderedSites = new OrderedSites($subscriptions);
        }
    }

    private function setBundleBarAuthLinksNew(&$bundleBarLinks) {
        foreach ($bundleBarLinks as &$link) {
            $link['authLink'] = $this->getAuthorizerPath($link['abbreviation']);
            $link['condition'] = $link['abbreviation'] == SITE_PREFIX ? 'active' : 'inactive';
        }
    }


    protected function getAuthorizerPath($siteAbbreviation) {
        return "/main/AuthGo/site/$siteAbbreviation/authorizer/bundle";
    }

    protected function getServerUrl($siteAbbreviation) {
        $siteAbbreviation = strtoupper($siteAbbreviation);
        return $_ENV[$siteAbbreviation . '_HTTP_SERVER'];
    }

    protected function hasSubscription($siteAbbreviation) {
        return $_SESSION['has_' . $siteAbbreviation . '_sub'];
    }

    protected function getAuthorizedUsername() {
        return $this->isSessionAuthorized() ? $_SESSION['username'] : false;
    }

    protected function isSessionAuthorized() {
        return $_SESSION['authorized'] == 'yes';
    }

    protected function isInDegradedMode() {
    	if (!isset($this->inDegradedMode)) {
    		$shardConfigurationId = $_SESSION['teacherAccountInfo']['shardConfigurationId'];
    		$this->inDegradedMode = false;
    		if (isset($shardConfigurationId)) {
    			$this->inDegradedMode = SystemStatus::isShardedExternalReportsUnavailable($shardConfigurationId);
    		}
    	}

    	return $this->inDegradedMode;
    }
    
    static public function parseUri($uri) {
        $module = false;
        $params = array();
        $uriParts = explode('/', $uri);
        if (isset($uriParts[self::MODULE_IDX])) {
            $module = strtolower($uriParts[self::MODULE_IDX]);
            for ($i = self::MODULE_IDX + 1; $i < count ($uriParts); $i++) {
                $params[$uriParts[$i]] = $uriParts[$i + 1];
            }
        }
        return array($module, $params);
    }

    protected function moduleToRun($uri) {
        list($module, $params) = self::parseUri($uri);
        if ($module) {
            global $VALS;
            // The various modules expect $VAL and $_GET to be set, so set them
            $VALS['module'] = $module;
            $_GET['module'] = $module;
            
            $this->setRequestVars($params);
            if (isset($_POST)) {
                foreach ($_POST as $key => $value) {
                    $VALS[$key] = $value;
                }
            }
        }
        return $module;
    }

    protected function setRequestVar($key, $value) {
        global $VALS;
        return $_REQUEST[$key] = $VALS[$key] = $_GET[$key] = $value;
    }

    protected function setRequestVars($map) {
        foreach ($map as $key => $value) {
            $this->setRequestVar($key, $value);
        }
    }
}
