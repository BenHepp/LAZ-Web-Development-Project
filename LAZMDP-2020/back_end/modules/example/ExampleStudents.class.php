<?php
namespace LAZ\example\modules;

use LAZ\objects\base\Controller;
use LAZ\example\services\ExampleStudentService;

class ExampleStudents extends Controller {

    public function control(ModuleRegistry $moduleRegistry=null) {
        $studentService = new ExampleStudentService();
        $this->view->assign('students', $studentService->getAllStudents());
        $this->view->assign('content', 'exampleStudents');
    }

    public function getModel() {
    }

}