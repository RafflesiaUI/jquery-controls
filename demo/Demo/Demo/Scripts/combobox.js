$.widget("rafflesia.combobox", {
    _create: function () {
        var self = this;

        self.element.hide();
        
        self._createContainer();
        self._createComboBox();
        self._createDropDownMenu();

        self._bindEvents();
    },

    _createContainer: function () {
        var self = this;

        self.container = $("<div>")
            .addClass("ui-combobox");
        self.element.after(self.container);
    },

    _createComboBox: function () {
        var self = this;

        self.button = $("<button>")
            .appendTo(self.container);

        var captionPane = $("<div>")
            .addClass("ui-captionpane")
            .appendTo(self.button);
  
        self.toggleButton = $("<div>")
            .addClass("ui-togglebutton")
            .html("<span class=\"caret\"></span>")
            .appendTo(self.button);

        self.caption = $("<span>")
            .text("ASASA sadsds ssadsadsd dsadasdas sadasdsads sdsdsad sdsdsad")
            .appendTo(captionPane);

        self._resizeCaptionPane();
    },

    _createDropDownMenu: function () {
        var self = this;

        self.dropdown = $("<div>")
            .addClass("ui-dropdownmenu")    
            .appendTo(self.container);

        self.searchBox = $("<input>")
            .attr("type", "text")
            .appendTo($("<div>")
            .addClass("ui-searchbox")
            .appendTo(self.dropdown));

        self.dropdownList = $("<ul>")
            .appendTo($("<div>")
            .addClass("ui-dropdownlist")
            .appendTo(self.dropdown));

        self.dropdownList.append($("<li style='width: 100%'><a href='#'>1. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>2. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>3. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>4. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>5. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>6. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>7. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>8. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>9. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
        self.dropdownList.append($("<li><a href='#'>10. Another action dssasdds sdas dssdsad sdsad sdsds sddsads</a></li>"));
    },

    _refresh: function() {
    },

    _destroy: function () {
        var self = this;

        self._unBindEvents();

        self.caption.remove();
        self.toggleButton.remove();
        self.button.remove();
        self.container.remove();

        self.element.show();
    },

    _bindEvents: function () {
        var self = this;

        self.button.on("click.combobox", function () {
            if (self.container.hasClass("open")) {
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
            captionPane = $('.ui-captionpane', self.button);

        self.caption
            .hide()
            .width(captionPane.width())
            .show();
    },

    _repositionDropDownMenu: function () {
        var self = this,
            dropdownlist = $('.ui-dropdownlist', self.dropdown);

        self.dropdown.removeClass("up");
        dropdownlist.css('height', 'auto');

        var elOffset = self.button.offset(),
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
            },
            bodySize = {
                height: $("body").height(),
                width: $("body").width()
            };

        var offsetLeft = elOffset.left,
            offsetRight = elOffset.left + elSize.width,
            offsetTop = elOffset.top,
            offsetBottom = elOffset.top + elSize.height;

        if ((offsetLeft  / viewPort.width) > 0.25 &&
            (offsetRight / viewPort.width) > 0.75) {
            self.dropdown.addClass("right");
        } else {
            self.dropdown.removeClass("right");
        }

        
        if ((offsetBottom / bodySize.height) > 0.75) {
            self.dropdown.addClass("up");
            return;
        }

        var scrollTop = $(window).scrollTop();
        var bottom = offsetBottom - scrollTop;
        if ((bottom / viewPort.height) > 0.75) {
            self.dropdown.addClass("up");
        }

        if (self.dropdown.hasClass("up")) {
            var maxHeight = offsetTop - scrollTop;
            if (maxHeight < dpSize.height) {
                dropdownlist.outerHeight(maxHeight - 55);
            }
        }
    },

    show: function () {
        var self = this;

        if (self.container.hasClass("open")) {
            return;
        }

        var dropdownLostFocus = function (evt) {
            var target = $(evt.target);
            if (evt.type == "focusin" ||
                target.closest(self.container).length) {
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
        self._repositionDropDownMenu();
        self.container.addClass("open");
        self._resizeCaptionPane();
        self._trigger("shown");
    },

    hide: function () {
        var self = this;

        if (!self.container.hasClass("open")) {
            return;
        }

        $(document).off('.combobox');
        $(window).off('.combobox');

        self._trigger("hide");
        self.container.removeClass("open");
        self.button.focus();
        self._trigger("hidden");
    }
});