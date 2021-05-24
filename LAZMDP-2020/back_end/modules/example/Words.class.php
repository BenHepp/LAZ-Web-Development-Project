<?php
namespace LAZ\example\modules;

use LAZ\objects\base\Controller;
use LAZ\example\services\WordsService;

class Words extends Controller {

    public function control(ModuleRegistry $moduleRegistry=null) {
        $wordsService = new WordsService();
        $this->view->assign('words', $wordsService->getWords());
        $this->view->assign('content', 'crossword');
    }

    public function getModel() {
    }


}