<?php
namespace LAZ\example\modules;

use LAZ\objects\base\AbstractModuleRegistry;

/**
 * Class pattern for the front controllers to load the specific registry.
 *  The base Controller will then autoload the model based on instantiated FQN.
 */

class ModuleRegistry extends AbstractModuleRegistry
{
    public function __construct()
    {
        $this->setClassMap();
        $this->setCaseInsensitiveModuleLookup();
        $this->allowedDirectories = [
            __DIR__.'/',
            dirname(__DIR__).'/common/',
            dirname(__DIR__).'/raz-kids',
        ];
    }

    private function setClassMap()
    {
        $this->moduleClasses = array(
            //'students' => \LAZ\example\modules\ExampleStudents::class,
            //'hello_world' => \LAZ\example\modules\HelloWorld::class,
            'crossword' => \LAZ\example\modules\Crossword::class,
        );
    }

}
