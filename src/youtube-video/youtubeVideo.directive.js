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