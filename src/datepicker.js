/*
* Rafflesia UI
* @version: 1.0.1
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.fn.uidatepicker = $.fn.datepicker;
delete $.fn.datepicker;

$.widget("rafflesia.datepicker", {
    version: "1.0.1",
    defaultElement: "<input>",

    options: {
        dateFormat: "mm/dd/yy",
        gotoCurrent: true
    },

    _create: function () {
        var self = this;

        var uioptions = {
            dateFormat: self.options.dateFormat,
            gotoCurrent: self.options.gotoCurrent,

            beforeShow: function () {
                self._trigger("shown");
            },

            onClose: function () {
                self._trigger("hidden");
            }
        };
        self.element
            .uidatepicker(uioptions);

        self._bindEvents();
    },

    _bindEvents: function () {
        this._on(this.element, {
            blur: function () {
                this.hide();
            }
        });

        this._on(window, {
            resize: function () {
                this.hide();
            }
        });
    },

    _destroy: function () {
        this.element
            .uidatepicker("destroy");
    },

    _setOption: function (key, value) {
        switch (key.toLowerCase()) {
            case "dateformat":
                this.element.uidatepicker("option", "dateFormat", value);
                break;

            case "gotocurrent":
                this.element.uidatepicker("option", "gotoCurrent", value);
                break;
        }

        this._super(key, value);
    },

    hide: function () {
        this.element
            .uidatepicker("hide")
            .blur();
    },

    show: function () {
        this.element.uidatepicker("show");
    }
});