$.widget("rafflesia.daterangepicker", {
    options: {
        parentEl: "body",
        dateFormat: "mm/dd/yy",
        startDate: new Date(),
        endDate: new Date(),
        ranges: {},

        // callbacks
        change: null,
        random: null
    },

    _create: function () {
        var self = this;

        self.startDate = self.parseDate(self.options.startDate);
        self.endDate = self.parseDate(self.options.endDate);
        self.anchors = $.map(self.options.ranges, function (value, key) {
            var startDate = self.parseDate(value[0]),
                endDate = self.parseDate(value[1]);

            var dateRangeText = $.datepicker.formatDate("yymmdd", startDate) + "|" + $.datepicker.formatDate("yymmdd", endDate)
            return $("<a>", { "href": "#" + dateRangeText })
                    .text(key);
        });

        self.element
            .addClass("ui-daterangepicker");

        self.parentEl = $(self.options.parentEl || "body");

        self.dropdown = $("<div>")
            .addClass("ui-daterangepicker ui-dropdownmenu")
            .appendTo(self.parentEl);

        self.createPickerPane(self.dropdown);

        self.optionpane = $("<div>")
            .addClass("ui-optionpane")
            .appendTo(self.dropdown);

        self.createRangeList(self.optionpane);
        self.createButtonPane(self.optionpane);
    },

    _refresh: function () {
    },

    _destroy: function () {
        var self = this;

        self.calendar.datepicker("destroy");

        self.optionpane.remove();
        self.pickerpane.remove();
        self.dropdown.remove();

        self.element
            .removeClass("ui-daterangepicker");
    },

    _setOptions: function () {
        this._superApply(arguments);
        this._refresh();
    },

    _setOption: function (key, value) {
        // prevent invalid color values
        //if (/red|green|blue/.test(key) && (value < 0 || value > 255)) {
        //    return;
        //}

        alert(key);
        this._super(key, value);
    },

    createPickerPane: function (container) {
        var self = this;

        self.pickerpane = $("<div>")
            .addClass("ui-pickerpane")
            .appendTo(container);

        self.startdateinput = $("<input>", { type: "text" })
            .addClass("form-control");
        self.enddateinput = $("<input>", { type: "text" })
            .addClass("form-control");

        $("<div class='ui-inputgroup'></div>")
            .append(self.startdateinput)
            .append("<i class='fa fa-calendar glyphicon glyphicon-calendar'></i>")
            .appendTo(self.pickerpane);

        $("<div class='ui-inputgroup'></div>")
            .append(self.enddateinput)
            .append("<i class='fa fa-calendar glyphicon glyphicon-calendar'></i>")
            .appendTo(self.pickerpane);

        self.calendar = $("<div>")
            .addClass("ui-calendarpicker")
            .datepicker({
                dateFormat: 'dd/mm/yy',
                numberOfMonths: 2,
                beforeShowDay: function (date) {
                    var renderDate = $.datepicker.formatDate("yymmdd", date);
                    if (self.startDate && renderDate == $.datepicker.formatDate("yymmdd", self.startDate)) {
                        return [true, "ui-state-active ui-state-start"];
                    }
                    else if (self.endDate && renderDate == $.datepicker.formatDate("yymmdd", self.endDate)) {
                        return [true, "ui-state-active ui-state-end"];
                    }

                    return [true, ""];
                },
                onSelect: function (dateText) {
                }
            })
            .appendTo(self.pickerpane);
    },

    createRangeList: function (container) {
        var self = this;

        self.rangelist = $("<ul>")
            .addClass("ui-rangelist")
            .appendTo(container);

        if (self.anchors && self.anchors.length > 0) {
            self.anchors.push($("<a>", { "href": "#" }).text("Specific Date"));
        }

        $.each(self.anchors, function (i, anchor) {
            $("<li>")
                .append(anchor)
                .appendTo(self.rangelist);
        });
    },

    createButtonPane: function (container) {
        var self = this;

        var buttonpane = $("<div>")
            .addClass("ui-buttonpane")
            .appendTo(container);

        self.applyButton = $("<button>")
            .addClass("btn btn-success btn-apply")
            .text("Apply")
            .appendTo(buttonpane);

        self.cancelButton = $("<button>")
            .addClass("btn btn-default btn-cancel")
            .text("Cancel")
            .appendTo(buttonpane);
    },

    parseDate: function (value) {
        var date = new Date();
        date.setHours(0, 0, 0, 0);

        try {
            if (typeof value === 'string') {
                date = $.datepicker.parseDate(this.options.dateFormat, value);
                date.setHours(0, 0, 0, 0);
            }
            else if (typeof value === 'object') {
                var year = value.getFullYear(),
                    month = value.getMonth(),
                    day = value.getDate();

                return new Date(year, month, day);
            }
        } catch (ex) {
            // ignore
        }

        return date;
    }
});