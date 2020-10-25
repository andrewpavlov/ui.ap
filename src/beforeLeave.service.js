/**
 * @ngdoc service
 * @name ui.ap.services:beforeLeave
 * @description
 * This service checks whether all changes on current page are saved
 * in case we are leaving this page
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.before-leave', [
            'ui.ap.modal'
        ])
        .factory('beforeLeave', beforeLeave);

    beforeLeave.$inject = [
        '$transitions',
        '$window',
        '$state',
        'modalDialog'
    ];

    function beforeLeave($transitions, $window, $state, modalDialog) {
        var exports = {
            register: register,
            unregister: unregister
        };

        var _listener = false;
        var _subscribers = {};
        var _dialog = false;

        return exports;

        ////////////////

        /**
         * @ngdoc method
         * @name ui.ap.services:beforeLeave#register
         * @methodOf ui.ap.services:beforeLeave
         * @param {Function}    fn          Callback function
         *                                  To check whether all data is saved
         *                      the         specified function will be called.
         * @param {String=}     uid         Registration Id
         * @returns {String}    Registration Id
         * @description
         * It registers new "check on dirty" function
         */
        function register(fn, uid) {
            if (!uid) {
                uid = utils.uniqueId();
            }
            if (!_listener) {
                _listener = true;
                angular.element($window).bind('beforeunload', onWindow);
                $transitions.onStart({}, onRoute);
            }
            _subscribers[uid] = fn;
            return uid;
        }

        /**
         * @ngdoc method
         * @name ui.ap.services:beforeLeave#unregister
         * @methodOf ui.ap.services:beforeLeave
         * @param {String} uid Registration Id
         * @description
         * It unregisters "check on dirty" function
         */
        function unregister(uid) {
            if (!uid) {
                _subscribers = {};
            } else if (angular.isDefined(_subscribers[uid])) {
                delete _subscribers[uid];
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.services:beforeLeave#onRoute
         * @methodOf ui.ap.services:beforeLeave
         * @returns {Boolean} false will be returned if we
         *                    should prevent state changing
         * @description
         * $stateChangeStart CB function.
         */
        function onRoute(transition) {
            var to = transition.to();
            var params = transition.params();
            if (_dialog) {
                transition.abort();
                return false;
            }

            var dirty = _checkDirty();
            if (!dirty) {
                unregister();
                return true;
            }

            modalDialog
                .confirm(dirty.msg)
                .then(function () {
                    _dialog = false;
                    unregister();
                    $state.go(to.name, params);
                })
                .catch(function () {
                    _dialog = false;
                });

            transition.abort();
            return false;
        }

        /**
         * @ngdoc method
         * @name ui.ap.services:beforeLeave#onWindow
         * @methodOf ui.ap.services:beforeLeave
         * @returns {String} Error message will be returned
         *                   if we should show page leaving
         *                   confirmation dialog
         *                   Otherwise it returns nothing
         * @description
         * window.beforeunload CB function.
         */
        function onWindow(ev) {
            var dirty = _checkDirty();
            if (dirty) {
                return dirty.msg;
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.services:beforeLeave#_checkDirty
         * @methodOf ui.ap.services:beforeLeave
         * @returns {Object}
         * uid: Handler Id,
         * msg: Error message will be returned
         * if we not all changes were saved Otherwise it returns null
         * @description
         * Calls all registered function and checks
         * whether we should prevent page leaving
         */
        function _checkDirty() {
            var ret = null;
            angular.forEach(_subscribers, function (_fn, _uid) {
                if (!ret) {
                    var msg = _fn();
                    if (msg) {
                        ret = {
                            uid: _uid,
                            msg: typeof msg === 'string' ? msg : 'You have unsaved changes, proceed anyway?'
                        }
                    }
                }
            });
            return ret;
        }
    }
})(window.angular);
