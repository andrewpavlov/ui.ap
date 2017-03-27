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
        .component('faq', {
            templateUrl: 'view/faq.component.html',
            controller: Controller,
            controllerAs: 'vm',
            bindings: {
                header: '@',
                source: '@',
                opened: '@'
            }
        });

    Controller.$inject = [
        '$http'
    ];

    function Controller($http) {
        var vm = this;
        vm.items = [];

        activate();

        ////////////////

        function activate() {
            if (vm.source.match(/^(https?:)?\/{2}/i)) {
                load(vm.source)
                    .then(function () {
                        vm.items = _faqParse(vm.source);
                    });
            } else {
                vm.items = _faqParse(vm.source);
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
                    vm.source = res.data;
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
})(window.angular);
