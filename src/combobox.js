$.widget("rafflesia.combobox", {
    options: {
        delay: 300,
        minLength: 1,
        source: null
    },

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
            .text(self._value())
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

        self.dropdownList = $("<div>")
            .addClass("ui-dropdownlist")
            .appendTo(self.dropdown);

        self.progressBar = $("<label>")
            .appendTo(self.dropdown);

        var projects = [
              {
                  value: "jquery",
                  label: "jQuery",
                  desc: "the write less, do more, JavaScript library",
                  icon: "jquery_32x32.png"
              },
              {
                  value: "jquery-ui",
                  label: "jQuery UI",
                  desc: "the official user interface library for jQuery",
                  icon: "jqueryui_32x32.png"
              },
              {
                  value: "sizzlejs",
                  label: "Sizzle JS",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs7",
                  label: "Sizzle JS7",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs6",
                  label: "Sizzle JS6",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs5",
                  label: "Sizzle JS5",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs4",
                  label: "Sizzle JS4",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs3",
                  label: "Sizzle JS3",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              },
              {
                  value: "sizzlejs2",
                  label: "Sizzle JS2",
                  desc: "a pure-JavaScript CSS selector engine",
                  icon: "sizzlejs_32x32.png"
              }
        ];

        self.searchBox
            .autocomplete({
                appendTo: self.dropdownList,
                delay: self.options.delay,
                minLength: self.options.minLength,
                source: projects,

                close: function (event, ui) {
                    if (self.container.hasClass("open"))
                    {   //TODO : Reset term when dropdown close
                        this.value = "";
                    }                    
                    self.searchBox.autocomplete("widget").empty();
                },
                focus: function (event, ui) {
                    return false;
                },
                select: function (event, ui) {
                    //TODO
                    self.caption.text(ui.item.value);
                    self._value(ui.item.value);
                    self.hide();
                    return false;
                },
                search: function (event, ui) {
                    // TODO : Show searching text
                },
                response: function (event, ui) {
                    // TODO : Show the result text
                },
                change: function( event, ui ) {
                    self._trigger("change", event, ui);
                }
            })
            .autocomplete("instance")._renderItem = function (ul, item) {
                // TODO : allow user customise
                return $("<li>")
                  .append("<a>" + item.label + "<br>" + item.desc + "</a>")
                  .appendTo(ul);
            };
    },

    _refresh: function() {
    },

    _destroy: function () {
        var self = this;

        self.searchBox.autocomplete("destroy");

        self.searchBox.remove();
        self.dropdownList.remove();
        self.dropdown.remove();
        self.caption.remove();
        self.toggleButton.remove();
        self.button.remove();
        self.container.remove();

        self.element.show();
    },

    _bindEvents: function () {
        var self = this;

        self._on(self.button, {
            click: function () {
                if (self.container.hasClass("open")) {
                    self.hide();
                } else {
                    self.show();
                }

                return false;
            }
        });

        self._on(window, {
            resize: function () {
                self.hide();
            }
        });
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
        var self = this;

        self.dropdown.removeClass("up");
        self.dropdownList.height("auto");

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

        
        if ((offsetBottom / Math.max(viewPort.height, bodySize.height)) > 0.75) {
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
                self.dropdownList.outerHeight(maxHeight - 55);
            }
        }
    },

    _value: function (value) {
        if (value)
        {
            this.element.val(value);
            return;
        }

        return this.element.val();
    },

    _setOption: function (key, value) {
        this._super(key, value);
        if (key === "delay") {
            self.searchBox.autocomplete("option", "delay", value);
        }
        if (key === "minLength") {
            self.searchBox.autocomplete("option", "minLength", value);
        }
        if (key === "source") {
            self.searchBox.autocomplete("option", "source", value);
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

        self._trigger("show");
        self._repositionDropDownMenu();
        self.container.addClass("open");
        self.searchBox.focus();
        //TODO: Set min length text
        self._resizeCaptionPane();
        self._trigger("shown");
    },

    hide: function () {
        var self = this;

        if (self.container.hasClass("open")) {
            self.searchBox.autocomplete("close");

            $(document).off(".combobox");

            self._trigger("hide");
            self.container.removeClass("open");
            self.button.focus();
            self._trigger("hidden");
        }
            
        self._resizeCaptionPane();
    }
});
