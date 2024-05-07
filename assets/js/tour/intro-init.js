(function($) {
    "use strict";
    var intro_start = {
        init: function() {
            introJs().setOption("dontShowAgain", true).start();
        }
    };
    intro_start.init()
})(jQuery);