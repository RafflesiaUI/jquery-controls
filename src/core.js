/*
* Rafflesia UI
* @version: 1.0.2
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.rafflesia = $.rafflesia || {};

$.extend($.rafflesia, {
    _culture: {
        currencyFormat: {
            decimalDigits: 2,
            decimalSeparator: ".",
            groupSeparator: ",",
            negativePattern: "($n)",
            currencySymbol: "RM"
        },
        dateFormat: {
            shortDatePattern: "dd/MM/yyyy"
        },
        numberFormat: {
            decimalDigits: 2,
            decimalSeparator: ".",
            groupSeparator: ",",
            negativePattern: "-n"
        }
    },

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
    },

    uiView: {
        readOnly: 0,
        edit: 2
    },

    version: "1.0.2",

    endsWith: function (value, suffix, ignoreCase) {
        if (ignoreCase) {
            suffix = suffix.toLowerCase();
            value = value.toLowerCase();
        }

        return (value.substr(value.length - suffix.length) === suffix);
    },

    getDateFormat: function () {
        return this._culture.dateFormat;
    },

    setCultureInfo: function (cultureInfo) {
        $.extend(true, this._culture, cultureInfo || {});
        return this._culture;
    },

    startsWith: function (value, prefix, ignoreCase) {
        if (ignoreCase) {
            prefix = prefix.toLowerCase();
            value = value.toLowerCase();
        }

        return (value.substr(0, prefix.length) === prefix);
    },

    toString: function (value, format) {
        if (this.startsWith(format, "c", true)) {
            var currencySymbol = this._culture.currencyFormat.currencySymbol,
                decimalDigits = this._culture.currencyFormat.decimalDigits,
                decimalSeparator = this._culture.currencyFormat.decimalSeparator,
                groupSeparator = this._culture.currencyFormat.groupSeparator,
                negativePattern = this._culture.currencyFormat.negativePattern;

            var dataFormatPattern = "0";
            if (groupSeparator && groupSeparator.length) {
                dataFormatPattern = "0," + dataFormatPattern;
            }

            var precision = parseInt(format.substr(1));
            if (precision > 0) {
                decimalDigits = precision;
            }

            if (decimalSeparator && decimalSeparator.length && decimalDigits > 0) {
                dataFormatPattern = dataFormatPattern + ("." + Array(decimalDigits + 1).join("0"));
            }

            dataFormatPattern = negativePattern.replace("n", dataFormatPattern);

            return numeral(value)
                .format(dataFormatPattern)
                .replace("$", currencySymbol)
                .replace(/,/g, groupSeparator)
                .replace(".", decimalSeparator);
        }
        else if (this.startsWith(format, "d", true)) {
            var decimalDigits = this._culture.numberFormat.decimalDigits,
                decimalSeparator = this._culture.numberFormat.decimalSeparator,
                groupSeparator = this._culture.numberFormat.groupSeparator,
                negativePattern = this._culture.numberFormat.negativePattern;

            var dataFormatPattern = "0";
            if (groupSeparator && groupSeparator.length) {
                dataFormatPattern = "0," + dataFormatPattern;
            }

            var precision = parseInt(format.substr(1));
            if (precision > 0) {
                decimalDigits = precision;
            }

            if (decimalSeparator && decimalSeparator.length && decimalDigits > 0) {
                dataFormatPattern = dataFormatPattern + ("." + Array(decimalDigits + 1).join("0"));
            }

            dataFormatPattern = negativePattern.replace("n", dataFormatPattern);

            return numeral(value)
                .format(dataFormatPattern)
                .replace(/,/g, groupSeparator)
                .replace(".", decimalSeparator);
        }

        return '' + value;
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