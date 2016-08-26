/*
* Rafflesia UI
* @version: 1.0.2
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.rafflesia = $.rafflesia || {};

$.extend($.rafflesia, {
    version: "1.0.2",

    keyCode: {
        ALT: 18,
        BACKSPACE: 8,
        CAPSLOCK: 20,
        COMMA: 188,
        CTRL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        NUMLOCK: 144,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PAUSE: 19,
        PERIOD: 190,
        RIGHT: 39,
        SCROLLLOCK: 145,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38
    }
});

$.fn.extend({
    focus: (function (orig) {
        return function () {
            var element = $(this);
            if (element.data("rafflesiaCombobox")) {
                element.combobox("focus");
                return;
            }

            return orig.apply(this, arguments);
        };
    })($.fn.focus)
});

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

String.prototype.endsWith = function (suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.startsWith = function (prefix) {
    return (this.substr(0, prefix.length) === prefix);
}