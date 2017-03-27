/**
 * @ngdoc directive
 * @name ui.ap.directives:apDisabled
 * @param {expression} apDisabled The expression to check
 * @restrict A

 * @description
 * If the expression is falsy then the element will be disabled,
 * 'ap-disabled' css class will be added.
 * If it is truthy then the element will enabled,
 * 'ap-disabled' css class will be removed.
 *
 * @example
 <pre>
 <a ap-disabled="vm.disabled" ui-sref="home">Goto Homepage</a>
 </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.disable-state', [])
        .directive('apDisabled', apDisabled);

    apDisabled.$inject = ['$parse', '$rootScope'];

    function apDisabled($parse, $rootScope) {
        var directive = {
            bindToController: true,
            link: link,
            restrict: 'A'
        };

        return directive;

        function link(scope, element, attr) {
            var fnRes = false;

            scope.$watch($parse(attr.apDisabled), function (val) {
                fnRes = val;
                if (fnRes) {
                    element.addClass('ap-disabled');
                } else {
                    element.removeClass('ap-disabled');
                }
            });

            element.on('click', function (event) {
                if ($rootScope.$$phase) {
                    scope.$evalAsync(function () {
                        callback(event);
                    });
                } else {
                    scope.$apply(function () {
                        callback(event);
                    });
                }
            });

            function callback(event) {
                if (fnRes) {
                    // prevents ng-click to be executed
                    event.stopImmediatePropagation();
                    // prevents href
                    event.preventDefault();
                }
            }
        }
    }
})(window.angular);
