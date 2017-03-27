/**
 * @ngdoc directive
 * @name ui.ap.directives:validationForm
 * @restrict A
 * @description
 * Sets focus to first invalid input
 * @example
 * <pre>
 *     <form els-validation-form>
 *         <input type=text required/>
 *         <input type=submit/>
 *     </form>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap')
        .directive('validationForm', validationForm);

    function validationForm() {
        var directive = {
            require: '^form',
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element, attrs, form) {
            element.on('submit', function () {
                // HACK: fix ios autofill issue
                element
                    .find('input, textarea, select')
                    .trigger('change');
                    //.trigger('input')
                    //.trigger('keydown');
                // --
                var first = element.find('input.ng-invalid:first');
                if (!first || !first.length) {
                    first = element.find('.ng-invalid:first input:first');
                }
                first.focus().select();
                var input = form[first.attr('name')];
                if (input) {
                    scope.$apply(function () {
                        input.$setDirty(true);
                    });
                }
            });
        }
    }
})(window.angular);