<?php
namespace LAZ\example\modules;

use LAZ\objects\base\AbstractFrontController;
use LAZ\example\modules\ModuleRegistry;

class ExampleFrontController extends AbstractFrontController {
    const DEFAULT_MODULE = "crossword";

    public function control() {
        parent::control();
        $this->runModule($_SERVER['REQUEST_URI']);
        $this->view->display("template");
    }

    private function runModule($uri) {
        $module = $this->moduleToRun($uri) ?: ExampleFrontController::DEFAULT_MODULE;
        $moduleRegistry = new ModuleRegistry();
        $module = $moduleRegistry->getRoute($module);
        if ($module) {
            return new $module($moduleRegistry);
        }
    }

    public function getModel() {
    }
}
