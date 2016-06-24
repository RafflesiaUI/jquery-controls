$.widget("rafflesia.combobox", {
    options: {
        parentEl: "body"
    },

    _create: function () {
        var self = this;

        self.parentEl = $(self.options.parentEl || "body");

        self.element.hide();
        self._createComboBox();
        self._createDropDownMenu();
    },

    _createComboBox: function () {
        var self = this;

        self.button = $("<button>")
            .addClass("ui-combobox");

        var captionPane = $("<div>")
            .addClass("ui-captionPane")
            .appendTo(self.button);
  
        self.toggleButton = $("<div>")
            .addClass("ui-togglebutton")
            .html("<span class=\"caret\"></span>")
            .appendTo(self.button);

        self.element.after(self.button);

        self.caption = $("<span>")
            .text("ASASA sadsds ssadsadsd dsadasdas sadasdsads sdsdsad sdsdsad")
            .appendTo(captionPane);

        self._resizeCaptionPane();

        self._bindEvents();
    },

    _createDropDownMenu: function () {
        var self = this;

        self.dropdown = $("<div>")
            .addClass("ui-combobox ui-dropdownmenu")
            .html("adad<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads<br/>sdsads")
            .appendTo(self.parentEl);
    },

    _refresh: function() {
    },

    _destroy: function () {
        var self = this;

        self._unBindEvents();

        self.caption.remove();
        self.toggleButton.remove();
        self.button.remove();

        self.element.show();
    },

    _bindEvents: function () {
        var self = this;

        self.button.on("click.combobox", function () {
            if (self.dropdown.hasClass("open")) {
                self.hide();
            } else {
                self.show();
            }

            return false;
        });

        $(window).on("resize", function () {
            self._resizeCaptionPane();
        });
    },

    _unBindEvents: function () {
        var self = this;

        self.button.off('.combobox');
    },

    _resizeCaptionPane: function () {
        var self = this,
            captionPane = $('.ui-captionPane', self.button);

        self.caption
            .hide()
            .width(captionPane.width())
            .show();
    },

    _reposition: function () {
        var self = this,
            elOffset = self.button.offset(),
            elSize = {
                height: self.button.outerHeight(),
                width: self.button.outerWidth()
            },
            dpSize = {
                height: self.dropdown.outerHeight(),
                width: self.dropdown.outerWidth()
            },
            viewPort = {
                height: $(window).height(),
                width: $(window).width()
            };

        var dpPosition = "center";
        if (((elOffset.left / viewPort.width) * 100) <= 25) {
            dpPosition = "left";
        } else if ((((elOffset.left + elSize.width) / viewPort.width) * 100) > 75 || elSize.width >= dpSize.width) {
            dpPosition = "right";
        }

        self.dropdown
            .css({
                'top': 'auto',
                'left': 'auto'
            })
            .position({
                of: self.button,
                my: dpPosition + " top+5",
                at: dpPosition + " bottom",
                collision: "flip flip",
                within: self.parentEl.is('body') ? window : self.parentEl
            });
    },

    show: function () {
        var self = this;

        if (self.dropdown.hasClass("open")) {
            return;
        }

        var dropdownLostFocus = function (evt) {
            var target = $(evt.target);
            if (evt.type == "focusin" ||
                target.closest(self.element).length ||
                target.closest(self.dropdown).length) {
                return;
            }

            self.hide();
        };

        // Bind global datepicker mousedown for hiding and
        $(document)
          .on("mousedown.combobox", dropdownLostFocus)
          // also support mobile devices
          .on("touchend.combobox", dropdownLostFocus)
          // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
          .on("click.combobox", "[data-toggle=dropdown]", dropdownLostFocus)
          // and also close when focus changes to outside the picker (eg. tabbing between controls)
          .on("focusin.combobox", dropdownLostFocus);

        $(window).on('resize.combobox', function () {
            self.hide();
        });

        self._trigger("show");
        self._reposition();
        self.dropdown.addClass("open");
        self._trigger("shown");
    },

    hide: function () {
        var self = this;

        if (!self.dropdown.hasClass("open")) {
            return;
        }

        $(document).off('.combobox');
        $(window).off('.combobox');

        self._trigger("hide");
        self.dropdown.removeClass("open");
        self.button.focus();
        self._trigger("hidden");
    }
});
