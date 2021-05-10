document.observe('dom:loaded', function() {
    var scrollToTopButton = $('js-scrollToTop');
    if (scrollToTopButton) {
        scrollToTopButton.onclick = function() {
            return false;
        };
        scrollToTopButton.on('click', function() {
            clg.commonUtils.scrollTo('js-top');
        });
        Event.observe(window, 'scroll', scrollToTopHandler);
    }
});

function scrollToTopHandler() {
    var topButton = $('js-scrollToTop');
    var footerArea = $('footerInternal') || $j('.footer')[0];
    var pageHeight = $(document.body).getHeight();
    var scrollOffsetTop = document.viewport.getScrollOffsets().top;
    var viewportHeight = document.viewport.getHeight();
    var footerTop = footerArea.measure('top');

    var buttonStopPosition = (pageHeight - footerTop) + topButton.getHeight();
    var pixelsFromBottom = (pageHeight - (scrollOffsetTop + viewportHeight));

    //decide whether to show or hide the button
    var atBottomMostPosition = pixelsFromBottom <= buttonStopPosition;

    if ((scrollOffsetTop) >= 1000 || atBottomMostPosition) {
        if (!topButton.visible()) {
            Effect.Appear(topButton, {duration: 0.2});
        }
    }else {
        if (topButton.visible()) {
            Effect.Fade(topButton, {duration: 0.2});
        }
    }

    if (atBottomMostPosition) {
        topButton.setStyle({position: 'absolute', bottom: buttonStopPosition + 'px'});
    }else {
        topButton.setStyle({position: 'fixed', bottom: null});
    }
}

function universalSwitchTab(prefix, id, sessionKey, tabGroupClass, contentClass) {
    var blockId = prefix + "" + id;
    var blockObj = $(blockId);
    if (blockObj != null) {
        $$('div.' + contentClass).invoke('hide');
        $$('div.' + tabGroupClass +' ul li a').invoke('removeClassName', 'active');
        $(blockId + '-link').addClassName('active');
        setDefaultTab(id, sessionKey);
        blockObj.show();
    }
    return false;
}


function setDefaultTab(blockId, sessionKey) {
    id = blockId.toLowerCase();
    new Ajax.Request("/set-tab-option.php?value=" + id + "&key=" + sessionKey, {
        method : "get"
    });
}
    

