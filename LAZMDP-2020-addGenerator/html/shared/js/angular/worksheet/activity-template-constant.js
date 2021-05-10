(function(){
    "use strict";

    angular
        .module('shared.worksheet')
        .constant('ActivityTemplateConstants', {
             MULTIPLE_CHOICE_ID                    : 1,
             CONSTRUCTED_PROSE_RESPONSE_ID         : 2,
             DRAG_AND_DROP_MAIN_IDEA_ID            : 4,
             CAUSE_AND_EFFECT_DIAGRAM_ID           : 5,
             MULTI_DRAG_MULTI_DROP_CHART_OPTION_ID : 6,
             EVENT_SEQUENCING_ID                   : 12,
             FILL_IN_THE_BLANKS_ID                 : 14,
             HIGHLIGHT_CATEGORY_ID                 : 15,
             TIMELINE_ID                           : 16,
             MULTI_COLUMN_DRAG_AND_REPLACE_ID      : 17,
             READ_ONLY_ID                          : 18,
             IMAGE_LABELING_ID                     : 19
        });
})();
