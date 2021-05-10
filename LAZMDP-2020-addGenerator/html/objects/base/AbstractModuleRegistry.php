<?php
namespace LAZ\objects\base;


abstract class AbstractModuleRegistry implements ModuleRegistryInterface
{
    private $routeName;
    protected $allowedDirectories;
    protected $moduleClasses;


    protected function setCaseInsensitiveModuleLookup()
    {
        $this->routeName = [];
        foreach ($this->moduleClasses as $name => $moduleClass) {
            $this->routeName[strtolower($name)] = $name;
        }
    }

    private function getRouteName($moduleName)
    {
        $moduleNameLc = strtolower($moduleName);
        return (!empty($this->routeName[$moduleNameLc]) ? $this->routeName[$moduleNameLc] : null);
    }

    public function getRoute($moduleName)
    {
        $routeName = $this->getRouteName($moduleName);
        if ($routeName && !empty($this->moduleClasses[$routeName])) {
            return $this->moduleClasses[$routeName];
        }
    }

    public function getModuleClasses()
    {
        return $this->moduleClasses;
    }

    public function getAllowedDirectoryPaths()
    {
        return $this->allowedDirectories;
    }

    public function allowedDirectoryNamespaceNames()
    {
        foreach ($this->getAllowedDirectoryPaths() as $directoryPath) {
            $name = str_replace('-', '', basename($directoryPath));
            yield $name => $directoryPath;
        }
    }
}