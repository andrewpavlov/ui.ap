/**
 * @ngdoc service
 * @name ui.ap.services:modalDialog
 * @description
 * Modal dialog service
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.modal', [
            'ui.bootstrap'
        ])
        .factory('modalDialog', modalDialog);

    modalDialog.$inject = [
        '$rootScope',
        '$uibModal'
    ];

    function modalDialog($rootScope, $uibModal) {
        var exports = {
            info: info,
            success: success,
            error: error,
            confirm: confirm,
            show: show
        };

        var _modals = {};

        return exports;

        function info(opts) {
            if (typeof opts !== 'object') {
                opts = {
                    message: opts
                };
            }
            if (!opts.title) {
                opts.title = $rootScope.projectName;
            }
            opts.uid = 'ap-modal-dialog';
            opts.openedClass = 'modal-info';
            return show(opts);
        }

        function success(opts) {
            if (typeof opts !== 'object') {
                opts = {
                    message: opts
                };
            }
            if (!opts.title) {
                opts.title = $rootScope.projectName;
            }
            opts.uid = 'ap-modal-dialog';
            opts.openedClass = 'modal-success';
            return show(opts);
        }

        function error(opts) {
            if (typeof opts !== 'object') {
                opts = {
                    message: opts
                };
            }
            if (!opts.title) {
                opts.title = 'Error';
            }
            opts.uid = 'ap-modal-dialog';
            opts.openedClass = 'modal-danger';
            return show(opts);
        }

        function confirm(opts) {
            if (typeof opts !== 'object') {
                opts = {
                    message: opts
                };
            }
            if (!opts.title) {
                opts.title = $rootScope.projectName;
            }
            opts.uid = 'ap-modal-dialog';
            opts.cancel = true;
            return show(opts);
        }

        function show(opts) {
            if (!opts) {
                opts = {};
            }
            if (!angular.isDefined(opts.animation)) {
                opts.animation = false
            }
            if (!angular.isDefined(opts.templateUrl)) {
                opts.templateUrl = 'view/modalDialog.html';
            }
            if (!angular.isDefined(opts.controller)) {
                opts.controller = modalCtrl;
                opts.controllerAs = 'vm';
            }
            if (!angular.isDefined(opts.size)) {
                opts.size = 'md';
            }
            if (!opts.backdrop) {
                opts.backdrop = 'static';
            }
            if (!opts.keyboard) {
                opts.keyboard = true;
            }
            if (!opts.openedClass) {
                opts.openedClass = '';
            }
            if (!opts.uid) {
                opts.uid = utils.uniqueId('ap-modal');
            }
            if (!_modals[opts.uid]) {
                _modals[opts.uid] = $uibModal.open(opts);
                _modals[opts.uid].result.finally(function () {
                    _modals[opts.uid] = null;
                });
            }

            return _modals[opts.uid].result;

            function modalCtrl() {
                var vm = this;
                vm.ok = ok;
                vm.cancel = cancel;
                vm.title = opts.title || '';
                vm.message = opts.message || '';
                vm.default = opts.default || 'ok';
                vm.buttons = {
                    ok: opts.ok || 'OK',
                    cancel: opts.cancel === true ? 'Cancel' : opts.cancel
                };

                function ok() {
                    _modals[opts.uid].close();
                    delete _modals[opts.uid];
                }

                function cancel() {
                    _modals[opts.uid].dismiss('cancel');
                    delete _modals[opts.uid];
                }
            }
        }
    }
})(window.angular);