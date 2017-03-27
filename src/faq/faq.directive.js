/**
 * @ngdoc directive
 * @name ui.ap.directives:faq
 * @param {String=} header  FAQ header
 * @param {String}  source  Text or Url to text
 * @description
 * FAQ directive
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.faq', [])
        .directive('faq', faq);

    faq.$inject = [
        '$http'
    ];

    function faq($http) {
        return {
            templateUrl: 'view/faq.directive.html',
            link: link,
            restrict: 'EA',
            scope: {
                header: '@',
                source: '@',
                opened: '@'
            }
        };

        function link(scope, element, attrs, vm) {
            scope.items = [];

            activate();

            ////////////////

            /**
             * @ngdoc method
             * @name ui.ap.directives:faq#activate
             * @methodOf ui.ap.directives:faq
             * @description
             * Activates directive
             */
            function activate() {
                if (scope.source.match(/^(https?:)?\/{2}/i)) {
                    load(scope.source)
                        .then(function (data) {
                            scope.source = data;
                            scope.items = _faqParse(scope.source);
                        });
                } else {
                    scope.items = _faqParse(scope.source);
                }
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:faq#load
             * @methodOf ui.ap.directives:faq
             * @param {String} url Url to FAQ content
             * @returns {Object} promise
             * @description
             * Loads FAQ from server
             */
            function load(url) {
                return $http
                    .get(url)
                    .then(function (res) {
                        return res.data;
                    });
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:faq#load
             * @methodOf ui.ap.directives:faq
             * @param {String} what Text
             * @returns {Object} promise
             * @description
             * Split text to list of pairs: Question / Answer
             */
            function _faqParse(what) {
                var ret = [];
                angular.forEach(what.split(/\n\r?\n\r?/), function (qa) {
                    qa = qa.split(/\n\r?/);
                    ret.push({
                        q: qa.shift(),
                        a: qa.join('<br/>'),
                        opened: false
                    });
                });
                return ret;
            }
        }
    }
})(window.angular);
