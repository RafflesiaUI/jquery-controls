/*
* Rafflesia UI
* @version: 1.0.0
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.fn.uidatepicker = $.fn.datepicker;
delete $.fn.datepicker;

$.widget("rafflesia.datepicker", {
    version: "1.0.0",
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
            .addClass("ui-datepicker")
            .uidatepicker(uioptions);
    },

    _destroy: function () {
        this.element
            .datepicker("destroy")
            .removeClass("ui-datepicker");
    },

    _setOption: function (key, value) {
        switch (key.toLowerCase()) {
            case "dateformat":
                this.element.datepicker("option", "dateFormat", value);
                break;

            case "gotocurrent":
                this.element.datepicker("option", "gotoCurrent", value);
                break;
        }

        this._super(key, value);
    },
    
    hide: function () {
        this.element.datepicker("hide");
    },

    show: function () {
        this.element.datepicker("show");
    }
});