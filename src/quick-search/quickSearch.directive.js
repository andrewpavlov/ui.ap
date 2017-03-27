/**
 * @ngdoc directive
 * @name ui.ap.directives:quickSearch
 * @param {Object=}         ng-model            Angular ngModel
 * @param {Function=}       quick-search        Callback function
 * @restrict EA
 * @description
 * quickSearch directive
 * It modifies ng model with timeout and/or calls callback when modified
 * @example
 * <pre>
 *     <input type=text quick-search ng-model="vm.filterText" ng-change="vm.onChange(value)"/>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.quick-search', [])
        .directive('quickSearch', quickSearch);

    quickSearch.$inject = ['$timeout'];

    function quickSearch($timeout) {
        var directive = {
            templateUrl: 'view/quickSearch.directive.html',
            restrict: 'EA',
            link: link,
            require: ['?ngModel'],
            scope: {
                // ngPattern: '=',
                // ngDisabled: '=',
                // ngReadonly: '=',
                quickSearch: '&',
                ngModel: '='
            }
        };

        return directive;

        /**
         * Link function
         */
        function link(scope, element, attrs, ctrl) {
            var filterTextTimeout,
                ngModel = ctrl[0];
            scope.tempFilterText = '';
            scope.filterText = '';

            activate();

            function activate() {
                var tempFilterText = '',
                    filterTextTimeout;

                scope.$watch('quickSearchText', function (val) {
                    if (filterTextTimeout) {
                        $timeout.cancel(filterTextTimeout);
                    }

                    tempFilterText = val;
                    if (angular.isDefined(tempFilterText)) {
                        filterTextTimeout = $timeout(function () {
                            if (scope.filterText !== tempFilterText) {
                                scope.filterText = tempFilterText;
                                if (angular.isDefined(scope.ngModel)) {
                                    scope.ngModel = scope.filterText;
                                }
                                scope.quickSearch({
                                    value: scope.filterText
                                });
                            }
                        }, 250); // delay 250 ms
                    }
                });
            }
        }
    }
})(window.angular);