<?php

namespace LAZ\objects\config;

use Aura\Autoload\Loader;

class LazLoader extends Loader {
    /**
     *
     * Load the mapped file for a namespace prefix and relative class.
     * Override to load .class.php in addition to .php extensions
     *
     * @param string $prefix The namespace prefix.
     *
     * @param string $relative_class The relative class name.
     *
     * @return mixed Boolean false if no mapped file can be loaded, or the
     * name of the mapped file that was loaded.
     *
     */
    protected function loadFile($prefix, $relative_class)
    {
        // are there any base directories for this namespace prefix?
        if (! isset($this->prefixes[$prefix])) {
            $this->debug[] = "$prefix: no base dirs";
            return false;
        }

        // look through base directories for this namespace prefix
        foreach ($this->prefixes[$prefix] as $base_dir) {

            // replace the namespace prefix with the base directory,
            // replace namespace separators with directory separators
            // in the relative class name, append with .php
            $file = $base_dir
                . str_replace('\\', DIRECTORY_SEPARATOR, $relative_class)
                . '.php';

            $file_class = $base_dir
                . str_replace('\\', DIRECTORY_SEPARATOR, $relative_class)
                . '.class.php';

            // if the mapped file exists, require it
            //////// LAZ MODIFICATION for .class.php files /////////////////////////
            if ($this->requireFile($file_class)) {
                // yes, we're done
                return $file_class;
            } elseif ($this->requireFile($file)) {
                return $file;
            }


            print_r($this);
            // not in the base directory
            $this->debug[] = "$prefix: $file or $file_class not found";
        }

        // never found it
        return false;
    }

}