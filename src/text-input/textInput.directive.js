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
