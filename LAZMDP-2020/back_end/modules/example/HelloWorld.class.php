<?php
namespace LAZ\example\modules;

use LAZ\objects\base\Controller;

class HelloWorld extends Controller {

    public function control(ModuleRegistry $moduleRegistry=null) {
        $this->view->assign('message', "hello world");
        $this->view->assign('content', 'helloWorld');
    }

    public function getModel() {
    }

}