<?php

function is_windows() {
    return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
}

function is_windows_service_running( $service_name ) {
    $proc = proc_open("sc query $service_name", [
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'], // swallow stderr
    ], $pipes);

    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($proc);

    return preg_match("/RUNNING/m", $stdout);
}


function setMagicConstants()
{
    $_ENV['DB_SERVER'] = "68.183.17.55";
    $_ENV['DB_USER'] = "mdpuser";
    $_ENV['DB_PASSWORD'] = "mdppass";

    $_ENV['RAZ3_OBJECTS_DIR'] = $_ENV['ROOT_WWW_PATH']."/html/objects";
    $_ENV["LP_INSTANCE"] = "local";
    $_ENV["SERVER_NAME"] = $_SERVER["SERVER_NAME"] = "mdp.learninga-z.com";
    $_ENV["HOSTNAME"] = "";
    $_ENV["ERR_EMAIL"] = "";
    $_ENV['LOG_PATH'] = $_ENV['ROOT_WWW_PATH'] . "/log";

    if (is_windows() && is_windows_service_running("NGINX")) {
        $local_protocol = "https";
    } else {
        $local_protocol = "http";
    }


    $SCUT2_PREFIX = array(
        'prod' => '',
        'postprod' => 'post',
        'preprod' => 'pre',
        'dev' => 'dev',
        'devinfra' => 'devinfra',
        'local' => 'dev',
        'mfg' => '',
        '' => 'dev'
    );
    $_ENV['SCUT2_PREFIX'] = $SCUT2_PREFIX[$_ENV['LP_INSTANCE']];

    $AEX_URL = array(
        'prod' => 'http://aex.intellitools.com',
        'postprod' => 'http://post.aex.intellitools.com',
        'preprod' => 'http://pre.aex.intellitools.com',
        'mfg' => 'http://mfg.aex.intellitools.com',
        'dev' => 'http://dev.aex.intellitools.com',
        'infra' => 'http://aex.intellitools.com',
        'local' => 'http://local.aex.intellitools.com',
        '' => 'http://local.aex.intellitools.com'
    );
    $_ENV['AEX_URL'] = $AEX_URL[$_ENV['LP_INSTANCE']];

    $CAMBIUMTECH_URL = array(
        'prod' => 'http://www.cambiumtech.com',
        'postprod' => 'http://post.cambiumtech.com',
        'preprod' => 'http://pre.cambiumtech.com',
        'mfg' => 'http://mfg.cambiumtech.com',
        'dev' => 'http://dev.cambiumtech.com',
        'infra' => 'http://www.cambiumtech.com',
        'local' => 'http://local.cambiumtech.com',
        '' => 'http://local.cambiumtech.com'
    );

    $_ENV['CAMBIUMTECH_URL'] = $CAMBIUMTECH_URL[$_ENV['LP_INSTANCE']];

    $INTELLITOOLS_URL = array(
        'prod' => 'http://www.intellitools.com',
        'postprod' => 'http://post.intellitools.com',
        'preprod' => 'http://pre.intellitools.com',
        'mfg' => 'http://mfg.intellitools.com',
        'dev' => 'http://dev.intellitools.com',
        'infra' => 'http://www.intellitools.com',
        'local' => 'http://local.intellitools.com',
        '' => 'http://local.intellitools.com'
    );

    $_ENV['INTELLITOOLS_URL'] = $INTELLITOOLS_URL[$_ENV['LP_INSTANCE']];

    $INTELLITOOLS_SECURE_URL = array(
        'prod' => 'https://www.intellitools.com',
        'postprod' => 'https://post.intellitools.com',
        'preprod' => 'https://pre.intellitools.com',
        'mfg' => 'http://mfg.intellitools.com',
        'dev' => 'https://dev.intellitools.com',
        'infra' => 'http://www.intellitools.com',
        'local' => $local_protocol . '://local.intellitools.com',
        '' => $local_protocol . '://local.intellitools.com'
    );


    $_ENV['INTELLITOOLS_SECURE_URL'] = $INTELLITOOLS_SECURE_URL[$_ENV['LP_INSTANCE']];

    $KURZWEIL_DOWNLOAD_URL = array(
        'prod' => 'https://www.kurzweiledu.com',
        'postprod' => 'https://www.kurzweiledu.com',
        'preprod' => 'https://www.kurzweiledu.com',
        'mfg' => 'https://www.kurzweiledu.com',
        'dev' => 'https://www.kurzweiledu.com',
        'infra' => 'https://www.kurzweiledu.com',
        'local' => 'https://www.kurzweiledu.com',
        '' => 'https://www.kurzweiledu.com'
    );
    $_ENV['KURZWEIL_DOWNLOAD_URL'] = $KURZWEIL_DOWNLOAD_URL[$_ENV['LP_INSTANCE']];

    $KURZWEIL_SECURE_URL = array(
        'prod' => 'https://www.kurzweiledu.com',
        'postprod' => 'https://post.kurzweiledu.com',
        'preprod' => 'https://pre.kurzweiledu.com',
        'mfg' => 'http://mfg.kurzweiledu.com',
        'dev' => 'https://dev.kurzweiledu.com',
        'infra' => 'https://www.kurzweiledu.com',
        'local' => $local_protocol . '://local.kurzweiledu.com',
        '' => $local_protocol . '://local.kurzweiledu.com'
    );
    $_ENV['KURZWEIL_SECURE_URL'] = $KURZWEIL_SECURE_URL[$_ENV['LP_INSTANCE']];

    $KURZWEIL_URL = array(
        'prod' => 'https://www.kurzweiledu.com',
        'postprod' => 'https://post.kurzweiledu.com',
        'preprod' => 'https://pre.kurzweiledu.com',
        'mfg' => 'http://mfg.kurzweiledu.com',
        'dev' => 'https://dev.kurzweiledu.com',
        'infra' => 'https://www.kurzweiledu.com',
        'local' => $local_protocol . '://local.kurzweiledu.com',
        '' => $local_protocol . '://local.kurzweiledu.com'
    );
    $_ENV['KURZWEIL_URL'] = $KURZWEIL_URL[$_ENV['LP_INSTANCE']];

    $KURZWEIL_INTERNAL_URL = array(
        'prod' => 'http://in.kurzweiledu.com',
        'preprod' => 'http://pre.in.kurzweiledu.com',
        'mfg' => 'http://mfg.in.kurzweiledu.com',
        'dev' => 'http://dev.in.kurzweiledu.com',
        'infra' => 'http://www.in.kurzweiledu.com',
        'local' => 'http://dev.in.kurzweiledu.com',
        '' => 'http://local.kurzweiledu.com'
    );
    $_ENV['KURZWEIL_INTERNAL_URL'] = $KURZWEIL_INTERNAL_URL[$_ENV['LP_INSTANCE']];

    $STAGES_URL = array(
        'prod' => 'http://stages.cambiumlearning.com',
        'postprod' => 'http://post.stages.cambiumlearning.com',
        'preprod' => 'http://pre.stages.cambiumlearning.com',
        'mfg' => 'http://mfg.stages.cambiumlearning.com',
        'dev' => 'http://dev.stages.cambiumlearning.com',
        'infra' => 'http://stages.cambiumlearning.com',
        'local' => 'http://local.stages.cambiumlearning.com',
        '' => 'http://local.stages.cambiumlearning.com'
    );

    $_ENV['STAGES_URL'] = $STAGES_URL[$_ENV['LP_INSTANCE']];

    $LEARNING_PAGE_URL = array(
        'prod' => "http://www.learningpage.com",
        'postprod' => "http://post.learningpage.com",
        'preprod' => "http://pre.learningpage.com",
        'dev' => "http://dev.learningpage.com",
        'mfg' => "http://mfg.learningpage.com",
        'local' => "http://local.learningpage.com",
        '' => "http://local.learningpage.com"
    );
    $_ENV['LEARNING_PAGE_URL'] = $LEARNING_PAGE_URL[$_ENV['LP_INSTANCE']];

    $MEDIA_SERVER_URL = array(
        'prod' => "wss://www.kidsa-z.com/audio_recorder/",
        'postprod' => "wss://post.kidsa-z.com/audio_recorder/",
        'preprod' => "wss://pre.kidsa-z.com/audio_recorder/",
        'dev' => "wss://dev.kidsa-z.com/audio_recorder/",
        'mfg' => "wss://mfg.kidsa-z.com/audio_recorder/",
        'local' => "wss://local.kidsa-z.com/audio_recorder/",
        '' => "wss://local.kidsa-z.com/audio_recorder/"
    );
    $_ENV['MEDIA_SERVER_URL'] = $MEDIA_SERVER_URL[$_ENV['LP_INSTANCE']];

    $VIDEO_DROP_OFF_LOCATION = array(
        'infra' => "/k12/products/admin/video",
        'prod' => "/k12/products/admin/video",
        'mfg' => "/mnt/vol3/Engineering/dropoff/video",
        'postprod' => "/mnt/vol3/Engineering/postprod_dropoff/video",
        'preprod' => "/mnt/mfgtransfer/preprod_dropoff/video",
        'dev' => "/k12/products/admin/video",
        'local' => "/videodropoff",
        '' => "/videodropoff"
    );
    $_ENV['VIDEO_DROP_OFF_LOCATION'] = $VIDEO_DROP_OFF_LOCATION[$_ENV['LP_INSTANCE']];

    $DROP_OFF_LOCATION = array(
        'infra' => "/k12/products/admin/dropoff",
        'prod' => "/k12/products/admin/dropoff",
        'mfg' => "/mnt/vol3/Engineering/dropoff",
        'postprod' => "/mnt/vol3/Engineering/postprod_dropoff",
        'preprod' => "/mnt/mfgtransfer/preprod_dropoff",
        'dev' => "/k12/products/admin/dropoff",
        'local' => "/k12/products/admin/dropoff",
        '' => "/dropoff"
    );
    $_ENV['DROP_OFF_LOCATION'] = $DROP_OFF_LOCATION[$_ENV['LP_INSTANCE']];

    if ($_ENV['LP_INSTANCE'] == 'local') {
        $_ENV['HOSTNAME'] = "";
    }


    $REPORT_FROM_EMAIL_ADDRESS = array(
        'prod' => 'prod@' . $_ENV['HOSTNAME'],
        'postprod' => 'postprod@' . $_ENV['HOSTNAME'],
        'preprod' => 'preprod@' . $_ENV['HOSTNAME'],
        'mfg' => 'mfg@' . $_ENV['HOSTNAME'],
        'dev' => 'dev@' . $_ENV['HOSTNAME'],
        'infra' => 'infra@bin/hostname',
        'local' => $_ENV['ERR_EMAIL']
    );
    $_ENV['REPORT_FROM_EMAIL_ADDRESS'] = $REPORT_FROM_EMAIL_ADDRESS[$_ENV['LP_INSTANCE']];

    $RAZ_SKILLS_HTML_PATH = array(
        'prod' => "https://readinga-z.com/search/",
        'postprod' => "https://post.readinga-z.com/search/",
        'preprod' => "https://pre.readinga-z.com/search/",
        'dev' => "https://dev.readinga-z.com/search/",
        'local' => $local_protocol . "://local.readinga-z.com/search/"
    );
    $_ENV['RAZ_SKILLS_HTML_PATH'] = $RAZ_SKILLS_HTML_PATH[$_ENV['LP_INSTANCE']];

// The scut2 http server is instance-independent.
    $_ENV['SCUT2_HTTP_SERVER'] = 'http://manage.learninga-z.com';

    $LOG_PATH = array(
        'prod' => "/k12/products/admin/log",
        'postprod' => "/k12/products/admin/log",
        'preprod' => "/k12/products/admin/log",
        'mfg' => "/k12/products/admin/log",
        'infra' => "/k12/products/admin/log",
        'dev' => "/k12/products/admin/log",
        'devinfra' => "/k12/products/admin/log",
        'local' => ($_ENV['LOG_PATH'] ? $_ENV['LOG_PATH'] : "/dev/logs"),
        '' => "/dev/logs"
    );
    $_ENV['LOG_PATH'] = $LOG_PATH[$_ENV['LP_INSTANCE']];

    $RAZ_USAGE_LOG_PATH = array(
        'infra' => "/k12/logs/search_logs/readinga-z/txlazweb[0-9]*",
        'dev' => "/k12/logs/search_logs/readinga-z/dmilazweb[0-9]*",
        'prod' => "/k12/logs/search_logs/readinga-z/txlazweb[0-9]*",
        'postprod' => "/k12/logs/search_logs/readinga-z/tmilazweb[0-9]*",
        'preprod' => "/k12/logs/search_logs/readinga-z/pmilazweb[0-9]*",
        'local' => "/dev/logs",
        '' => "/dev/logs"
    );
    $_ENV['RAZ_USAGE_LOG_PATH'] = $RAZ_USAGE_LOG_PATH[$_ENV['LP_INSTANCE']];

    $RK_USAGE_LOG_PATH = array(
        'infra' => "/k12/logs/search_logs/raz-kids/txlazweb",
        'dev' => "/k12/logs/search_logs/raz-kids/dmilazweb",
        'prod' => "/k12/logs/search_logs/raz-kids/txlazweb",
        'postprod' => "/k12/logs/search_logs/raz-kids/tmilazweb",
        'preprod' => "/k12/logs/search_logs/raz-kids/pmilazweb",
        'local' => "/dev/logs",
        '' => "/dev/logs"
    );
    $_ENV['RK_USAGE_LOG_PATH'] = $RK_USAGE_LOG_PATH[$_ENV['LP_INSTANCE']];

    $SAZ_USAGE_LOG_PATH = array(
        'infra' => "/k12/logs/search_logs/sciencea-z/txlazweb",
        'dev' => "/k12/logs/search_logs/sciencea-z/dmilazweb",
        'prod' => "/k12/logs/search_logs/sciencea-z/txlazweb",
        'postprod' => "/k12/logs/search_logs/sciencea-z/tmilazweb",
        'preprod' => "/k12/logs/search_logs/sciencea-z/pmilazweb",
        'local' => "/dev/logs",
        '' => "/dev/logs"
    );
    $_ENV['SAZ_USAGE_LOG_PATH'] = $SAZ_USAGE_LOG_PATH[$_ENV['LP_INSTANCE']];

    $WAZ_USAGE_LOG_PATH = array(
        'infra' => "/k12/logs/search_logs/writinga-z/txlazweb",
        'dev' => "/k12/logs/search_logs/writinga-z/dmilazweb",
        'prod' => "/k12/logs/search_logs/writinga-z/txlazweb",
        'postprod' => "/k12/logs/search_logs/writinga-z/tmilazweb",
        'preprod' => "/k12/logs/search_logs/writinga-z/pmilazweb",
        'local' => "/dev/logs",
        '' => "/dev/logs"
    );
    $_ENV['WAZ_USAGE_LOG_PATH'] = $WAZ_USAGE_LOG_PATH[$_ENV['LP_INSTANCE']];

    $CSI_SEARCH_USAGE_LOG_PATH = array(
        'infra' => "/k12/logs/search_logs/csi/txlazweb[0-9]*",
        'dev' => "/k12/logs/search_logs/csi/dmilazweb[0-9]*",
        'prod' => "/k12/logs/search_logs/csi/txlazweb[0-9]*",
        'postprod' => "/k12/logs/search_logs/csi/tmilazweb[0-9]*",
        'preprod' => "/k12/logs/search_logs/csi/pmilazweb[0-9]*",
        'local' => "/dev/logs",
        '' => $_ENV['LOG_PATH']
    );
    $_ENV['CSI_SEARCH_USAGE_LOG_PATH'] = $CSI_SEARCH_USAGE_LOG_PATH[$_ENV['LP_INSTANCE']];

    $LAZ_CMS_URL = array(
        'prod' => 'http://cms.learninga-z.com/',
        'postprod' => 'http://post.cms.learninga-z.com/',
        'preprod' => 'http://pre.cms.learninga-z.com/',
        'mfg' => 'http://cms.learninga-z.com/',
        'dev' => 'http://dev.cms.learninga-z.com/',
        'infra' => 'http://cms.learninga-z.com/',
        'local' => 'http://local.cms.learninga-z.com/'
    );
    $_ENV['LAZ_CMS_URL'] = $LAZ_CMS_URL[$_ENV['LP_INSTANCE']];

    $RAZ_CMS_URL = array(
        'prod' => 'http://cms.readinga-z.com/',
        'postprod' => 'http://post.cms.readinga-z.com/',
        'preprod' => 'http://pre.cms.readinga-z.com/',
        'mfg' => 'http://cms.readinga-z.com/',
        'dev' => 'http://dev.cms.readinga-z.com/',
        'infra' => 'http://cms.readinga-z.com/',
        'local' => 'http://local.cms.readinga-z.com/'
    );
    $_ENV['RAZ_CMS_URL'] = $RAZ_CMS_URL[$_ENV['LP_INSTANCE']];


    $RK_CMS_URL = array(
        'prod' => 'http://cms.raz-kids.com/',
        'postprod' => 'http://post.cms.raz-kids.com/',
        'preprod' => 'http://pre.cms.raz-kids.com/',
        'mfg' => 'http://cms.raz-kids.com/',
        'dev' => 'http://dev.cms.raz-kids.com/',
        'infra' => 'http://cms.raz-kids.com/',
        'local' => 'http://local.cms.raz-kids.com/'
    );
    $_ENV['RK_CMS_URL'] = $RK_CMS_URL[$_ENV['LP_INSTANCE']];


    $RT_CMS_URL = array(
        'prod' => 'http://cms.reading-tutors.com/',
        'postprod' => 'http://post.cms.reading-tutors.com/',
        'preprod' => 'http://pre.cms.reading-tutors.com/',
        'mfg' => 'http://cms.reading-tutors.com/',
        'dev' => 'http://dev.cms.reading-tutors.com/',
        'infra' => 'http://cms.reading-tutors.com/',
        'local' => 'http://local.cms.reading-tutors.com/'
    );
    $_ENV['RT_CMS_URL'] = $RT_CMS_URL[$_ENV['LP_INSTANCE']];


    $VOCAB_CMS_URL = array(
        'prod' => 'http://cms.vocabularya-z.com/',
        'postprod' => 'http://post.cms.vocabularya-z.com/',
        'preprod' => 'http://pre.cms.vocabularya-z.com/',
        'mfg' => 'http://cms.vocabularya-z.com/',
        'dev' => 'http://dev.cms.vocabularya-z.com/',
        'infra' => 'http://cms.vocabularya-z.com/',
        'local' => 'http://local.cms.vocabularya-z.com/'
    );
    $_ENV['VOCAB_CMS_URL'] = $VOCAB_CMS_URL[$_ENV['LP_INSTANCE']];


    $SAZ_CMS_URL = array(
        'prod' => 'http://cms.sciencea-z.com/',
        'postprod' => 'http://post.cms.sciencea-z.com/',
        'preprod' => 'http://pre.cms.sciencea-z.com/',
        'mfg' => 'http://cms.sciencea-z.com/',
        'dev' => 'http://dev.cms.sciencea-z.com/',
        'infra' => 'http://cms.sciencea-z.com/',
        'local' => 'http://local.cms.sciencea-z.com/'
    );
    $_ENV['SAZ_CMS_URL'] = $SAZ_CMS_URL[$_ENV['LP_INSTANCE']];

    $WAZ_CMS_URL = array(
        'prod' => 'http://cms.writinga-z.com/',
        'postprod' => 'http://post.cms.writinga-z.com/',
        'preprod' => 'http://pre.cms.writinga-z.com/',
        'mfg' => 'http://cms.writinga-z.com/',
        'dev' => 'http://dev.cms.writinga-z.com/',
        'infra' => 'http://cms.writinga-z.com/',
        'local' => 'http://local.cms.writinga-z.com/'
    );
    $_ENV['WAZ_CMS_URL'] = $WAZ_CMS_URL[$_ENV['LP_INSTANCE']];

    $HEADSPROUT_CMS_URL = array(
        'prod' => 'http://cms.headsprout.com/',
        'postprod' => 'http://post.cms.headsprout.com/',
        'preprod' => 'http://pre.cms.headsprout.com/',
        'mfg' => 'http://cms.headsprout.com/',
        'dev' => 'http://dev.cms.headsprout.com/',
        'infra' => 'http://cms.headsprout.com/',
        'local' => 'http://local.cms.headsprout.com/'
    );
    $_ENV['HEADSPROUT_CMS_URL'] = $HEADSPROUT_CMS_URL[$_ENV['LP_INSTANCE']];

    /*
    $TR_URL = array(
            'prod'     => 'http://testreadya-z.com/',
            'postprod' => 'https://post.testreadya-z.com/',
            'preprod'  => 'https://pre.testreadya-z.com/',
            'mfg'      => 'http://mfg.testreadya-z.com/',
            'dev'      => 'https://dev.testreadya-z.com/',
            'local'    => $local_protocol . '://local.testreadya-z.com/'
    );
    $_ENV['TR_URL'] = $TR_URL[$_ENV['LP_INSTANCE']];
    */

    $_ENV['RAZ_CMS_REPORTS_PATH'] = "/k12/reports/raztopsearches/";
    $_ENV['RAZ_CMS_SYM_LINK_PATH'] = "/k12/products/admin/web/raz-var/www/html/internal/webroot/raz-cms/content/";
    $_ENV['RAZ_LOCAL_URL'] = "http://local.readinga-z.com";
    $_ENV['RAZ_URL'] = "http://www.readinga-z.com";
    $_ENV['RAZPLUS_URL'] = "http://www.raz-plus.com";

    $_ENV['PROD_CSI_INDEX_PATH'] = "/k12/content/lucene_search_indexes/csi/prod";
    $_ENV['PREPROD_CSI_INDEX_PATH'] = "/k12/content/lucene_search_indexes/csi/preprod";
    $_ENV['MFG_CSI_INDEX_PATH'] = "/k12/content/lucene_search_indexes/csi/preprod";
    $_ENV['DEV_CSI_INDEX_PATH'] = "/k12/content/lucene_search_indexes/csi/dev";
    $_ENV['LOCAL_CSI_INDEX_PATH'] = "/dev/content/lucene_search_indexes/csi";


    $ROCKET_CONTENT_PATH = array(
        'prod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'postprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'preprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'mfg' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'dev' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'infra' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/images/rocket/student_rocket_info.json",
        'local' => "/kepler/workspace/www/html/kidsa-z/images/rocket/student_rocket_info.json"
    );

    $EMPTY_ROCKET_PATH = array(
        'prod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'postprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'preprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'mfg' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'dev' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'infra' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket.json",
        'local' => "/kepler/workspace/www/html/kidsa-z/empty_rocket.json"
    );

    $EMPTY_ROCKET_CATALOG_PATH = array(
        'prod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'postprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'preprod' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'mfg' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'dev' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'infra' => "/k12/products/admin/web/raz-var/www/html/kidsa-z/empty_rocket_catalog.json",
        'local' => "/kepler/workspace/www/html/kidsa-z/empty_rocket_catalog.json"
    );

    $_ENV['EMPTY_ROCKET_CATALOG_PATH'] = $EMPTY_ROCKET_CATALOG_PATH[$_ENV['LP_INSTANCE']];

    $_ENV['EMPTY_ROCKET_PATH'] = $EMPTY_ROCKET_PATH[$_ENV['LP_INSTANCE']];

    $_ENV['ROCKET_CONTENT_PATH'] = $ROCKET_CONTENT_PATH[$_ENV['LP_INSTANCE']];

    $RAZ_SEARCH_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/raz",
        'postprod' => "/k12/content/lucene_search_indexes/raz",
        'preprod' => "/k12/content/lucene_search_indexes/raz",
        'mfg' => "/k12/content/lucene_search_indexes/raz",
        'dev' => "/k12/content/lucene_search_indexes/raz",
        'infra' => "/k12/content/lucene_search_indexes/raz",
        'local' => "/dev/content/lucene_search_indexes/raz"
    );
    $_ENV['RAZ_SEARCH_INDEX_PATH'] = $RAZ_SEARCH_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $SAZ_SEARCH_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/saz",
        'postprod' => "/k12/content/lucene_search_indexes/saz",
        'preprod' => "/k12/content/lucene_search_indexes/saz",
        'mfg' => "/k12/content/lucene_search_indexes/saz",
        'dev' => "/k12/content/lucene_search_indexes/saz",
        'infra' => "/k12/content/lucene_search_indexes/saz",
        'local' => "/dev/content/lucene_search_indexes/saz"
    );
    $_ENV['SAZ_SEARCH_INDEX_PATH'] = $SAZ_SEARCH_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $SAZ_SEARCH_HISTORY_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'postprod' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'preprod' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'mfg' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'dev' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'infra' => "/k12/content/lucene_search_indexes/sazSearchHistory",
        'local' => "/dev/content/lucene_search_indexes/sazSearchHistory"
    );
    $_ENV['SAZ_SEARCH_HISTORY_INDEX_PATH'] = $SAZ_SEARCH_HISTORY_INDEX_PATH [$_ENV['LP_INSTANCE']];

    $RAZ_SEARCH_HISTORY_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'postprod' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'preprod' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'mfg' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'dev' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'infra' => "/k12/content/lucene_search_indexes/razSearchHistory",
        'local' => "/dev/content/lucene_search_indexes/razSearchHistory"
    );
    $_ENV['RAZ_SEARCH_HISTORY_INDEX_PATH'] = $RAZ_SEARCH_HISTORY_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $RK_SEARCH_HISTORY_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'postprod' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'preprod' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'mfg' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'dev' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'infra' => "/k12/content/lucene_search_indexes/rkSearchHistory",
        'local' => "/dev/content/lucene_search_indexes/rkSearchHistory"
    );
    $_ENV['RK_SEARCH_HISTORY_INDEX_PATH'] = $RK_SEARCH_HISTORY_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $RK_SEARCH_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/rk",
        'postprod' => "/k12/content/lucene_search_indexes/rk",
        'preprod' => "/k12/content/lucene_search_indexes/rk",
        'mfg' => "/k12/content/lucene_search_indexes/rk",
        'dev' => "/k12/content/lucene_search_indexes/rk",
        'infra' => "/k12/content/lucene_search_indexes/rk",
        'local' => "/dev/content/lucene_search_indexes/rk"
    );
    $_ENV['RK_SEARCH_INDEX_PATH'] = $RK_SEARCH_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $WAZ_SEARCH_HISTORY_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'postprod' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'preprod' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'mfg' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'dev' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'infra' => "/k12/content/lucene_search_indexes/wazSearchHistory",
        'local' => "/dev/content/lucene_search_indexes/wazSearchHistory"
    );
    $_ENV['WAZ_SEARCH_HISTORY_INDEX_PATH'] = $WAZ_SEARCH_HISTORY_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $WAZ_SEARCH_INDEX_PATH = array(
        'prod' => "/k12/content/lucene_search_indexes/waz",
        'postprod' => "/k12/content/lucene_search_indexes/waz",
        'preprod' => "/k12/content/lucene_search_indexes/waz",
        'mfg' => "/k12/content/lucene_search_indexes/waz",
        'dev' => "/k12/content/lucene_search_indexes/waz",
        'infra' => "/k12/content/lucene_search_indexes/waz",
        'local' => "/dev/content/lucene_search_indexes/waz"
    );
    $_ENV['WAZ_SEARCH_INDEX_PATH'] = $WAZ_SEARCH_INDEX_PATH[$_ENV['LP_INSTANCE']];

    $INFRA_SERVER_ADDRESS = array(
        'prod' => 'txlazinf01.learninga-z.com',
        'postprod' => 'dmilazinf01.learninga-z.com',
        'preprod' => 'dmilazinf01.learninga-z.com',
        'mfg' => 'txlazinf01.learninga-z.com',
        'dev' => 'dmilazinf01.learninga-z.com',
        'infra' => 'txlazinf01.learninga-z.com',
        'local' => 'local.txlazinf01.learninga-z.com',
        '' => 'dmilazinf01.learninga-z.com'
    );
    $_ENV['INFRA_SERVER_ADDRESS'] = $INFRA_SERVER_ADDRESS[$_ENV['LP_INSTANCE']];

    $DB_CONTENT_SERVERS = array(
        'prod' => '127.0.0.1:3326',
        'postprod' => '127.0.0.1:3326',
        'preprod' => '127.0.0.1:3326',
        'dev' => '127.0.0.1:3326',
        'local' => 'localhost:3306',
        'infra' => 'txlazidb:3346',
        'mfg' => '127.0.0.1:3306',
        '' => '127.0.0.1:3306'
    );
    $_ENV['DB_CONTENT_SERVER'] = $DB_CONTENT_SERVERS[$_ENV['LP_INSTANCE']];

    $DB_EXTERNAL_REPORT_SERVERS = array(
        'prod' => 'txlazedb:3356',
        'postprod' => 'tmilazdb:3356',
        'preprod' => 'pmilazdb:3356',
        'dev' => 'dmilazdb:3356',
        'devinfra' => 'dmilazdb:3356',
        'local' => 'localhost:3306',
        'infra' => 'txlazidb:3346',
        'mfg' => '127.0.0.1:3306',
        '' => '127.0.0.1:3306'
    );

    $_ENV['DB_EXTERNAL_REPORT_SERVER'] = $DB_EXTERNAL_REPORT_SERVERS[$_ENV['LP_INSTANCE']];

    $DB_INTERNAL_REPORT_SERVERS = array(
        'prod' => 'txlazidb:3346',
        'postprod' => 'tmilazdb:3346',
        'preprod' => 'pmilazdb:3346',
        'dev' => 'dmilazdb:3346',
        'devinfra' => 'dmilazdb:3346',
        'local' => 'localhost:3306',
        'infra' => 'txlazidb:3346',
        'mfg' => 'txlazidb:3346',
        '' => '127.0.0.1:3306'
    );
    $_ENV['DB_INTERNAL_REPORT_SERVER'] = $DB_INTERNAL_REPORT_SERVERS[$_ENV['LP_INSTANCE']];

//Open House
    $_ENV['openHouse'] = array(
        'rttStartDate' => '2007-05-07',
        'rakStartDate' => '2007-05-08',
        'vocStartDate' => '2007-05-11'
    );

    $DB_AUTOBUILDER_SERVER = array(
        'local' => 'pmilazbld01:3306',
        'devinfra' => 'pmilazbld01:3306'
    );
    $_ENV['DB_AUTOBUILDER_SERVER'] = $DB_AUTOBUILDER_SERVER[$_ENV['LP_INSTANCE']];

    $domain_instance = array(
        'prod' => 'www',
        'postprod' => 'post',
        'preprod' => 'pre',
        'dev' => 'dev',
        'local' => 'local',
        '' => 'local'
    );
    $_ENV['domain_instance'] = $domain_instance[$_ENV['LP_INSTANCE']];

    $content_instance_prefix = array(
        'prod' => '',
        'mfg' => 'mfg',
        'postprod' => 'post',
        'preprod' => 'pre',
        'dev' => 'dev',
        'local' => 'local',
        '' => 'local'
    );
    if ( isset($_ENV['EFFECTIVE_CONTENT_INSTANCE']) && ($_ENV['LP_INSTANCE'] == 'local') ) {
        $_ENV['content_instance_prefix'] = $content_instance_prefix[$_ENV['EFFECTIVE_CONTENT_INSTANCE']];
    } else {
        $_ENV['content_instance_prefix'] = $content_instance_prefix[$_ENV['LP_INSTANCE']];
    }


// these are the host names for the csi site.
// the blank value at the end is for machines that do not have
// $_ENV['LP_INSTANCE'] set
    $csi_server_host = array(
        'prod' => 'csi.learninga-z.com',
        'postprod' => 'post.csi.learninga-z.com',
        'preprod' => 'pre.csi.learninga-z.com',
        'dev' => 'dev.csi.learninga-z.com',
        'local' => 'local.csi.learninga-z.com',
        '' => 'local.csi.learninga-z.com'
    );
    $_ENV['csi_server_host'] = $csi_server_host[$_ENV['LP_INSTANCE']];

// these are the host names for the admin site.
// the blank value at the end is for machines that do not have
// $_ENV['LP_INSTANCE'] set
    $admin_server_host = array(
        'prod' => 'admin.pqlp.prod.learningpage.com/reports',
        'postprod' => 'post.admin.learninga-z.com/reports',
        'preprod' => 'pre.admin.learninga-z.com/reports',
        'dev' => 'dev.admin.learninga-z.com/reports',
        'local' => 'local.admin.learninga-z.com/reports',
        '' => 'local.admin.learninga-z.com/reports'
    );

    $_ENV['_admin_server_host'] = $admin_server_host[$_ENV['LP_INSTANCE']];

    $el_admin_server_host = array(
        'prod' => 'dashboard.explorelearning.com',
        'postprod' => 'post.dashboard.explorelearning.com',
        'preprod' => 'pre.dashboard.explorelearning.com',
        'dev' => 'dev.dashboard.explorelearning.com',
        'local' => 'local.dashboard.explorelearning.com',
        '' => 'local.dashboard.explorelearning.com'
    );

    $_ENV['el_admin_server_host'] = $el_admin_server_host[$_ENV['LP_INSTANCE']];

    $raz_server_host = array(
        'prod' => 'https://www.readinga-z.com',
        'postprod' => 'https://post.readinga-z.com',
        'preprod' => 'https://pre.readinga-z.com',
        'dev' => 'https://dev.readinga-z.com',
        'mfg' => 'https://mfg.readinga-z.com',
        'local' => $local_protocol . '://local.readinga-z.com',
        '' => $local_protocol . '://local.readinga-z.com'
    );
    $_ENV['RAZ_HTTP_SERVER'] = $raz_server_host[$_ENV['LP_INSTANCE']];

//$_ENV['RAZ_ELL_HTTP_SERVER'] = $_ENV['RAZ_HTTP_SERVER'] . '/ell/enhanced-ell-solution';
    $_ENV['RAZ_ELL_HTTP_SERVER'] = $_ENV['RAZ_HTTP_SERVER'] . '/ell/ell-edition';

    $razplus_server_host = array(
        'prod' => 'https://www.raz-plus.com',
        'postprod' => 'https://post.raz-plus.com',
        'preprod' => 'https://pre.raz-plus.com',
        'dev' => 'https://dev.raz-plus.com',
        'mfg' => 'https://mfg.raz-plus.com',
        'local' => $local_protocol . '://local.raz-plus.com',
        '' => $local_protocol . '://local.raz-plus.com'
    );
    $_ENV['RAZPLUS_HTTP_SERVER'] = $razplus_server_host[$_ENV['LP_INSTANCE']];


// Right now, we don't support instances of this in the various stacks -
// We just redirect to the prod version.
    $_ENV['HELP_LAZ_HTTP_SERVER'] = 'http://help.learninga-z.com';

    $headsprout_server_host = array(
        'prod' => 'https://www.headsprout.com',
        'postprod' => 'https://post.headsprout.com',
        'preprod' => 'https://pre.headsprout.com',
        'dev' => 'https://dev.headsprout.com',
        'mfg' => 'https://mfg.headsprout.com',
        'local' => $local_protocol . '://local.headsprout.com',
        '' => $local_protocol . '://local.headsprout.com'
    );

    $_ENV['HEADSPROUT_HTTP_SERVER'] = $headsprout_server_host[$_ENV['LP_INSTANCE']];

    $rk_server_host = array(
        'prod' => 'https://www.raz-kids.com',
        'postprod' => 'https://post.raz-kids.com',
        'preprod' => 'https://pre.raz-kids.com',
        'dev' => 'https://dev.raz-kids.com',
        'mfg' => 'https://mfg.raz-kids.com',
        'local' => $local_protocol . '://local.raz-kids.com',
        '' => $local_protocol . '://local.raz-kids.com'
    );
    $_ENV['RK_HTTP_SERVER'] = $rk_server_host[$_ENV['LP_INSTANCE']];

    $rt_server_host = array(
        'prod' => 'https://www.reading-tutors.com',
        'postprod' => 'https://post.reading-tutors.com',
        'preprod' => 'https://pre.reading-tutors.com',
        'dev' => 'https://dev.reading-tutors.com',
        'mfg' => 'https://mfg.reading-tutors.com',
        'local' => $local_protocol . '://local.reading-tutors.com',
        '' => $local_protocol . '://local.reading-tutors.com'
    );
    $_ENV['RT_HTTP_SERVER'] = $rt_server_host[$_ENV['LP_INSTANCE']];

    $vocab_server_host = array(
        'prod' => 'https://www.vocabularya-z.com',
        'postprod' => 'https://post.vocabularya-z.com',
        'preprod' => 'https://pre.vocabularya-z.com',
        'dev' => 'https://dev.vocabularya-z.com',
        'mfg' => 'https://mfg.vocabularya-z.com',
        'local' => $local_protocol . '://local.vocabularya-z.com',
        '' => $local_protocol . '://local.vocabularya-z.com'
    );
    $_ENV['VOCAB_HTTP_SERVER'] = $vocab_server_host[$_ENV['LP_INSTANCE']];

    $waz_server_host = array(
        'prod' => 'https://www.writinga-z.com',
        'postprod' => 'https://post.writinga-z.com',
        'preprod' => 'https://pre.writinga-z.com',
        'dev' => 'https://dev.writinga-z.com',
        'mfg' => 'https://mfg.writinga-z.com',
        'local' => $local_protocol . '://local.writinga-z.com',
        '' => $local_protocol . '://local.writinga-z.com'
    );
    $_ENV['WAZ_HTTP_SERVER'] = $waz_server_host[$_ENV['LP_INSTANCE']];

    $kaz_server_host = array(
        'prod' => 'https://www.kidsa-z.com',
        'postprod' => 'https://post.kidsa-z.com',
        'preprod' => 'https://pre.kidsa-z.com',
        'dev' => 'https://dev.kidsa-z.com',
        'mfg' => 'https://mfg.kidsa-z.com',
        'local' => $local_protocol . '://local.kidsa-z.com',
        '' => $local_protocol . '://local.kidsa-z.com'
    );
    $_ENV['KAZ_HTTP_SERVER'] = $kaz_server_host[$_ENV['LP_INSTANCE']];

    $saz_admin_server_host = array(
        'prod' => 'https://www.sciencea-z.com',
        'postprod' => 'https://post.sciencea-z.com',
        'preprod' => 'https://pre.sciencea-z.com',
        'dev' => 'https://dev.sciencea-z.com',
        'mfg' => 'https://mfg.sciencea-z.com',
        'local' => $local_protocol . '://local.sciencea-z.com',
        '' => $local_protocol . '://local.sciencea-z.com'
    );

    $_ENV['SAZ_HTTP_SERVER'] = $saz_admin_server_host[$_ENV['LP_INSTANCE']];

    $laz_server_host = array(
        'prod' => 'https://www.learninga-z.com',
        'postprod' => 'https://pre.learninga-z.com',
        'preprod' => 'https://pre.learninga-z.com',
        'dev' => 'https://pre.learninga-z.com',
        'mfg' => 'http://staging.learninga-z.com',
        'devinfra' => 'https://pre.learninga-z.com',
        'local' => 'https://pre.learninga-z.com',
        '' => 'https://pre.learninga-z.com'
    );

    $_ENV['LAZ_HTTP_SERVER'] = $laz_server_host[$_ENV['LP_INSTANCE']];

    $ff_server_host = array(
        'prod' => 'https://www.kurzweil3000.com',
        'postprod' => 'https://post.kurzweil3000.com',
        'preprod' => 'https://pre.kurzweil3000.com',
        'dev' => 'https://dev.kurzweil3000.com',
        'mfg' => 'http://mfg.kurzweil3000.com',
        'local' => $local_protocol . '://local.kurzweil3000.com',
        '' => $local_protocol . '://local.kurzweil3000.com'
    );

    $_ENV['FF_HTTP_SERVER'] = $ff_server_host[$_ENV['LP_INSTANCE']];

    $tr_server_host = array(
        'prod' => 'https://www.readytesta-z.com',
        'postprod' => 'https://post.readytesta-z.com',
        'preprod' => 'https://pre.readytesta-z.com',
        'dev' => 'https://dev.readytesta-z.com',
        'mfg' => 'https://mfg.readytesta-z.com',
        'local' => $local_protocol . '://local.readytesta-z.com',
        '' => $local_protocol . '://local.readytesta-z.com'
    );
    $_ENV['TR_HTTP_SERVER'] = $tr_server_host[$_ENV['LP_INSTANCE']];

    $laz_admin_server_host = array(
        'prod' => 'dashboard.learninga-z.com',
        'postprod' => 'post.dashboard.learninga-z.com',
        'preprod' => 'pre.dashboard.learninga-z.com',
        'dev' => 'dev.dashboard.learninga-z.com',
        'local' => 'local.dashboard.learninga-z.com',
        '' => 'local.dashboard.learninga-z.com'
    );

    $_ENV['laz_admin_server_host'] = $laz_admin_server_host[$_ENV['LP_INSTANCE']];

    $csi_http_server = array(
        'prod' => 'http://csi.learninga-z.com',
        'postprod' => 'http://post.csi.learninga-z.com',
        'preprod' => 'http://pre.csi.learninga-z.com',
        'dev' => 'http://dev.csi.learninga-z.com',
        'local' => 'http://local.csi.learninga-z.com',
        '' => 'http://local.csi.learninga-z.com'
    );

    $_ENV['CSI_HTTP_SERVER'] = $csi_http_server[$_ENV['LP_INSTANCE']];


    $raz_usage_server_host = array(
        'prod' => 'in.sf.readinga-z.com',
        'postprod' => 'post.readinga-z.com',
        'preprod' => 'pre.readinga-z.com',
        'dev' => 'dev.readinga-z.com',
        'local' => 'local.readinga-z.com',
        '' => 'local.readinga-z.com'
    );
    $_ENV['raz_usage_server_host'] = $raz_usage_server_host[$_ENV['LP_INSTANCE']];

// This must line up exactly with $_ENV['raz_usage_server_host'] except for the protocol specifier.
    $raz_usage_http_server = array(
        'prod' => 'http://in.sf.readinga-z.com',
        'postprod' => 'https://post.readinga-z.com',
        'preprod' => 'https://pre.readinga-z.com',
        'dev' => 'https://dev.readinga-z.com',
        'local' => $local_protocol . '://local.readinga-z.com',
        '' => $local_protocol . '://local.readinga-z.com'
    );
    $_ENV['RAZ_USAGE_HTTP_SERVER'] = $raz_usage_http_server[$_ENV['LP_INSTANCE']];

// This must line up exactly with $_ENV['kaz_usage_server_host'] except for the protocol specifier.
    $kaz_usage_http_server = array(
        'prod' => 'http://in.sf.kidsa-z.com',
        'postprod' => 'https://post.kidsa-z.com',
        'preprod' => 'https://pre.kidsa-z.com',
        'dev' => 'https://dev.kidsa-z.com',
        'local' => $local_protocol . '://local.kidsa-z.com',
        '' => $local_protocol . '://local.kidsa-z.com'
    );
    $_ENV['KAZ_USAGE_HTTP_SERVER'] = $kaz_usage_http_server[$_ENV['LP_INSTANCE']];


    $kaz_usage_server_host = array(
        'prod' => 'in.sf.kidsa-z.com',
        'postprod' => 'post.kidsa-z.com',
        'preprod' => 'pre.kidsa-z.com',
        'dev' => 'dev.kidsa-z.com',
        'local' => 'local.kidsa-z.com',
        '' => 'local.kidsa-z.com'
    );
    $_ENV['kaz_usage_server_host'] = $kaz_usage_server_host[$_ENV['LP_INSTANCE']];

    $accountsweb_internal_server_host = array(
        'prod' => 'http://in.accounts.learninga-z.com',
        'postprod' => 'http://post.in.accounts.learninga-z.com',
        'preprod' => 'http://pre.in.accounts.learninga-z.com',
        'dev' => 'http://dev.in.accounts.learninga-z.com',
        'local' => 'http://local.accounts.learninga-z.com',
        '' => 'http://local.accounts.learninga-z.com'
    );
    $_ENV['accountsweb_internal_server_host'] = $accountsweb_internal_server_host[$_ENV['LP_INSTANCE']];

    $accountsweb_server_host = array(
        'prod' => 'https://accounts.learninga-z.com',
        'postprod' => 'https://post.accounts.learninga-z.com',
        'preprod' => 'https://pre.accounts.learninga-z.com',
        'dev' => 'https://dev.accounts.learninga-z.com',
        'local' => $local_protocol . '://local.accounts.learninga-z.com',
        '' => $local_protocol . '://local.accounts.learninga-z.com'
    );
    $_ENV['accountsweb_server_host'] = $accountsweb_server_host[$_ENV['LP_INSTANCE']];

    $ffaccountsweb_server_host = array(
        'prod' => 'https://accounts.kurzweil3000.com',
        'postprod' => 'https://post.accounts.kurzweil3000.com',
        'preprod' => 'https://pre.accounts.kurzweil3000.com',
        'dev' => 'https://dev.accounts.kurzweil3000.com',
        'local' => $local_protocol . '://local.accounts.kurzweil3000.com',
        '' => $local_protocol . '://local.accounts.kurzweil3000.com'
    );

    $_ENV['ffaccountsweb_server_host'] = $ffaccountsweb_server_host[$_ENV['LP_INSTANCE']];

    $email_open_track_host = array(
        'prod' => 'http://accounts.learninga-z.com',
        'postprod' => 'http://post.accounts.learninga-z.com',
        'preprod' => 'http://pre.accounts.learninga-z.com',
        'dev' => 'http://dev.accounts.learninga-z.com',
        'local' => 'http://local.accounts.learninga-z.com',
        '' => 'http://local.accounts.learninga-z.com'
    );

    $_ENV['email_open_track_host'] = $email_open_track_host[$_ENV['LP_INSTANCE']];

    $ipRequestUrl = array(
        'prod' => 'http://accounts.learninga-z.com',
        'postprod' => 'http://post.accounts.learninga-z.com',
        'preprod' => 'http://pre.accounts.learninga-z.com',
        'dev' => 'http://dev.accounts.learninga-z.com',
        'local' => 'http://local.accounts.learninga-z.com',
        '' => 'http://local.accounts.learninga-z.com'
    );

    $_ENV['IP_REQUEST_URL'] = $ipRequestUrl[$_ENV['LP_INSTANCE']];

    $autoBuilderUrl = array(
        'devinfra' => 'http://autobuilder.learninga-z.com',
        'local' => 'http://local.autobuilder.learninga-z.com',
        '' => 'http://local.autobuilder.learninga-z.com'
    );

    $_ENV['AUTOBUILDER_URL'] = $autoBuilderUrl[$_ENV['LP_INSTANCE']];

    $raz_cookie_path = array(
        'prod' => '.readinga-z.com',
        'postprod' => 'post.readinga-z.com',
        'preprod' => 'pre.readinga-z.com',
        'mfg' => 'mfg.readinga-z.com',
        'dev' => 'dev.readinga-z.com',
        'local' => 'local.readinga-z.com',
        '' => 'local.readinga-z.com'
    );
    $_ENV['raz_cookie_path'] = $raz_cookie_path[$_ENV['LP_INSTANCE']];

    $razplus_cookie_path = array(
        'prod' => '.raz-plus.com',
        'postprod' => 'post.raz-plus.com',
        'preprod' => 'pre.raz-plus.com',
        'mfg' => 'mfg.raz-plus.com',
        'dev' => 'dev.raz-plus.com',
        'local' => 'local.raz-plus.com',
        '' => 'local.raz-plus.com'
    );
    $_ENV['razplus_cookie_path'] = $razplus_cookie_path[$_ENV['LP_INSTANCE']];

    $waz_cookie_path = array(
        'prod' => '.writinga-z.com',
        'postprod' => 'post.writinga-z.com',
        'preprod' => 'pre.writinga-z.com',
        'mfg' => 'mfg.writinga-z.com',
        'dev' => 'dev.writinga-z.com',
        'local' => 'local.writinga-z.com',
        '' => 'local.writinga-z.com'
    );
    $_ENV['waz_cookie_path'] = $waz_cookie_path[$_ENV['LP_INSTANCE']];

    $rt_cookie_path = array(
        'prod' => '.reading-tutors.com',
        'postprod' => 'post.reading-tutors.com',
        'preprod' => 'pre.reading-tutors.com',
        'mfg' => 'mfg.reading-tutors.com',
        'dev' => 'dev.reading-tutors.com',
        'local' => 'local.reading-tutors.com',
        '' => 'local.reading-tutors.com'
    );
    $_ENV['rt_cookie_path'] = $rt_cookie_path[$_ENV['LP_INSTANCE']];

    $rk_cookie_path = array(
        'prod' => '.raz-kids.com',
        'postprod' => 'post.raz-kids.com',
        'preprod' => 'pre.raz-kids.com',
        'mfg' => 'mfg.raz-kids.com',
        'dev' => 'dev.raz-kids.com',
        'local' => 'local.raz-kids.com',
        '' => 'local.raz-kids.com'
    );

    $_ENV['rk_cookie_path'] = $rk_cookie_path[$_ENV['LP_INSTANCE']];

    $vocab_cookie_path = array(
        'prod' => '.vocabularya-z.com',
        'postprod' => 'post.vocabularya-z.com',
        'preprod' => 'pre.vocabularya-z.com',
        'mfg' => 'mfg.vocabularya-z.com',
        'dev' => 'dev.vocabularya-z.com',
        'local' => 'local.vocabularya-z.com',
        '' => 'local.vocabularya-z.com'
    );

    $_ENV['vocab_cookie_path'] = $vocab_cookie_path[$_ENV['LP_INSTANCE']];

    $customer_service_email_list = array(
        'prod' => 'LAZReportsCustomerService@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['laz_customer_service_email_list'] = $customer_service_email_list[$_ENV['LP_INSTANCE']];

    $dunning_reports_email_list = array(
        'prod' => 'LAZReportsCustomerService@learninga-z.com,LAZSalesOps@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com,Greg.Brewer@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com,Greg.Brewer@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com,Greg.Brewer@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['dunning_reports_email_list'] = $dunning_reports_email_list[$_ENV['LP_INSTANCE']];

    $AUTOBUILDER_EMAIL_LIST = array(
        'devinfra' => 'AAEngBuildNotification@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );
    $_ENV['AUTOBUILDER_EMAIL_LIST'] = $AUTOBUILDER_EMAIL_LIST[$_ENV['LP_INSTANCE']];

    $raz_search_usage_email_list = array(
        'prod' => 'AAEngReports@learninga-z.com',
        'infra' => 'AAEngReports@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['raz_search_usage_email_list'] = $raz_search_usage_email_list[$_ENV['LP_INSTANCE']];


    $saleshead_email_list = array(
        'prod' => 'AA-K-12LPReportsSales@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['saleshead_email_list'] = $saleshead_email_list[$_ENV['LP_INSTANCE']];


    $cs_user_audit_reporting_email_list = array(
        'prod' => 'AAEngReports@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['cs_user_audit_reporting_email_list'] = $cs_user_audit_reporting_email_list[$_ENV['LP_INSTANCE']];


    $spoc_email_list = array(
        'prod' => 'AA-K-12LPReportsFinancial@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['spoc_email_list'] = $spoc_email_list[$_ENV['LP_INSTANCE']];

    $daily_financial_email_list = array(
        'prod' => 'LAZReportsFinancialDaily@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['daily_financial_email_list'] = $daily_financial_email_list[$_ENV['LP_INSTANCE']];

    $ki_daily_bookings_email_list = array(
        'prod' => 'KIReportsSales@cambiumtech.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['ki_daily_bookings_email_list'] = $ki_daily_bookings_email_list[$_ENV['LP_INSTANCE']];


    $reportsDevelopmentEmailList = array(
        'prod' => 'AAEngReports@learninga-z.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'infra' => 'AAEngReports@learninga-z.com',
        'infra2' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['reports_development_list'] = $reportsDevelopmentEmailList[$_ENV['LP_INSTANCE']];

    $cronEmailList = array(
        'prod' => 'AA-K-12Crontasks@learninga-z.com',
        'postprod' => 'AA-K-12Crontasks@learninga-z.com',
        'preprod' => 'AA-K-12Crontasks@learninga-z.com',
        'mfg' => 'AA-K-12Crontasks@learninga-z.com',
        'infra' => 'AA-K-12Crontasks@learninga-z.com',
        'dev' => 'AA-K-12Crontasks@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['cronEmailList'] = $cronEmailList[$_ENV['LP_INSTANCE']];


    $temp_file_location_list = array(
        'prod' => '/k12/products/admin/tmp/',
        'postprod' => '/k12/products/admin/tmp/',
        'preprod' => '/k12/products/admin/tmp/',
        'mfg' => '/k12/products/admin/tmp/',
        'dev' => '/k12/products/admin/tmp/',
        'devinfra' => '/k12/products/admin/tmp/',
        'local' => '/temp/',
        '' => '/temp/'
    );

    $_ENV['temp_file_location'] = $temp_file_location_list[$_ENV['LP_INSTANCE']];
    $_ENV['temp_report_location'] = $_ENV['temp_file_location'];

    $raz_cms_script_location = array(
        'mfg' => '/k12/products/admin/admin/raz-cms/',
        'postprod' => '/k12/products/admin/admin/raz-cms/',
        'preprod' => '/k12/products/admin/admin/raz-cms/',
        'dev' => '/k12/products/admin/admin/raz-cms/',
        'local' => '/k12/products/admin/admin/raz-cms/'
    );

    $_ENV['raz_cms_script_location'] = $raz_cms_script_location[$_ENV['LP_INSTANCE']];

// -----------------
// hostname and port for the webservice
// -----------------

    $webservice_tombox = array(
        'prod' => "localhost:3001",
        'postprod' => "localhost:3001",
        'preprod' => "localhost:3001",
        'infra' => "localhost:3001",
        'dev' => "localhost:3001",
        'local' => "localhost:3001",
        'mfg' => "localhost:3001",
        '' => "localhost:3001"
    );

    $_ENV['WEBSERVICE_TOMBOX'] = $webservice_tombox[$_ENV['LP_INSTANCE']];

    $RAZ_URL = array(
        'prod' => 'https://readinga-z.com',
        'postprod' => 'https://post.readinga-z.com',
        'preprod' => 'https://pre.readinga-z.com',
        'mfg' => 'http://mfg.readinga-z.com',
        'dev' => 'https://dev.readinga-z.com',
        'infra' => 'http://readinga-z.com',
        'local' => $local_protocol . '://local.readinga-z.com'
    );

    $_ENV['RAZ_URL'] = $RAZ_URL[$_ENV['LP_INSTANCE']];


// these are the email domains that we can send email to on any non production instance
// if the users email address is not from these domains then we send the email to
// $_ENV['ERR_EMAIL'] instead

    $_ENV['okay_to_email_domains'] = array(
        'cambiumtech.com',
        'cambiumlearning.com',
        'explorelearning.com',
        'kurzweiledu.com',
        'learning-page.com',
        'learninga-z.com',
        'learningpage.com',
        'raz-kids.com',
        'reading-tutors.com',
        'readinga-z.com',
        'readingk-5.com',
        'readingk5.com',
        'sciencea-z.com',
        'sitesforparents.com',
        'sitesforteachers.com',
        'vocabularya-z.com',
        'voyagercompany.com',
        'voyagerlearning.com',
        'voyagersopris.com',
        'writinga-z.com'
    );


    $_ENV['campaign_seed_local_parts'] = array(
        'lazcampaignseed',
        'kicampaignseed',
        'elcampaignseed'
    );

// -----------------
// FTP information for sending the payment report to voyager
// -----------------


    $_ENV['ftp_host'] = "ftpuser.voyagerlearning.com";
    $_ENV['ftp_dir'] = "intapps/LearningPage/Invoices";
    $_ENV['ftp_web_bookings_dir'] = "intapps/LearningPage/WebBookings";
    $_ENV['ftp_username'] = "VoyagerGuest";
    $_ENV['ftp_password'] = "guesT4Download";

//LAZ SFTP

    $_ENV['LAZ_SFTP_HOST'] = 'sftp.learninga-z.com';
    $_ENV['LAZ_SFTP_USERNAME'] = 'lprod';
    $_ENV['LAZ_SFTP_PASSWORD'] = 'pw4lprod';
    $_ENV['LAZ_SFTP_PORT'] = 22224;
    $_ENV['LAZ_SFTP_DIR'] = 'customer_data/';
    $_ENV['KE_SFTP_DIR'] = 'ke_customer_data/';

// -----------------
// Dashboard settings
// -----------------
    $generateDashboardCSV = array(
        'prod' => false,
        'postprod' => false,
        'preprod' => false,
        'mfg' => false,
        'dev' => false,
        'local' => true,
        '' => true
    );
    $_ENV['generateDashboardCSV'] = $generateDashboardCSV[$_ENV['LP_INSTANCE']];


    $domainPrefix = array(
        "www",
        "local.preview",
        "local",
        "dev.preview",
        "pre.preview",
        "preview",
        "mfg",
        "pre",
        "dev"
    );
    $_ENV['lazGoogleAnalyticsCookieDomain'] = str_replace($domainPrefix, "", $_SERVER["SERVER_NAME"]);
//------------------
//Original GoogleAnalytics
//------------------
    $lazOrigianalGAIDByCookieDomain = array(
        '.learninga-z.com' => 'UA-6523470-22',
        '.sciencea-z.com' => 'UA-6523470-5',
        '.kidsa-z.com' => 'UA-6523470-2',
        '.readinga-z.com' => 'UA-6523470-1',
        '.reading-tutors.com' => 'UA-6523470-3',
        '.headsprout.com' => 'UA-31847-1',
        '.readytesta-z.com' => 'UA-6523470-44',
        '.raz-kids.com' => 'UA-6523470-45',
        '.writinga-z.com' => 'UA-6523470-4',
        '.raz-plus.com' => 'UA-6523470-46'
    );
    $_ENV['lazOrigGoogleAnalyticsUID'] = isset($lazOrigianalGAIDByCookieDomain[$_ENV['lazGoogleAnalyticsCookieDomain']]) ? $lazOrigianalGAIDByCookieDomain[$_ENV['lazGoogleAnalyticsCookieDomain']] : null;


// -----------------
// GoogleAnalytics settings
// -----------------
    $lazGoogleAnalyticsUID = array(
        'prod' => 'UA-6523470-43',
        'postprod' => 'UA-6523470-42',
        'preprod' => 'UA-6523470-42',
        'mfg' => 'UA-6523470-42',
        'dev' => 'UA-6523470-42',
        'local' => 'UA-6523470-42',
        '' => 'UA-6523470-42'
    );
    $_ENV['lazGoogleAnalyticsUID'] = $lazGoogleAnalyticsUID[$_ENV['LP_INSTANCE']];

// -----------------
// Database connection file locations
// -----------------
    $_ENV['ACCOUNTS_EXTERNAL_REPORTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/accounts_external_reports.inc.php";

    $_ENV['ACCOUNTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/accounts.inc.php";
    $_ENV['ACCOUNTS_INTERNAL_REPORTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/accounts_internal_reports.inc.php";
    $_ENV['INCOMPLETE_ORDERS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/incomplete_orders.inc.php";
    $_ENV['RAZ_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/raz_content.inc.php";
    $_ENV['CMS_PLAYER_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/cms_player_content.inc.php";
    $_ENV['CMS_RAZ_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/cms_raz_content.inc.php";
    $_ENV['CMS_RK_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/cms_rk_content.inc.php";
    $_ENV['SPRITE_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/sprite_content.inc.php";
    $_ENV['RT_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/rt_content.inc.php";
    $_ENV['SAZ_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/saz_content.inc.php";
    $_ENV['VOCAB_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/vocab_content.inc.php";
    $_ENV['VOCAB_USER_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/vocab_user.inc.php";
    $_ENV['WAZ_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/waz_content.inc.php";
    $_ENV['USAGE_STATS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/usage_data.inc.php";
    $_ENV['USAGE_ROLLUP_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/usage_rollup.inc.php";
    $_ENV['TILE_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/tile_content.inc.php";
    $_ENV['CONTENT_PROMOTION_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/content_promotion.inc.php";
    $_ENV['INFORMATION_SCHEMA_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/information_schema.inc.php";
    $_ENV['TRACKING_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/tracking.inc.php";
    $_ENV['TRACKING_INTERNAL_REPORTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/tracking_internal_reports.inc.php";
    $_ENV['IP_LOCATION_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/iploc_content.inc.php";
    $_ENV['SITE_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/site_content.inc.php";
    $_ENV['PREPROD_AUTOBUILDER_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/preprod_autobuilder.inc.php";
    $_ENV['PLAYER_CONTENT_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/player_content.inc.php";

//-----------------
    $_ENV['KI_ACCOUNTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_accounts.inc.php";
    $_ENV['KI_ACCOUNTS_INTERNAL_REPORTS_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_accounts_internal_reports.inc.php";

    $_ENV['KI_INTELLIFORUM_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_intelliforum.inc.php";//Used by AEX
    $_ENV['KI_GOLDMINE_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_goldmine.inc.php";
    $_ENV['KI_SEMAPHOREEMAIL_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_semaphoremail.inc.php";//Used by AEX
    $_ENV['KI_SALESF0RCE_LOADER_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ki_salesforce_loader.inc.php";

    $_ENV['FF_USER_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/ff_user.inc.php";
    $_ENV['FF_EXTERNAL_USER_DB_CONNECTION_FILE'] = $_ENV['RAZ3_OBJECTS_DIR'] . "/connections/firefly_external_user.inc.php";

// -----------------
// Content locations for windows servers
// -----------------
    $_ENV['RAZ_CONTENT_SITE_FOR_DEV'] = "https://dev.readinga-z.com";
    $_ENV['TUTORS_CONTENT_SITE_FOR_DEV'] = "https://dev.reading-tutors.com";
    $_ENV['KIDS_CONTENT_SITE_FOR_DEV'] = "http://local.kidsa-z.com";
    $_ENV['CONTENT_SHARED_SECRET'] = "(0nt3nt$3(r3t";

    $content_store_base = array(
        'prod' => '/k12/content',
        'mfg' => '/k12/content',
        'postprod' => '/k12/content',
        'preprod' => '/k12/content',
        'dev' => '/k12/content',
        'local' => '/dev/content'
    );

    $_ENV['CONTENT_STORE_BASE_DIR'] = $content_store_base[$_ENV['LP_INSTANCE']];

// -----------------
// LAZ "Remember Me" Cookie
// -----------------
    $_ENV['LAZ_REMEMBER_ME'] = "remember_me";

    $_ENV['dos_valve_threshold'] = 30;

    $_ENV['mp3_bit_rate'] = 64;

    $_ENV['quiz_version'] = 2;

    $_ENV['KI_UNASSIGNED_SALES_REP_ID'] = 197;


    $LOG_LEVEL_list = array(
        'prod' => 'WARNING',
        'postprod' => 'WARNING',
        'preprod' => 'WARNING',
        'infra' => 'WARNING',
        'mfg' => 'WARNING',
        'dev' => 'WARNING',
        'local' => 'DEBUG',
        '' => 'DEBUG'
    );

    $_ENV['LOG_LEVEL'] = $LOG_LEVEL_list[$_ENV['LP_INSTANCE']];

    $_ENV['LAZ_DIVISION_ID'] = 1;
    $_ENV['EL_DIVISION_ID'] = 2;
    $_ENV['KI_DIVISION_ID'] = 4;
    $_ENV['CLT_DIVISION_ID'] = 5;
    $_ENV['VSL_DIVISION_ID'] = 6;

    $_ENV['CAMPAIGNSEED'][$_ENV['LAZ_DIVISION_ID']] = 'lazcampaignseed@learninga-z.com';
    $_ENV['CAMPAIGNSEED'][$_ENV['KI_DIVISION_ID']] = 'kicampaignseed@learninga-z.com';

    $_ENV['QUALITY_CHECK_EMAIL_GROUP'][$_ENV['LAZ_DIVISION_ID']] = 'lazqualitycontrol@learninga-z.com';
    $_ENV['QUALITY_CHECK_EMAIL_GROUP'][$_ENV['KI_DIVISION_ID']] = 'kesqualitycontrol@kurzweiledu.com';

    $_ENV['NO_BOOKINGS_REP_ASSIGNED'][$_ENV['LAZ_DIVISION_ID']] = 382;
    $_ENV['NO_BOOKINGS_REP_ASSIGNED'][$_ENV['EL_DIVISION_ID']] = 196;
    $_ENV['NO_BOOKINGS_REP_ASSIGNED'][$_ENV['KI_DIVISION_ID']] = 197;

    $_ENV['UNASSIGNED_SALES_REP_ID'][$_ENV['LAZ_DIVISION_ID']] = 195;
    $_ENV['UNASSIGNED_SALES_REP_ID'][$_ENV['EL_DIVISION_ID']] = 196;
    $_ENV['UNASSIGNED_SALES_REP_ID'][$_ENV['KI_DIVISION_ID']] = 197;

    $_ENV['UNASSIGNED_TERRITORY_GROUP_ID'][$_ENV['LAZ_DIVISION_ID']] = 1;

    $_ENV['INVOICE_LINK'] = 'http://attjdeint1.clg.local/LAZELInvoice/LAZELInvoice.aspx?InvoiceNumber=';
    $_ENV['HELPSPOT_URL'] = 'http://support.cambiumtech.com';

    $_ENV['teacher_username_for_rk_ipad_sample'] = 'ipadprod';
    $_ENV['student_id_for_rk_ipad_sample'] = 2769866;
    $_ENV['student_account_id_for_rk_ipad_sample'] = 2769866;


    $jde_order_entry_webservice_url = array(
        'prod' => "http://webapp.sopriswest.com:800/WebServices.asmx?WSDL",
        'postprod' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        'preprod' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        'infra' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        'dev' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        'local' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        'mfg' => "http://10.212.14.74:800/WebServices.asmx?WSDL",
        '' => "http://10.212.14.74:800/WebServices.asmx?WSDL"
    );

    $_ENV['jde_order_entry_webservice_url'] = $jde_order_entry_webservice_url[$_ENV['LP_INSTANCE']];

    $deploymentConfigPath = array(
        'prod' => "/k12/products/admin/config",
        'mfg' => "/k12/products/admin/config",
        'postprod' => "/k12/products/admin/config",
        'preprod' => "/k12/products/admin/config",
        'infra' => "/k12/products/admin/config",
        'dev' => "/k12/products/admin/config",
        'devinfra' => "/k12/products/admin/config",
        'local' => "{$_ENV['RAZ3_OBJECTS_DIR']}/data",
        '' => "{$_ENV['RAZ3_OBJECTS_DIR']}/data"
    );

    $_ENV['DEPLOYMENT_CONFIG_PATH'] = $deploymentConfigPath[$_ENV['LP_INSTANCE']];

    $jde_address_book_number_for_catalog_orders = array(
        'prod' => "504541",
        'postprod' => "493951",
        'preprod' => "493951",
        'infra' => "493951",
        'dev' => "493951",
        'local' => "493951",
        'mfg' => "493951",
        '' => "493951"
    );

    $_ENV['jde_address_book_number_for_catalog_orders'] = $jde_address_book_number_for_catalog_orders[$_ENV['LP_INSTANCE']];


    $int_onlineorder_email_list = array(
        'prod' => 'onlineorders@intellitools.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['int_onlineorder_email_list'] = $int_onlineorder_email_list[$_ENV['LP_INSTANCE']];

    $ff_autoroster_bcc_email_list = array(
        'prod' => 'KESAutorosterNotification@kurzweiledu.com',
        'postprod' => 'KESAutorosterNotification@kurzweiledu.com',
        'preprod' => 'KESAutorosterNotification@kurzweiledu.com',
        'mfg' => 'KESAutorosterNotification@kurzweiledu.com',
        'dev' => 'KESAutorosterNotification@kurzweiledu.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['ff_autoroster_bcc_email_list'] = $ff_autoroster_bcc_email_list[$_ENV['LP_INSTANCE']];

    $wkhtmltopdf_script = array(
        'prod' => '/usr/local/bin/wkhtmltopdf',
        'postprod' => '/usr/local/bin/wkhtmltopdf',
        'preprod' => '/usr/local/bin/wkhtmltopdf',
        'mfg' => '/tools/wkhtmltopdf/wkhtmltopdf',
        'dev' => '/usr/local/bin/wkhtmltopdf',
        'local' => (strtolower(PHP_OS) == 'linux' ? '/dev/tools/wkhtmltopdf/bin/wkhtmltopdf' : '/dev/tools/wkhtmltopdf-0.12.2/wkhtmltopdf.exe'),
        '' => (strtolower(PHP_OS) == 'linux' ? '/dev/tools/wkhtmltopdf/bin/wkhtmltopdf' : '/dev/tools/wkhtmltopdf-0.12.2/wkhtmltopdf.exe'),
    );
    $_ENV['wkhtmltopdf_script'] = $wkhtmltopdf_script[$_ENV['LP_INSTANCE']];


// Where the recordings live
// This needs to agree with rkback.properties archiveStreamsDir.
    $_ENV['ARCHIVED_RECORDINGS_STORAGE_ROOT'] = "/mnt/shared_storage/audio_recordings/shard";


// Where the "message recordings" live.
// The recordings are in <this root>/<bucket number>/<message_recording_id>.mp3
    $_ENV['MESSAGE_RECORDINGS_STORAGE_ROOT'] = "/mnt/shared_storage/audio_recordings/messages";

// This needs to agree with rkback.properties archiveDeviceTempStreamsDir.
    $_ENV['UPLOAD_DEVICE_RECORDINGS_STAGING_ROOT'] = "/mnt/shared_storage/audio_recordings/multipart_upload_staging";

// Where the subscription shard move recovery files (filtered dumps of the PKM table) will live.
    $_ENV['RK_MOVE_RECOVERY_STORAGE_ROOT'] = "/mnt/shared_storage/rk_move_recovery";

// The root folder for miscellaneous "database report files".
    $_ENV['DB_REPORT_FILES_STORAGE_ROOT'] = "/mnt/shared_storage/db_report_files";

// The root folder for archived 'batch add/update' files
    $_ENV['BATCHADD_STORAGE_ROOT'] = "/mnt/shared_storage/batch_add";

// The root folder for suppression lists from email company.
    $_ENV['SUPPRESSION_LIST_REPORT_FILES_STORAGE_ROOT'] = "/mnt/shared_storage/email_suppression_lists";

    $_ENV['KES_UL2_ROOT'] = '/mnt/kes_shared_storage/universal_library/storage/ul2';
    $_ENV['KES_FILE_CACHE_ROOT'] = '/mnt/kes_shared_storage/kurzweil_file_cache_storage';
    $_ENV['KES_USER_CONTENT_ROOT'] = '/mnt/kes_shared_storage/kurzweil_user_content_storage';

    $_ENV['KES_CUSTOMER_ARCHIVAL_ROOT'] = '/mnt/kes_shared_storage/customer_archival_root';

    $_ENV['SLOW_QUERY_LOG_FOLDER'] = '/mnt/shared_storage/slow_query_audit';

// The full path to the "generic student recording" to be substituted into demo students.
    $_ENV['GENERIC_DEMO_STUDENT_RECORDING_FILE'] = '/mnt/shared_storage/audio_recordings/demo_member/student.mp3';

// The folder containing resource-specific demo recordings to be substituted into demo students.
    $_ENV['GENERIC_DEMO_STUDENT_RESOURCE_RECORDINGS_FOLDER'] = '/mnt/shared_storage/audio_recordings/demo_member/resource_recordings';

// Database insert throttle for subscription shard move, or any other
// repetitive insert operation.
    $ROWS_PER_SECOND_DB_INSERT_THROTTLE = array(
        'infra' => 0,
        'prod' => 0,
        'mfg' => 0,
        'postprod' => 0,
        'preprod' => 0,
        'dev' => 0,
        'local' => 0,
        '' => 0
    );
    $_ENV['ROWS_PER_SECOND_DB_INSERT_THROTTLE'] = $ROWS_PER_SECOND_DB_INSERT_THROTTLE[$_ENV['LP_INSTANCE']];

    $_ENV['laz_daily_usage_start_at'] = '2012-10-31';
    $_ENV['el_daily_usage_start_at'] = '2012-10-31';

    $_ENV['mobile_error_messages'] = array(
        'teacher_not_found' => 'That teacher username could not be found.',
        'invalid_teacher' => 'This app requires an active license to Raz-Kids.',
        'empty_roster' => 'The teacher has not rostered any students.',
        'nobody_enabled' => 'Access has not been enabled for this class.',
        'maintenance' => 'Down for scheduled maintenance - please try back later.',
        'session_required' => 'Session unavailable.',
        'invalid_student' => 'Student not found. Try again.',
        'something_is_wrong' => 'Something went wrong. Try again.',
        'shard_inconsistency' => 'Database farm assignment inconsistency.  Please contact customer support.'
    );

// We have a model for how long a subscription shard move data copy will take based on the number
// of rk_activity rows for this subscription.  This is the parameter for this model.
    $SSM_COPY_ACTIVITIES_PER_SECOND_ESTIMATE = array(
        'infra' => 30,
        'prod' => 200,
        'mfg' => 30,
        'postprod' => 200,
        'preprod' => 200,
        'dev' => 200,
        'local' => 30,
        '' => 30
    );
    $_ENV['SSM_COPY_ACTIVITIES_PER_SECOND_ESTIMATE'] = $SSM_COPY_ACTIVITIES_PER_SECOND_ESTIMATE[$_ENV['LP_INSTANCE']];

// We have a model for how long a subscription shard move data purge will take based on the number
// of rk_activity rows for this subscription.  This is the parameter for this model.
    $SSM_PURGE_ACTIVITIES_PER_SECOND_ESTIMATE = array(
        'infra' => 100,
        'prod' => 800,
        'mfg' => 100,
        'postprod' => 800,
        'preprod' => 800,
        'dev' => 800,
        'local' => 100,
        '' => 100
    );
    $_ENV['SSM_PURGE_ACTIVITIES_PER_SECOND_ESTIMATE'] = $SSM_PURGE_ACTIVITIES_PER_SECOND_ESTIMATE[$_ENV['LP_INSTANCE']];

//external user configurations

    $externalCSVArchivePath = array(
        'prod' => "/k12/reports/external_user_data/",
        'mfg' => "/k12/reports/external_user_data/",
        'postprod' => "/k12/reports/external_user_data/",
        'preprod' => "/k12/reports/external_user_data/",
        'infra' => "/k12/reports/external_user_data/",
        'dev' => "/k12/reports/external_user_data/",
        'local' => "/k12/reports/external_user_data/"
    );
    $_ENV['EXT_CSV_ARCHIVE_PATH'] = $externalCSVArchivePath[$_ENV['LP_INSTANCE']];

    $COPY_TABLE_PARTIAL_COLUMNS_ROWS_PER_SECOND_ESTIMATE = array(
        'infra' => 2000,
        'prod' => 6000,
        'mfg' => 6000,
        'postprod' => 6000,
        'preprod' => 6000,
        'dev' => 6000,
        'local' => 2000,
        '' => 2000
    );
    $_ENV['COPY_TABLE_PARTIAL_COLUMNS_ROWS_PER_SECOND_ESTIMATE'] = $COPY_TABLE_PARTIAL_COLUMNS_ROWS_PER_SECOND_ESTIMATE[$_ENV['LP_INSTANCE']];

// for Kurzweil auto-roster archiving of csv files
    $externalKECSVArchivePath = array(
        'prod' => "/k12/reports/ke_external_user_data/",
        'mfg' => "/k12/reports/ke_external_user_data/",
        'postprod' => "/k12/reports/ke_external_user_data/",
        'preprod' => "/k12/reports/ke_external_user_data/",
        'infra' => "/k12/reports/ke_external_user_data/",
        'dev' => "/k12/reports/ke_external_user_data/",
        'local' => "/k12/reports/ke_external_user_data/"
    );
    $_ENV['EXT_KE_CSV_ARCHIVE_PATH'] = $externalKECSVArchivePath[$_ENV['LP_INSTANCE']];

// Writing files will be stored under here in
// /mnt/shared_storage/writing/shard<shard_configuration_id>/<trunc_writing__id>/<fileprefix>_<writing_id>.<extension>,
// where <trunc_writing_id> is the last 3 digits of the writing_id value, left-padded with 0's as necessary to achieve 3 digits.
    $_ENV['WRITING_PROJECT_ROOT'] = "/mnt/shared_storage/writing/shard";

    $_ENV['GENERIC_SHARDED_FILE_ROOT'] = "/mnt/shared_storage";

//Constructed Quiz responses will be stored under here
    $_ENV['QUIZRESULTS_PROJECT_ROOT'] = "/mnt/shared_storage/quiz_results/shard";

    $_ENV['RK_WRAPPER_BOOK_IDS'] = array(997, 1006, 280, 454, 1209, 1025, 996, 461, 1325, 968, 294, 1255, 973, 930);

// For things that specifically require special access to the content, e.g., indexing, and frequent writes (like the
//  ticker), or that use the BUILDTAG in the URL (since CDN's outside of our control don't currently support that)
    $home_full_stack_content_server = array(
        'prod' => "https://content.kidsa-z.com",
        'postprod' => "https://post.content.kidsa-z.com",
        'preprod' => "https://pre.content.kidsa-z.com",
        'infra' => "",
        'dev' => "https://dev.content.kidsa-z.com",
        'local' => !empty($_ENV['LOCAL_CONTENT_SERVER_URL']) ? $_ENV['LOCAL_CONTENT_SERVER_URL'] : "",
        'mfg' => "https://mfg.content.kidsa-z.com",
        '' => ""
    );
    $_ENV['home_full_stack_content_server'] = $home_full_stack_content_server[$_ENV['LP_INSTANCE']];
    $_ENV['resource_ticker_server'] = $home_full_stack_content_server[$_ENV['LP_INSTANCE']];

    $buildNotificationEmail = array(
        'prod' => "AAEngBuildNotification@learninga-z.com",
        'mfg' => "AAEngBuildNotification@learninga-z.com",
        'postprod' => "AAEngBuildNotification@learninga-z.com",
        'preprod' => "AAEngBuildNotification@learninga-z.com",
        'infra' => "AAEngBuildNotification@learninga-z.com",
        'dev' => "AAEngBuildNotification@learninga-z.com",
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );
    $_ENV['BUILD_NOTIFICATION_EMAIL'] = $buildNotificationEmail[$_ENV['LP_INSTANCE']];

    $_ENV['RK_SITE_ID'] = 2;
    $_ENV['WAZ_SITE_ID'] = 4;
    $_ENV['RAZ_SITE_ID'] = 5;
    $_ENV['SAZ_SITE_ID'] = 8;
    $_ENV['RAZ_ELL_SITE_ID'] = 19;
    $_ENV['HSER_SITE_ID'] = 20;
    $_ENV['HSRC_SITE_ID'] = 21;
    $_ENV['TESTPREP_SITE_ID'] = 22;
    $_ENV['HEADSPROUT_SITE_ID'] = 23;

    $SOLR_SERVERS = array(
        'prod' => 'txlazsrch01:8983',
        'postprod' => 'tmilazdb:8983',
        'preprod' => 'pmilazdb:8983',
        'dev' => 'dmilazdb:8983',
        'local' => 'localhost:8983',
        '' => 'localhost:8983'
    );

    $_ENV['SOLR_SERVER'] = $SOLR_SERVERS[$_ENV['LP_INSTANCE']];

    $SOLR_IMPORT_REQUEST_WAIT = array(
        'prod' => 2000,
        'postprod' => 2000,
        'preprod' => 2000,
        'dev' => 2000,
        'local' => 2000,
        '' => 2000
    );

    $_ENV['SOLR_IMPORT_REQUEST_WAIT'] = $SOLR_IMPORT_REQUEST_WAIT[$_ENV['LP_INSTANCE']];

    $SOLR_IMPORT_STATUS_WAIT = array(
        'prod' => 250,
        'postprod' => 250,
        'preprod' => 250,
        'dev' => 250,
        'local' => 250,
        '' => 250
    );

    $_ENV['SOLR_IMPORT_STATUS_WAIT'] = $SOLR_IMPORT_STATUS_WAIT[$_ENV['LP_INSTANCE']];

    $SOLR_IMPORT_REPLICATION_WAIT = array(
        'prod' => 250,
        'postprod' => 250,
        'preprod' => 250,
        'dev' => 250,
        'local' => 250,
        '' => 250
    );

    $_ENV['SOLR_IMPORT_REPLICATION_WAIT'] = $SOLR_IMPORT_REPLICATION_WAIT[$_ENV['LP_INSTANCE']];

    $SERVER_PREFIX = array(
        'prod' => 'txlazweb',
        'postprod' => 'tmilazweb',
        'preprod' => 'pmilazweb',
        'dev' => 'dmilazweb',
        'local' => 'localhost',
        '' => 'localhost'
    );

    $_ENV['SERVER_PREFIX'] = $SERVER_PREFIX[$_ENV['LP_INSTANCE']];

    $SALESFORCE_URL = array(
        'prod' => 'https://login.salesforce.com/',
        'postprod' => 'https://test.salesforce.com/',
        'preprod' => 'https://test.salesforce.com/',
        'dev' => 'https://test.salesforce.com/',
        'local' => 'https://test.salesforce.com/',
        '' => 'https://test.salesforce.com/'
    );

    $_ENV['SALESFORCE_URL'] = $SALESFORCE_URL[$_ENV['LP_INSTANCE']];

    /**
     * We allow DAL authentication to only these sites.
     * @var array
     */
    $_ENV['ALLOW_DAL_AUTHENTICATION_TO_SITES'] = array(
        'account' => 'account',
        'accounts' => 'accounts',
        'raz' => 'raz',
        'rt' => 'rt',
        'saz' => 'saz',
        'raz-ell' => 'raz-ell'
    );

// begin Kurzweil SSO config info
    $_ENV['KURZWEIL_CLEVER_TOKEN_URL'] = 'https://clever.com/oauth/tokens';
    $_ENV['KURZWEIL_CLEVER_ME_URL'] = 'https://api.clever.com/me';

    $_ENV['KURZWEIL_CLASSLINK_TOKEN_URL'] = "https://launchpad.classlink.com/oauth2/v2/token";
    $_ENV['KURZWEIL_CLASSLINK_ME_URL'] = "https://nodeapi.classlink.com/v2/my/info";

    $KURZWEIL_CLASSLINK_CLIENT_ID = array(
        'kurzweil3000' => 'c150601016999005179a0df558306d384be8ae8ef5f9fb',
        'kurzweil3000post' => 'c1506010117511c0632fb2194a6b6cecab8f2f164a29c4',
        'kurzweil3000pre' => 'c1506010075904b8020f652d0b882ef6c0ceb4b142c0b7',
        'kurzweil3000dev' => 'c150600989845222ca4bd843552ea8649f69cee91f76eb',
        'kurzweil3000local' => 'c15060100164649bf79569f63f1a060c7c89c035426bdf'
    );

    $_ENV['KURZWEIL_CLASSLINK_CLIENT_ID'] = $KURZWEIL_CLASSLINK_CLIENT_ID;

    $KURZWEIL_CLASSLINK_APP_SECRET = array(
        'kurzweil3000' => '315bd31845b68b5bdf38230afd5bd867',
        'kurzweil3000post' => '9247e70a0790b187242cdbc89eaaefb6',
        'kurzweil3000pre' => '579893ad0aad30dd626022605568c2b3',
        'kurzweil3000dev' => '3a4a03f9c0a1764ec01da46c79218f52',
        'kurzweil3000local' => '2d88266d4da5462529f8214ce03ffeb6'
    );

    $_ENV['KURZWEIL_CLASSLINK_APP_SECRET'] = $KURZWEIL_CLASSLINK_APP_SECRET;

    $KURZWEIL_CLASSLINK_APP_STATE = array(
        'kurzweil3000' => '44Fes32832a4b',
        'kurzweil3000post' => '4594rAj3298a',
        'kurzweil3000pre' => '4594rAj3298b',
        'kurzweil3000dev' => '4594rAj3298c',
        'kurzweil3000local' => '4594rAj3298d'
    );
    $_ENV['KURZWEIL_CLASSLINK_APP_STATE'] = $KURZWEIL_CLASSLINK_APP_STATE;


    $KURZWEIL_CLEVER_APP_CLIENT_ID = array(
        'kurzweil3000' => '237fed7b396708bba831',
        'kurzweil3000pilot' => 'e2aa101cc3e76b6308fc',
        'kurzweil3000dev' => '713bfd06da0efe8a05ce'
    );
    $_ENV['KURZWEIL_CLEVER_APP_CLIENT_ID'] = $KURZWEIL_CLEVER_APP_CLIENT_ID;

    $KURZWEIL_CLEVER_APP_SECRET = array(
        'kurzweil3000' => 'd43ae9d442d308708cfbb4635c4d13f42a1b92ae',
        'kurzweil3000pilot' => '11ece6309ac6bdc025a671ee24188d0a13d41550',
        'kurzweil3000dev' => '1471351b1f561a7f627fb58dabbbb0f1259cdd12'
    );

    $_ENV['KURZWEIL_CLEVER_APP_SECRET'] = $KURZWEIL_CLEVER_APP_SECRET;

# must match a redirect url in https://apps.clever.com/partner/applications/55b03415cef2d3010000022c
    $KURZWEIL_CLEVER_APP_SSO_REDIRECT_URL = array(
        'kurzweil3000' => 'https://kidsa-z.com/main/LoginExternal/?app=learningaz',
        'kurzweil3000pilot' => 'https://pre.kidsa-z.com/main/LoginExternal/?app=learningazpilot',
        'kurzweil3000dev' => 'http://local.kidsa-z.com/main/LoginExternal/?app=learningazdev'
    );
    $_ENV['KURZWEIL_CLEVER_APP_SSO_REDIRECT_URL'] = $KURZWEIL_CLEVER_APP_SSO_REDIRECT_URL;

    $KURZWEIL_JWT_SECRET = array(
        'globed' => 'globeddogaraz',
        'ig3' => 'ig3laz',
        'ctn' => 'ctnkurzweil3000',
        'isr' => 'eduISRkurzweil3000',
        'kurzweiltest' => 'KurzweilTestDistrict'
    );

    $_ENV['KURZWEIL_JWT_SECRET'] = $KURZWEIL_JWT_SECRET;
// END Kurzweil SSO config info


//LAZ SSO
    $_ENV['CLEVER_TOKEN_URL'] = 'https://clever.com/oauth/tokens';
    $_ENV['CLEVER_ME_URL'] = 'https://api.clever.com/me';

    $_ENV['CLASSLINK_TOKEN_URL'] = "https://launchpad.classlink.com/oauth2/v2/token";
    $_ENV['CLASSLINK_ME_URL'] = "https://nodeapi.classlink.com/v2/my/info";

    $CLASSLINK_CLIENT_ID = array(
        'learningaz' => 'c1496957478973fecb971cb868c37f4f740af47874802f',
        'learningazpost' => 'c1496957273630742a15d74dda56709b30b2d488e2b019',
        'learningazpre' => 'c14969572310491d8580e05d85bb77751b10cc3f342f84',
        'learningazdev' => 'c1496932615605213e93cb6ac33ccabbc13ed461b02857',
        'learningazlocal' => 'c14654885874583449153dde7b5b0841904cd61a23ea54'
    );

    $_ENV['CLASSLINK_CLIENT_ID'] = $CLASSLINK_CLIENT_ID;

    $CLASSLINK_APP_SECRET = array(
        'learningaz' => 'd84bfd2ddd7bb9ebe20b5cd5bc304961',
        'learningazpost' => '3e701b0eef3aac56f7f483733da3ec10',
        'learningazpre' => '0a1866a0d183d886904eeda0e052e4d2',
        'learningazdev' => '532c92c9b514e908f2e3a8e9a000e9e5',
        'learningazlocal' => '4594ed0c101aeacfe002a0118d1b5e98'
    );

    $_ENV['CLASSLINK_APP_SECRET'] = $CLASSLINK_APP_SECRET;

    $CLASSLINK_APP_STATE = array(
        'learningaz' => '44Fes32832a4b',
        'learningazpost' => '4594rAj3298a',
        'learningazpre' => '4594rAj3298b',
        'learningazdev' => '4594rAj3298c',
        'learningazlocal' => '4594rAj3298d'
    );
    $_ENV['CLASSLINK_APP_STATE'] = $CLASSLINK_APP_STATE;


    $CLEVER_APP_CLIENT_ID = array(
        'learningaz' => '237fed7b396708bba831',
        'learningazpilot' => 'e2aa101cc3e76b6308fc',
        'learningazdev' => '713bfd06da0efe8a05ce',
        'learningaz-login' => 'a4954653f1d0d13424af'
    );
    $_ENV['CLEVER_APP_CLIENT_ID'] = $CLEVER_APP_CLIENT_ID;

    $CLEVER_APP_SECRET = array(
        'learningaz' => 'd43ae9d442d308708cfbb4635c4d13f42a1b92ae',
        'learningazpilot' => '11ece6309ac6bdc025a671ee24188d0a13d41550',
        'learningazdev' => '1471351b1f561a7f627fb58dabbbb0f1259cdd12',
        'learningaz-login' => 'b1014eb53beb507e0db9bbdcb0d00a18c88109b2'
    );

    $_ENV['CLEVER_APP_SECRET'] = $CLEVER_APP_SECRET;

# must match a redirect url in https://apps.clever.com/partner/applications/55b03415cef2d3010000022c
    $CLEVER_APP_SSO_REDIRECT_URL = array(
        'learningaz' => 'https://kidsa-z.com/main/LoginExternal/?app=learningaz',
        'learningazpilot' => 'https://pre.kidsa-z.com/main/LoginExternal/?app=learningazpilot',
        'learningazdev' => 'https://dev.kidsa-z.com/main/LoginExternal/?app=learningazdev',
        'learningaz-login' => 'https://dev.kidsa-z.com/main/LoginExternal/?app=learningaz-login'
    );
    $_ENV['CLEVER_APP_SSO_REDIRECT_URL'] = $CLEVER_APP_SSO_REDIRECT_URL;

    $MOBILE_AUTHTOKEN_ENC_KEY = array(
        'prod' => 's3aC4B&W2L!GoT@nbMud',
        'postprod' => 's3aC4B&W2L!GoT@nbMud',
        'preprod' => 's3aC4B&W2L!GoT@nbMud',
        'mfg' => 's3aC4B&W2L!GoT@nbMud',
        'dev' => 's3aC4B&W2L!GoT@nbMud',
        'local' => 's3aC4B&W2L!GoT@nbMud',
        '' => 's3aC4B&W2L!GoT@nbMud'
    );

    $_ENV['MOBILE_AUTHTOKEN_ENC_KEY'] = $MOBILE_AUTHTOKEN_ENC_KEY[$_ENV['LP_INSTANCE']];

    $MOBILE_AUTHTOKEN_DIGEST_KEY = array(
        'prod' => '4A@V4#W!@iPB6j!3DT2U',
        'postprod' => '4A@V4#W!@iPB6j!3DT2U',
        'preprod' => '4A@V4#W!@iPB6j!3DT2U',
        'mfg' => '4A@V4#W!@iPB6j!3DT2U',
        'dev' => '4A@V4#W!@iPB6j!3DT2U',
        'local' => '4A@V4#W!@iPB6j!3DT2U',
        '' => '4A@V4#W!@iPB6j!3DT2U'
    );

    $_ENV['MOBILE_AUTHTOKEN_DIGEST_KEY'] = $MOBILE_AUTHTOKEN_DIGEST_KEY[$_ENV['LP_INSTANCE']];


    $JWT_SECRET = array(
        'globed' => 'globeddogaraz',
        'ig3' => 'ig3laz',
        'ctn' => 'ctnlearninga-z',
        'isr' => 'eduISRlearninga-z',
        'laztest' => 'LazTestDistrict'
    );

    $_ENV['JWT_SECRET'] = $JWT_SECRET;


    $LAZ_ACT_ON_EMAIL_MASTER_LIST_ID = array(
        'prod' => 'l-0089',
        'postprod' => 'l-0001',
        'preprod' => 'l-0001',
        'mfg' => 'l-0001',
        'dev' => 'l-0001',
        'local' => 'l-0001',
    );

    $_ENV['LAZ_ACT_ON_EMAIL_MASTER_LIST_ID'] = $LAZ_ACT_ON_EMAIL_MASTER_LIST_ID[$_ENV['LP_INSTANCE']];

    $SYNCWORDS_PUBLIC_KEY = array(
        'prod' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        'postprod' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        'preprod' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        'mfg' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        'dev' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        'local' => '30519c9b5a5791ae96e6174d524e0679bb427f8e',
        '' => '30519c9b5a5791ae96e6174d524e0679bb427f8e'
    );

    $_ENV['SYNCWORDS_PUBLIC_KEY'] = $SYNCWORDS_PUBLIC_KEY[$_ENV['LP_INSTANCE']];

    $SYNCWORDS_PRIVATE_KEY = array(
        'prod' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        'postprod' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        'preprod' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        'mfg' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        'dev' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        'local' => '635e893be81b346dccb99cb93b1ba5e02944a6c5',
        '' => '635e893be81b346dccb99cb93b1ba5e02944a6c5'
    );

    $_ENV['SYNCWORDS_PRIVATE_KEY'] = $SYNCWORDS_PRIVATE_KEY[$_ENV['LP_INSTANCE']];

    $SYNCWORDS_API_URL = array(
        'prod' => 'https://api.syncwords.com',
        'postprod' => 'https://api.syncwords.com',
        'preprod' => 'https://api.syncwords.com',
        'mfg' => 'https://api.syncwords.com',
        'dev' => 'https://api.syncwords.com',
        'local' => 'https://api.syncwords.com',
        '' => 'https://api.syncwords.com'
    );

    $_ENV['SYNCWORDS_API_URL'] = $SYNCWORDS_API_URL[$_ENV['LP_INSTANCE']];


    $SYNCWORDS_PROFILE_ID = array(
        'prod' => '240',
        'postprod' => '240',
        'preprod' => '240',
        'mfg' => '240',
        'dev' => '240',
        'local' => '240',
        '' => '240'
    );

    $_ENV['SYNCWORDS_PROFILE_ID'] = $SYNCWORDS_PROFILE_ID[$_ENV['LP_INSTANCE']];

// Are all the mysql instances separate, or is there some sharing going on between instances?
    $ARE_MYSQL_INSTANCES_SEPARATE = array(
        'prod' => true,
        'mfg' => false,
        'postprod' => true,
        'preprod' => true,
        'infra' => false,
        'dev' => true,
        'local' => false
    );
    $_ENV['ARE_MYSQL_INSTANCES_SEPARATE'] = $ARE_MYSQL_INSTANCES_SEPARATE[$_ENV['LP_INSTANCE']];

    $_ENV['INVOICE_DOWNLOAD_LINK'] = $_ENV['CSI_HTTP_SERVER'] . "/index.php?module=ViewBills&action=downloadInvoice&invoiceNumber=";

    $_ENV['INVOICE_BASE_DIRECTORY'][$_ENV['LAZ_DIVISION_ID']] = '/mnt/shared_storage/invoices/laz';
    $_ENV['INVOICE_BASE_DIRECTORY'][$_ENV['KI_DIVISION_ID']] = '/mnt/shared_storage/invoices/kes';
    $_ENV['INVOICE_BASE_DIRECTORY'][$_ENV['EL_DIVISION_ID']] = '/mnt/shared_storage/invoices/el';

    $RECORDING_STAGED_PATH = array(
        'prod' => '/k12/products/admin/nodejs/webapps/recorder/recordings/',
        'postprod' => '/k12/products/admin/nodejs/webapps/recorder/recordings/',
        'preprod' => '/k12/products/admin/nodejs/webapps/recorder/recordings/',
        'mfg' => '/k12/products/admin/nodejs/webapps/recorder/recordings/',
        'dev' => '/k12/products/admin/nodejs/webapps/recorder/recordings/',
        'local' => '/dev/tools/node-4.4.2/webapps/recorder/recordings/',
        '' => '/dev/tools/node-4.4.2/webapps/recorder/recordings/'
    );
    $_ENV['RECORDING_STAGED_PATH'] = $RECORDING_STAGED_PATH[$_ENV['LP_INSTANCE']];

    if ($_ENV['LP_INSTANCE'] == 'local') {
        $_ENV['BUILDTAG'] = "";
    }

    $reseller_change_email_list = array(
        'prod' => 'accountingnotifications@cambiumlearning.com',
        'postprod' => 'AAEngReports@learninga-z.com',
        'preprod' => 'AAEngReports@learninga-z.com',
        'mfg' => 'AAEngReports@learninga-z.com',
        'dev' => 'AAEngReports@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );

    $_ENV['laz_reseller_change_email_list'] = $reseller_change_email_list[$_ENV['LP_INSTANCE']];

    $_ENV['ORDER_ENTRY_APPROVAL_EMAIL'] = "orders@learninga-z.com";

    $_ENV['EBOOK_TOOLBAR_DEFAULT_TO_OPEN'] = true;

// -----------------
// Real Time Event Log Feature
// -----------------
    $EVENT_LOG_INCENTIVE_THROTTLE_IN_SECONDS = array(
        'prod' => 20,
        'postprod' => 20,
        'preprod' => 20,
        'dev' => 20,
        'local' => 20,
        '' => 20,
    );
//Time delay between student entering incentive events
    $_ENV['EVENT_LOG_INCENTIVE_THROTTLE_IN_SECONDS'] = $EVENT_LOG_INCENTIVE_THROTTLE_IN_SECONDS[$_ENV['LP_INSTANCE']];

    $EVENT_LISTENER_EXPIRE_TIMEOUT_IN_SECONDS = array(
        'prod' => 20 * 60,
        'postprod' => 20 * 60,
        'preprod' => 20 * 60,
        'dev' => 20 * 60,
        'local' => 20 * 60,
        '' => 20 * 60,
    );
//Amount of time we record student events starting when the teacher loads the page, updates as teacher stays on page
    $_ENV['EVENT_LISTENER_EXPIRE_TIMEOUT_IN_SECONDS'] = $EVENT_LISTENER_EXPIRE_TIMEOUT_IN_SECONDS[$_ENV['LP_INSTANCE']];

    $EVENT_LISTENER_AJAX_REQUEST_RATE_IN_SECONDS = array(
        'prod' => 5,
        'postprod' => 5,
        'preprod' => 5,
        'dev' => 5,
        'local' => 5,
        '' => 5,
    );
//Amount of time between ajax requests pulling events from database
    $_ENV['EVENT_LISTENER_AJAX_REQUEST_RATE_IN_SECONDS'] = $EVENT_LISTENER_AJAX_REQUEST_RATE_IN_SECONDS[$_ENV['LP_INSTANCE']];

// Replacing MAX_ALLOWED_RESOURCES_PER_CUSTOM_ASSIGNMENT and MAX_ALLOWED_TARGETED_ASSIGNMENT_RESOURCES_PER_STUDENT_ACCOUNT
// with one variable.
    $_ENV['MAX_ALLOWED_ASSIGNMENT_RESOURCES'] = 100;

// Expire the inbasket count in the session after this number of seconds.
// I expect this number will change from time to time.  It should never be a per-instance value.
    $_ENV['SESSION_CACHE_INBASKET_COUNT_EXPIRATION_SECONDS'] = 60;

// Don't suspend overdue bills that owe less than this amount
    $_ENV['DUNNING_FORGIVENESS_THRESHOLD'] = 5;


// -----------------
// Mobile Real Time Event Log Feature
// -----------------

    $_ENV['CLASS_ACTIVITY_REFRESH_PERIOD_IN_SECONDS'] = 10;
    $_ENV['TIME_UNTIL_SHOWN_OFFLINE_IN_SECONDS'] = 60 * 60;

    $nonProductionExternalEmailRedirectAddress = array(
        'postprod' => 'aaengredirect@learninga-z.com',
        'preprod' => 'aaengredirect@learninga-z.com',
        'dev' => 'aaengredirect@learninga-z.com',
        'local' => $_ENV['ERR_EMAIL'],
        '' => $_ENV['ERR_EMAIL']
    );
    $_ENV['EXTERNAL_EMAIL_REDIRECT_ADDRESS'] = $nonProductionExternalEmailRedirectAddress[$_ENV['LP_INSTANCE']];
}

// Load all the above constants into $_ENV without creating hundreds of global variables.
setMagicConstants();
require_once __DIR__ . '/bootstrap.php';

?>
