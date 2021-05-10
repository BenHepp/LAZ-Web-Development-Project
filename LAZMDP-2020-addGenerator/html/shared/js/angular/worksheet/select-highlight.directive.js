(function () {
    'use strict';

    angular.module('shared.worksheet')
        .directive('selectHighlight', ['$sce', '$document', '$window', function ($sce, $document, $window) {
            var highlightState = false;
            var firstHighlightId = '';
            var lastHighlightId = '';
            var clickBeforeDragId = '';
            var startPosition = 0;
            var endPosition = 0;
            var index = 0;

            function controller($element) {
                var ctrl = this;

                function onMousedown(event) {
                    var thisId = angular.element(event.target.id);
                    var thisElement = angular.element('#'+thisId.selector);

                    if (thisElement.hasClass('view-highlight')) {
                        highlightState = true;
                        var thisId = '#' + thisId.selector;
                        clickBeforeDragId = thisId;
                        var startElementId = thisId.split(/[-]+/);
                        startPosition = parseInt(startElementId[startElementId.length - 1]);
                        ctrl.index = 0;
                        if (ctrl.isPassage) {
                            ctrl.createPreHighlight(startPosition, parseInt(startPosition), ctrl.index);
                        } else {
                            ctrl.index = startElementId[2];
                            ctrl.createPreHighlight(startPosition, parseInt(startPosition), ctrl.index);
                        }
                        lastHighlightId = thisId;

                        angular.element(thisElement.selector).on('mouseenter', function (event) {
                            lastHighlightId = '#' + thisElement.attr('id');
                            angular.element('.pre-highlight').each(function () {
                                if (lastHighlightId != ('#' + thisElement.attr('id'))) {
                                    thisElement.removeClass('pre-highlight');
                                }
                            });
                        });

                        return false;
                    }
                }

                function onTouchstart(event) {
                    var thisId = angular.element(event.target.id);
                    var thisElement = angular.element('#'+thisId.selector);
                    if (thisElement.hasClass('dummy-highlight') && !ctrl.readOnly) {
                        var touch = event.originalEvent.touches[0];
                        var elementOver = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (elementOver.tagName.toLowerCase() == "span" && isFragmentSelectable(angular.element(firstHighlightId))) {
                            firstHighlightId = '#' + elementOver.id;
                            startPosition = elementOver.id.split(/[-]+/)[3];
                            angular.element(firstHighlightId).addClass('view-highlight');
                        }
                    }
                }

                function isMultiFingerTouch(event) {
                    if (event.originalEvent.touches) {
                        return event.originalEvent.touches.length > 1;
                    }
                }

                function isFragmentSelectable(element) {
                    // TODO (Alex B) - should we prevent correct answers from being selectable as well?
                    // TODO (MK) - should prevent the button from being selectable also if there is nothing for student to do like superscript case
                    return !(ctrl.isAttemptTwo || element.hasClass('display-'+ctrl.item+'-is-prepopulated'));
                }

                ctrl.$postLink = function () {
                    $document.on('mousedown', onMousedown);
                    $document.on('touchstart', onTouchstart);

                    $element.on('mouseenter', function (event) {
                        if (isMultiFingerTouch(event) || ctrl.readOnly) {
                            return false;
                        }

                        if (highlightState && lastHighlightId.length >= 1 && isFragmentSelectable(angular.element('#'+event.target.id))) {
                            var thisId = angular.element(event.target.id);
                            var thisElement = angular.element('#'+thisId.selector);
                            thisElement.addClass('pre-highlight');
                            lastHighlightId = '#' + thisId.selector;
                            var endElementId = lastHighlightId.split(/[-]+/);
                            endPosition = parseInt(endElementId[endElementId.length - 1]);

                            ctrl.index = 0;
                            if (!ctrl.isPassage) {
                                ctrl.index = endElementId[2];
                            }

                            if (startPosition > endPosition) {
                                ctrl.createPreHighlight(endPosition, startPosition, ctrl.index);
                                ctrl.removePreHighlight(endPosition, 'up');
                            } else {
                                ctrl.createPreHighlight(startPosition, endPosition, ctrl.index);
                                ctrl.removePreHighlight(endPosition, 'down');
                            }
                        } else {
                            if (angular.element(event.target).hasClass('dummy-highlight')) {
                                if (!angular.element(event.target).hasClass('pre-highlight') && isFragmentSelectable(angular.element(event.target))) {
                                    firstHighlightId = angular.element(event.target);
                                    angular.element(event.target).addClass('view-highlight');
                                } else {
                                    angular.element(event.target).removeClass('view-highlight');
                                }

                                return true;
                            }
                        }
                    });

                    $element.on('mouseleave', function (event) {
                        var thisElement = null;
                        if (!highlightState) {
                            event.stopPropagation();
                            thisElement = angular.element(event.target);
                            if (thisElement == lastHighlightId || clickBeforeDragId != thisElement) {
                                thisElement.removeClass('view-highlight');
                            }

                            highlightState = false;
                            return false;
                        }
                    });

                    $element.on('mouseup', function (event) {
                        var thisId = angular.element(event.target.id);
                        var thisElement = angular.element('#'+thisId.selector);
                        if (thisElement.hasClass('pre-highlight') && !ctrl.readOnly) {
                            firstHighlightId = '';
                            highlightState = false;
                            ctrl.highlightSelectionById(ctrl.item, ctrl.displayIndex, false);
                            return false;
                        }
                    });

                    $element.on('touchend', function (event) {
                        var thisId = angular.element(event.target.id);
                        var thisElement = angular.element('#'+thisId.selector);
                        if (thisElement.hasClass('dummy-highlight') && !ctrl.readOnly) {
                            ctrl.highlightSelectionById(ctrl.item,ctrl.displayIndex, false);
                        }
                    });

                    $element.on('touchmove', function (event) {
                        var thisId = angular.element(event.target.id);
                        var thisElement = angular.element('#'+thisId.selector);
                        if (thisElement.hasClass('dummy-highlight') && !ctrl.readOnly) {
                            var touch = event.originalEvent.touches[0];
                            var elementOver = document.elementFromPoint(touch.clientX, touch.clientY);
                            if (elementOver.tagName.toLowerCase() == "span") {
                                lastHighlightId = '#' + elementOver.id;
                                endPosition = elementOver.id.split(/[-]+/)[3];
                                ctrl.index = 0;
                                if (!ctrl.isPassage) {
                                    ctrl.index = elementOver.id.split(/[-]+/)[2];
                                }

                                if (startPosition > endPosition) {
                                    ctrl.createPreHighlight(endPosition, startPosition, ctrl.index);
                                    ctrl.removePreHighlight(endPosition, 'up');
                                } else {
                                    ctrl.createPreHighlight(startPosition, endPosition, ctrl.index);
                                    ctrl.removePreHighlight(endPosition, 'down');
                                }
                            }
                        }
                    });
                };
                ctrl.$onDestroy = function () {
                    $document.off('mousedown', onMousedown);
                    $document.off('touchstart', onTouchstart);
                };

                ctrl.highlightSelectionById = function(displayType, chosenSuperScriptIndex, isEnabled) {
                    var selectedParseType = ctrl.division;
                    var display = "display-" + displayType;
                    var $array = [];
                    var isCircle = display.indexOf("circle") >= 0;
                    var isSuperScript = display.indexOf("superscript") >= 0;
                    var sentenceIndex = 0;

                    var elementId = '#highlight-sentence-';
                    if (!ctrl.isPassage) {
                        elementId = '#highlight-word-';
                    } else if (selectedParseType == 'word') {
                        elementId = '#highlight-word-0-';
                    }

                    var elementArray = angular.element('.pre-highlight');
                    angular.forEach(elementArray, function( el ){
                        var thisId = angular.element(el.id);
                        $array.push('#'+thisId.selector);
                        if (angular.element('#'+thisId.selector).hasClass(display)) {
                            angular.element('#'+thisId.selector).removeClass(display);
                            ctrl.removeCurrentElement(angular.element('#'+thisId.selector), displayType);
                            ctrl.removeNextElements(angular.element('#'+thisId.selector), displayType);
                            ctrl.removePreviousElements(angular.element('#'+thisId.selector),displayType);
                        } else if (angular.element('#'+thisId.selector).hasClass('pre-highlight')) {
                            angular.element('#'+thisId.selector).addClass(display);
                        }
                        angular.element('#'+thisId.selector).removeClass('pre-highlight');
                    });

                    var startItem = 0;
                    var previousItem = 0;
                    var currentItem = 0;
                    var nextItem = 0;
                    var indexSuperScript = chosenSuperScriptIndex;
                    angular.forEach($array, function (val, i) {
                        var pieces = val.split(/[-]+/);
                        sentenceIndex = pieces[2];
                        currentItem = pieces[pieces.length - 1];
                        if (previousItem == 0) {
                            startItem = currentItem;
                        }
                        if (i < $array.length - 1) {
                            pieces = $array[i + 1].split(/[-]+/);
                            nextItem = pieces[pieces.length - 1];
                            if ((nextItem - 1) == currentItem) {
                                previousItem = nextItem;
                            } else if (previousItem >= 0) { //done: addElements
                                previousItem = currentItem;
                            }
                        }
                        $(val).removeClass('pre-highlight');
                        $(val).removeClass('view-highlight');
                    });
                    if (parseInt(previousItem) < parseInt(startItem)) {
                        previousItem = startItem;
                    }

                    if (previousItem >= 0 && $array.length > 0) {
                        ctrl.updateCircleDisplayTypes(isCircle, ctrl.getElementIdToUpdate(elementId, sentenceIndex), startItem, previousItem);
                        ctrl.updateSuperScript(isSuperScript, indexSuperScript, ctrl.getElementIdToUpdate(elementId, sentenceIndex), startItem);
                        angular.forEach($array, function (i, val) {
                            angular.element(val).removeClass('pre-highlight');
                        });

                    }
                };

                ctrl.getElementIdToUpdate = function(elementId, sentenceIndex) {
                    if (!ctrl.isPassage) {
                        return elementId + sentenceIndex + '-';
                    }
                    return elementId;
                };

                ctrl.removeExistingSuperscriptAndAddMarkUp = function(currentElement, index, displayName, displayMarkUp) {
                    var thisElement = angular.element(currentElement);
                    var currentElementIndex = thisElement.selector.split(/[-]+/)[2];
                    if (ctrl.division == 'word' || !ctrl.isPassage) {
                        currentElementIndex = thisElement.selector.split(/[-]+/)[3];
                    }

                    var elementSupArray = angular.element('sup');
                    angular.forEach(elementSupArray, function( supEl ){
                        if (ctrl.displayIndex == angular.element(supEl).context.innerHTML && !angular.element(supEl).hasClass('ng-binding')) {
                            var elementToRemove = angular.element(supEl).closest('span');
                            var removeId = angular.element(elementToRemove[0].id);
                            var element = angular.element('#'+removeId.selector);
                            element.removeClass('pre-highlight');
                            element.removeClass(displayMarkUp);
                            element.removeClass('style');
                            ctrl.removeIncorrectClass(element);
                            ctrl.removeCurrentElement(element, displayName);
                            ctrl.removeNextElements(element, displayName);
                            ctrl.removePreviousElements(element, displayName);
                            supEl.remove();
                        }
                    });

                    if (thisElement.hasClass('display-superscript')) {
                        thisElement.prepend('<sup>' + index + '</sup>');
                    }
                };

                ctrl.removeCurrentElement = function(element, display, currentIndex) {
                    element.removeClass('display-' + display);
                    element.removeClass('left-' + display);
                    element.removeClass('right-' + display);
                    element.removeClass('pre-highlight');
                    var sentenceElementIndex = element.selector.split(/[-]+/)[2];
                    if (ctrl.division == 'word' || !ctrl.isPassage) {
                        sentenceElementIndex = element.selector.split(/[-]+/)[3];
                    }
                    if (display == 'superscript' && sentenceElementIndex == currentIndex) {
                        ctrl.addSuperScript = false;
                    }
                };

                ctrl.removeNextElements = function(element, display) {
                    var pieces = element.selector.split(/[-]+/);
                    var sentenceElementIndex = pieces[2];
                    if (ctrl.division == 'word' || !ctrl.isPassage) {
                        sentenceElementIndex = pieces[3];
                    }
                    for (var i=parseInt(sentenceElementIndex); i<=parseInt(sentenceElementIndex)+300;i++){
                        var elementIndex = i+1;
                        var newElement = element.selector.substring(0, element.selector.lastIndexOf('-')) + '-' + elementIndex;
                        if (angular.element(newElement).hasClass('display-' + display)) {
                            angular.element(newElement).removeClass('display-' + display);
                            angular.element(newElement).removeClass('left-' + display);
                            angular.element(newElement).removeClass('right-' + display);
                            angular.element(newElement).removeClass('pre-highlight');
                            ctrl.removeIncorrectClass(angular.element(newElement));
                        } else {
                            break;
                        }
                    }
                };

               ctrl.removePreviousElements = function(element, display) {
                    var pieces = element.selector.split(/[-]+/);
                    var sentenceElementIndex = pieces[2];
                    if (ctrl.division == 'word' || !ctrl.isPassage) {
                        sentenceElementIndex = pieces[3];
                    }
                    for (var i=parseInt(sentenceElementIndex); i>=0; i--){
                        var elementIndex = i-1;
                        var newElement = element.selector.substring(0, element.selector.lastIndexOf('-')) + '-' + elementIndex;
                        if (angular.element(newElement).hasClass('display-' + display)) {
                            angular.element(newElement).removeClass('display-' + display);
                            angular.element(newElement).removeClass('left-' + display);
                            angular.element(newElement).removeClass('right-' + display);
                            angular.element(newElement).removeClass('pre-highlight');
                            ctrl.removeIncorrectClass(angular.element(newElement));
                        } else {
                            break;
                        }
                    }
                };

                ctrl.highlightThisElement = function(element, display) {
                    var foundElement = true;
                    $.each(element, function (i, val) {
                        if (foundElement && $(val).hasClass('display-' + display)) {
                            $(val).addClass('pre-highlight');
                        } else {
                            foundElement = false;
                        }
                    });
                };

                ctrl.highlightNextElements = function(element, display) {
                    var foundNextElement = true;
                    $.each(element.nextAll(), function (i, val) {
                        if (foundNextElement && $(val).hasClass('display-' + display)) {
                            $(val).addClass('pre-highlight');
                        } else {
                            foundNextElement = false;
                        }
                    });
                };

                ctrl.highlightPreviousElements = function(element, display) {
                    var foundPreviousElement = true;
                    $.each(element.prevAll(), function (i, val) {
                        if (foundPreviousElement && $(val).hasClass('display-' + display)) {
                            $(val).addClass('pre-highlight');
                        } else {
                            foundPreviousElement = false;
                        }
                    });
                };

                ctrl.updateCircleDisplayTypes = function(isCircle, elementId, startItem, endItem) {
                    if (isCircle) {
                        var startElement = angular.element(elementId + startItem);
                        var endElement = angular.element(elementId + endItem);
                        if (angular.element(startElement).hasClass('display-circle')) {
                            angular.element(startElement).addClass('left-circle');
                            angular.element(endElement).addClass('right-circle');
                        }
                    }
                };

                ctrl.updateSuperScript = function(isSuperScript, index, elementId, startItem) {
                    if (isSuperScript) {
                        var sentenceElement = elementId + startItem;
                        ctrl.removeExistingSuperscriptAndAddMarkUp(sentenceElement, index, 'superscript', 'display-superscript');
                    }
                };

                ctrl.createPreHighlight = function(start, end, index) {
                    var startingPosition = start;
                    var endingPosition = end;
                    var selectedParseType = ((ctrl.division == 'word') ? 'word' : 'sentence');

                    for (var i = startingPosition; i <= endingPosition; i++) {
                        if (selectedParseType == 'sentence') {
                            angular.element('#highlight-' + selectedParseType + '-' + i).addClass('pre-highlight');
                            angular.element('#highlight-' + selectedParseType + '-' + i).removeClass('view-highlight');
                            ctrl.removeCorrectClass(angular.element('#highlight-' + selectedParseType + '-' + i));
                            ctrl.removeIncorrectClass(angular.element('#highlight-' + selectedParseType + '-' + i));
                        } else {
                            angular.element('#highlight-' + selectedParseType + '-' + index + '-' + i).addClass('pre-highlight');
                            angular.element('#highlight-' + selectedParseType + '-' + index + '-' + i).removeClass('view-highlight');
                            ctrl.removeCorrectClass(angular.element('#highlight-' + selectedParseType + '-' + index + '-' + i));
                            ctrl.removeIncorrectClass(angular.element('#highlight-' + selectedParseType + '-' + index + '-' + i));
                        }
                    }
                };

                ctrl.removePreHighlight = function(start, location) {
                    var elementArray = angular.element('.pre-highlight');
                    angular.forEach(elementArray, function( el ){
                        var pieces = el.id.split(/[-]+/);
                        var currentItem = pieces[pieces.length - 1];
                        if (location == 'up' && currentItem < start) {
                            angular.element('#' + el.id).removeClass('pre-highlight');
                        } else if (location == 'down' && currentItem > start) {
                            angular.element('#' + el.id).removeClass('pre-highlight');
                        }
                    });
                };

                ctrl.removeCorrectClass = function(elt) {
                    elt.removeClass('display-'+ctrl.item+'-correct');
                };

                ctrl.removeIncorrectClass = function(elt) {
                    elt.removeClass('display-'+ctrl.item+'-incorrect');
                    elt.removeClass('display-'+ctrl.item+'-incorrect-icon');
                }
            }

            return {
                restrict: 'A',
                controller: ['$element', controller],
                bindToController: {
                    item: '=',
                    displayIndex: '<',
                    isPassage: '<',
                    division: '<',
                    readOnly: '<',
                    isAttemptTwo: '<'
                }
            };
        }]);
})();
