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

/**
 * @ngdoc directive
 * @name ui.ap.directives:autoFocus
 * @param {String=} autoFocus       O/false/off/no defines whether auto focus
 *                                  should be applied or not
 * @param {Number}  focusDelay      ms to wait before focus
 * @param {String}  autoSelect      in case auto focus applies to input type text
 *                                  or text area it allows to auto select text on focus.
 * @restrict A
 * @description
 * Autofocus directive
 * It allows to make element focused by default
 * @example
 * <pre>
 *     <input type=text auto-focus/>
 *     <div auto-focus>
 *         .....
 *         <textarea></textarea>
 *         .....
 *     </div>
 *     <button auto-focus focus-delay="1000">
 *     </button>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.auto-focus', [])
        .directive('autoFocus', autoFocus);

    autoFocus.$inject = ['$timeout'];

    function autoFocus($timeout) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        /**
         * Link function
         */
        function link(scope, element, attrs, controller) {
            var autoFocus = attrs.autoFocus;
            if (autoFocus && autoFocus.match(/(0|f|n|off)/i)) {
                autoFocus = false;
            }
            if (autoFocus !== false && !attrs.autoFocused) {
                var delay = angular.isDefined(attrs.focusDelay) ? attrs.focusDelay : 10;
                $timeout(function () {
                    setFocus(element, attrs);
                }, delay);
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.directives:autoFocus#setFocus
         * @methodOf ui.ap.directives:autoFocus
         * @param {Object} element  DOM element
         * @param {Object} attrs    DOM element attributes
         * @description
         * It focus the specified element
         */
        function setFocus(element, attrs) {
            attrs.autoFocused = true;
            var types = [
                'input:first',
                'textarea:first',
                'button:first',
                'a:first'
            ];
            var el;
            angular.forEach(types, function (_t) {
                if (!el) {
                    var _el = element.find(_t);
                    if (_el && _el.length) {
                        el = _el;
                    }
                }
            });
            if (!el) {
                el = element;
            }
            el[0].focus();
            if (angular.isDefined(attrs.autoSelect)) {
                select(el);
            }
        }

        /**
         * @ngdoc method
         * @name ui.ap.directives:autoFocus#select
         * @methodOf ui.ap.directives:autoFocus
         * @description
         * It selects text
         */
        function select(element) {
            element[0].select();
        }
    }
})(window.angular);
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
        '$rootScope',
        '$window',
        '$state',
        'modalDialog'
    ];

    function beforeLeave($rootScope, $window, $state, modalDialog) {
        var exports = {
            register: register,
            unregister: unregister
        };

        var _routeEvents = [
                //'$locationChangeStart',
                '$stateChangeStart'
            ],
            _listeners = [],
            _subscribers = {},
            _dialog = false;

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
            if (!_listeners.length) {
                // subscribe
                angular.element($window).bind('beforeunload', onWindow);
                _routeEvents.forEach(function (_e) {
                    $rootScope.$on(_e, onRoute);
                    _listeners.push(_e);
                });
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
                // angular.forEach(_subscribers, function (_fn, _uid) {
                //     unregister(_uid);
                // });
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
        function onRoute(ev, to, params, from, fromParams) {
            if (_dialog) {
                ev.preventDefault();
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
                    //$rootScope.$broadcast('resetAllForms');
                })
                .catch(function () {
                    _dialog = false;
                });

            ev.preventDefault();
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
/**
 * @ngdoc directive
 * @name ui.ap.directives:textInput
 * @param {String=}         placeholder         Input placeholder
 * @param {String=}         label               Input label
 * @param {String=}         input-id            Input element id
 * @param {String=}         type                DOM prop type
 * @param {String=}         name                DOM prop type
 * @param {String=}         maxlength           DOM prop maxlength
 * @param {String=}         max                 DOM prop max
 * @param {String=}         min                 DOM prop min
 * @param {String=}         autocomplete        DOM prop autocomplete
 * @param {Function=}       validation-func     Input validation
 * @param {Object=}         validation-mark     ClassNames for valid/notvalid states
 * @param {String|Object=}  validation-errors   Errors
 *                                              {{String}} - will used for any types of errors
 *                                              {{Object}} - {
 *                                                  required: 'This field should not be empty'
 *                                              }
 * @param {Boolean=}        ng-required         required state
 * @param {Boolean=}        ng-disabled         Disabled state
 * @param {Boolean=}        ng-readonly         Readonly state
 * @param {String=}         ng-pattern          Ng pattern
 * @param {Function=}       ng-change           On change event
 * @param {Object}          ng-model            Angular ngModel
 * @restrict EA

 * @description
 * Text Input Control
 * @example
 * <pre>
 *     <div text-input type="text" ng-model="register.name" max-length="50" placeholder="Enter your name"></div>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.text-input', [])
        .directive('textInput', textInput);

    textInput.$inject = ['$q'];

    function textInput($q) {
        var directive = {
            templateUrl: 'view/textInput.directive.html',
            link: link,
            restrict: 'EA',
            require: ['ngModel', '^?form', '?ngRequired'],
            transclude: true,
            scope: {
                type: '@',
                name: '@',
                placeholder: '@',
                label: '@',
                inputId: '@', // 'id' can't be used here because both directive itself
                validationFunc: '&',
                validationMark: '=',
                validationErrors: '=',
                // and input control will get same 'id'
                ngRequired: '=',
                ngPattern: '=',
                ngDisabled: '=',
                ngReadonly: '=',
                ngChange: '&',
                ngModel: '='
            }
        };

        var _attrs = [{
            attr: 'maxlength',
            def: '256'
        }, {
            attr: 'max',
            def: ''
        }, {
            attr: 'min',
            def: ''
        }, {
            attr: 'autocomplete',
            def: 'off'
        }];

        return directive;

        function link(scope, element, attrs, ctrl) {
            var ngModel = ctrl[0],
                form = ctrl[1],
                //ngRequired = ctrl[2],
                input = element.find('.ap-text-input-value:first'),
                formInput = (form && ngModel.$name) ? form[ngModel.$name] : null,
                customError,
                validationMark = {
                    ok: null,
                    error: null
                };
            scope.onFocus = onFocus;

            activate();

            /////////////////////

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#activate
             * @methodOf ui.ap.directives:textInput
             * @description
             * Activates directory controller
             */
            function activate() {
                handleSubClasses();

                populateAttributes();

                if (angular.isDefined(attrs.validationFunc)) {
                    ngModel.$asyncValidators.custom = customValidation;
                }

                // Validation marks
                initValidationMark();

                // Validation watcher
                if (formInput) {
                    scope.$watch(function () {
                        var err = errorType();
                        return err ? errorMessage(err) : null;
                    }, function (err) {
                        onError(err);
                    });
                }
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#populateAttributes
             * @methodOf ui.ap.directives:textInput
             * @description
             * Populates attributes to input element
             */
            function populateAttributes() {
                if (!scope.inputId) {
                    scope.inputId = 'apti-' + Math.floor(Math.random() * Math.pow(10, 10));
                }
                if (scope.placeholder) {
                    input.attr('placeholder', scope.placeholder);
                }
                _attrs.forEach(function (_a) {
                    input.attr(_a.attr, attrs[_a.attr] || _a.def);
                });
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#handleSubClasses
             * @methodOf ui.ap.directives:textInput
             * @description
             * It sets subclass names in dependency of directive states
             */
            function handleSubClasses() {
                // Add directive class name
                element.addClass('ap-text-input');

                // Handle disable state
                scope.$watch('ngDisabled', function (val) {
                    if (val) {
                        element.addClass('ap-text-input-disabled');
                    } else {
                        element.removeClass('ap-text-input-disabled');
                    }
                });
                // Handle disable state
                scope.$watch('ngRequired', function (val) {
                    if (val) {
                        element.addClass('ap-required-field');
                    } else {
                        element.removeClass('ap-required-field');
                    }
                });
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#initValidationMark
             * @methodOf ui.ap.directives:textInput
             * @description
             * Initialize subclasses for validation marking
             */
            function initValidationMark() {
                if (scope.validationMark) {
                    if (typeof scope.validationMark === 'string') {
                        validationMark.ok = scope.validationMark;
                    } else if (typeof scope.validationMark === 'object') {
                        if (scope.validationMark.ok) {
                            validationMark.ok = scope.validationMark.ok;
                        }
                        if (scope.validationMark.error) {
                            validationMark.error = scope.validationMark.error;
                        }
                    } else {
                        validationMark.ok = 'ap-text-input-ok';
                    }
                }
                if (!validationMark.error) {
                    validationMark.error = 'ap-text-input-error';
                }
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#customValidation
             * @methodOf ui.ap.directives:textInput
             * @param   {Any} modelValue ngModel model value
             * @param   {Any} viewValue  ngModel view value
             * @description
             * Input async validator function
             */
            function customValidation(modelValue, viewValue) {
                var what = modelValue || viewValue;
                var err = scope.validationFunc({
                    value: what
                });
                return $q.when(err)
                    .then(function (resp) {
                        if (ngModel.$viewValue !== what || !resp) {
                            customError = null;
                            return true;
                        }
                        customError = resp;
                        return $q.reject(resp);
                    });
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#dirty
             * @methodOf ui.ap.directives:textInput
             * @description
             * It checks whether input was changed
             */
            function inputDirty() {
                // TODO: add params describes behavior like mode: d (if dirty)/ s (if submitted0/das (d and s)/dos (d or s)
                return formInput && formInput.$pristine && formInput.$dirty || form && form.$submitted;
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#onError
             * @methodOf ui.ap.directives:textInput
             * @param {String} err Error type
             * @description
             * It populates input validation state
             */
            function onError(err) {
                var dirty = inputDirty();
                if (err === null || !dirty) {
                    if (dirty && validationMark.ok) {
                        element.addClass(validationMark.ok);
                    }
                    element.removeClass(validationMark.error);
                } else {
                    if (validationMark.ok) {
                        element.removeClass(validationMark.ok);
                    }
                    element.addClass(validationMark.error);
                }
                scope.errorMessage = err;
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#errorType
             * @methodOf ui.ap.directives:textInput
             * @returns {String} Error type
             * @description
             * Calculates error type
             */
            function errorType() {
                if (!inputDirty()) {
                    return false;
                }
                var err;
                if (formInput && !err) {
                    angular.forEach(formInput.$error, function (_err, _type) {
                        if (!err) {
                            err = _type;
                        }
                    });
                }
                if (!err && ngModel.$invalid) {
                    angular.forEach(ngModel.$error, function (_err, _type) {
                        if (!err) {
                            err = _type;
                        }
                    });
                }
                return err;
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#errorMessage
             * @methodOf ui.ap.directives:textInput
             * @param {String} err Error message
             * @description
             * Calculates error message
             */
            function errorMessage(err) {
                var msg = '';
                if (err === 'custom' && typeof customError === 'string') {
                    msg = customError;
                }
                if (!msg) {
                    if (typeof scope.validationErrors === 'string') {
                        msg = scope.validationErrors;
                    } else if (typeof scope.validationErrors === 'object' && scope.validationErrors[err]) {
                        msg = scope.validationErrors[err];
                    }
                    if (!msg) {
                        if (err === 'required') {
                            msg = 'This field should not be empty';
                        } else if(err === 'email') {
                            msg = 'The email you entered is invalid';
                        }
                    }
                }
                return msg;
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:textInput#onFocus
             * @methodOf ui.ap.directives:textInput
             * @description
             * CB function
             * It will be called if label onfocus event
             */
            function onFocus() {
                input.focus();
            }
        }
    }
})(window.angular);

/**
 * @ngdoc directive
 * @name ui.ap.directives:youtubeVideo
 * @param {String=}         placeholder         Input label (`Watch the video` by default)
 * @param {String}          you-id              Youtube Id
 * @param {String=}         btn-class           Extra css class for button
 * @restrict EA
 * @description
 * Youtube video link
 * @example
 * <pre>
 *     <youtube-video placeholder="Watch" you-id="youtubevideoid"></youtube-video>
 * </pre>
 */
(function (angular) {
    'use strict';

    angular
        .module('ui.ap.you-tube', [])
        .directive('youtubeVideo', youtubeVideo);

    youtubeVideo.$inject = ['$window'];

    function youtubeVideo($window) {
        var directive = {
            templateUrl: 'view/youtubeVideo.directive.html',
            link: link,
            restrict: 'EA',
            transclude: true,
            scope: {
                placeholder: '@',
                youId: '@',
                btnClass: '@'
            }
        };

        return directive;

        function link(scope, element, attrs, vm) {
            scope.mobileBrowser = mobileBrowser;
            scope.watchVideo = watchVideo;

            activate();

            /////////////////////

            /**
             * @ngdoc method
             * @name ui.ap.directives:youtubeVideo#activate
             * @methodOf ui.ap.directives:youtubeVideo
             * @description
             * Activates directory controller
             */
            function activate() {
                if (scope.placeholder) {
                    scope.placeholder = 'Watch the video';
                }
                if (!angular.isDefined(scope.btnClass)) {
                    scope.btnClass = 'btn-block btn-lg text-uppercase';
                }

                element.addClass('ap-youtube-video');
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:youtubeVideo#mobileBrowser
             * @methodOf ui.ap.directives:youtubeVideo
             * @description
             * Checks whether the current browser is a mobile browser
             * @returns {Boolean}
             * true - if mobile browser
             */
            function mobileBrowser() {
                var s = navigator.userAgent || navigator.vendor || window.opera;
                return s.match(/android|blackberry|mobile|iPhone|iPad|iPod|mobile.+firefox|opera m(ob|in)i|phone/i);
            }

            /**
             * @ngdoc method
             * @name ui.ap.directives:youtubeVideo#watchVideo
             * @methodOf ui.ap.directives:youtubeVideo
             * @param {String}  youTubeId   Youtube id
             * @description
             * Runs video using youtube API
             */
            function watchVideo(youTubeId) {
                var htmFrame = '<iframe src="//www.youtube.com/embed/' +
                    youTubeId +
                    '?autoplay=1&rel=0&showinfo=0" frameborder="0" allowfullscreen>' +
                    '</iframe>';
                // if (mobileBrowser()) {
                //     document.location = '//www.youtube.com/watch?v=' + youTubeId;
                // } else {
                $(document.body).append(
                    '<div class="ap-video about" onclick="$(this).detach()">' +
                    '<div class="close">' +
                    '<span class="glyphicon glyphicon-remove"></span>' +
                    '</div>' +
                    '<div class="iframe">' +
                    htmFrame +
                    // (typeof YT != 'undefined' ? '<div id="player"></div>' : htmFrame) +
                    '</div>' +
                    '</div>'
                );
                angular
                    .element($window)
                    .unbind('resize', resizeVideo)
                    .bind('resize', resizeVideo);
                resizeVideo();
                // if (typeof YT != 'undefined') {
                //     new YT.Player('player', {
                //         videoId: youTubeId,
                //         events: {
                //             'onReady': function (ev) {
                //                 ev.target.playVideo();
                //             },
                //             'onStateChange': function (ev) {
                //                 if (ev.data == 0) {
                //                     $('.ap-video').detach();
                //                 }
                //             }
                //         }
                //     });
                // }
            }

            function resizeVideo() {
                var w = angular.element($window);
                var jqVideo = $('.ap-video .iframe');
                if (jqVideo.size()) {
                    var pos = {
                        width: Math.round(w.width() * 0.8),
                        height: Math.round(w.height() * 0.8)
                    };
                    var aspectRatio = 1.66;
                    if (pos.width / pos.height > aspectRatio) {
                        pos.width = Math.round(pos.height * aspectRatio);
                    }
                    else {
                        pos.height = Math.round(pos.width / aspectRatio);
                    }
                    pos.top = Math.round(w.height() / 2) - Math.round(pos.height / 2) + 'px';
                    pos.width += 'px';
                    pos.height += 'px';
                    jqVideo.css(pos);
                }
                else {
                    w.unbind('resize', resizeVideo);
                }
            }
        }
    }
})(window.angular);
(function(module) {
try {
  module = angular.module('ui.ap');
} catch (e) {
  module = angular.module('ui.ap', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('view/faq.directive.html',
    '<div class="ap-faq"><h3 ng-bind="header"></h3><ul class="list-unstyled"><li class="ap-faq__item" ng-repeat="item in items" ng-click="item.opened = !item.opened"><div class="ap-faq__item__q" ng-class="{\'ap-active\' : item.opened}" ng-bind="item.q"></div><div ng-show="item.opened" class="ap-faq__item__a" ng-bind-html="item.a"></div></li></ul></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ui.ap');
} catch (e) {
  module = angular.module('ui.ap', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('view/modalDialog.html',
    '<div class="modal-header"><h3 class="modal-title">{{ vm.title }}</h3><div class="modal-body">{{ vm.message }}</div><div class="modal-footer"><button class="btn btn-ok" type="button" auto-focus="{{ vm.default === \'ok\' }}" ng-click="vm.ok()">{{ vm.buttons.ok }}</button> <button class="btn btn-cancel" type="button" auto-focus="{{ vm.default === \'cancel\' }}" ng-if="vm.buttons.cancel" ng-click="vm.cancel()">{{ vm.buttons.cancel }}</button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ui.ap');
} catch (e) {
  module = angular.module('ui.ap', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('view/quickSearch.directive.html',
    '<div class="ap-inner-addon ap-search-addon" ng-class="{\'ap-dirty-addon\' : quickSearchText}"><input class="form-control" type="text" placeholder="Quick search" ng-model="quickSearchText"> <span class="glyphicon glyphicon-search"></span> <span class="glyphicon glyphicon-remove" ng-click="quickSearchText = \'\'"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ui.ap');
} catch (e) {
  module = angular.module('ui.ap', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('view/textInput.directive.html',
    '<div class="ap-text-input-wrapper"><label class="ap-text-input-label" ng-if="label" ng-click="onFocus()" for="{{ inputId }}" ng-bind="label"></label><input class="ap-text-input-value form-control" type="{{ type }}" name="{{ name }}" id="{{ inputId }}" ng-pattern="ngPattern" ng-required="ngRequired" ng-disabled="ngDisabled" ng-readonly="ngReadonly" ng-change="wpChange()" ng-model="ngModel"><ng-transclude></ng-transclude><span class="ap-text-input-label-error" ng-bind="errorMessage"></span></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('ui.ap');
} catch (e) {
  module = angular.module('ui.ap', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('view/youtubeVideo.directive.html',
    '<a class="ap-youtube-video__watch-video" ng-href="{{ mobileBrowser() ? \'//www.youtube.com/watch?v=\' + youId : \'\' }}" ng-click="watchVideo(youId)"><ng-transclude></ng-transclude><button ng-if="btnClass" class="btn" type="button" ng-class="btnClass">{{ placeholder }}</button></a>');
}]);
})();
