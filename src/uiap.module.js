/**
 * AngularJS UI library
 * @author  Andrey Pavlov <andrew.m.pavlov@gmail.com>
 * @copyright (c) 2015
 * @licence MIT
 */
(function (angular) {
    'use strict';

    angular.module('ui.ap', [
        'ui.ap.faq',
        'ui.ap.modal',
        'ui.ap.quick-search',
        'ui.ap.text-input',
        'ui.ap.you-tube',
        'ui.ap.disable-state',
        'ui.ap.auto-focus',
        'ui.ap.before-leave'
    ]);

})(window.angular);
