/*
* Rafflesia UI
* @version: 1.0.0
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.widget("rafflesia.combobox", {
    options: {
        delay: 300,
        minLength: 1,
        source: null,
        paging: { pageSize: 15 },

        minLengthMessage: "Please enter {0} or more characters",
        loadingMessage: "Loading...",
        noResultsMessage: "No results match",

        normalizeDataItems: null,
        renderDataItem: null
    },

    pageIndex: -1,

    _create: function () {
        this._setOption("paging", this.options.paging);

        this.element.hide();

        this._createContainer();
        this._createComboBox();
        this._createDropDownMenu();

        this._initSource();
        this._bindEvents();
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

        self.searchBox
            .autocomplete({
                appendTo: self.dropdown,
                delay: self.options.delay,
                minLength: self.options.minLength,
                source: self.options.source,

                close: function () {
                    self.pageIndex = -1;

                    if (this.value.length < self.options.minLength &&
                        self.options.minLengthMessage.length > 0) {
                        self._message(String.format(self.options.minLengthMessage, self.options.minLength));
                    }
                },
                focus: function (event, ui) {
                    return false;
                },
                select: function (event, ui) {
                    if (ui.item.state &&
                       (ui.item.state == "loading" || ui.item.state == "info")) {
                        return false;
                    }

                    self.caption.text(ui.item.label);
                    self._value(ui.item.value);
                    self.hide();
                    self.button.focus();

                    return false;
                },
                search: function (event, ui) {
                    self.pageIndex = 1;

                    self.searchBox.autocomplete("widget").empty();
                    self.searchBox.autocomplete("widget").height("auto");
                },
                response: function (event, ui) {
                    self.searchBox.autocomplete("widget").find(".ui-autocomplete-info, .ui-autocomplete-loading").remove();

                    if (ui.content.length == 0 && self.pageIndex < 2) {
                        self._message(self.options.noResultsMessage);
                    }
                },
                change: function (event, ui) {
                    self._trigger("change", event, ui);
                }
            });

        self.searchBox.autocomplete("instance")._normalize = function (items) {
            if (typeof self.options.normalizeDataItems === "function") {
                return self.options.normalizeDataItems(items);
            }

            if (items.length && items[0]["label"] && items[0]["value"]) {
                return items;
            }
            return $.map(items, function (item) {
                if (typeof item === "string") {
                    return {
                        label: item,
                        value: item
                    };
                }
                return $.extend({}, item, {
                    label: item["label"] || item["value"],
                    value: item["value"] || item["label"]
                });
            });
        };

        self.searchBox.autocomplete("instance")._renderMenu = function (ul, items) {
            var that = this;
            $.each(items, function (index, item) {
                that._renderItemData(ul, item);
            });

            self._positionDropDownMenu();
            self._resizeDropDownMenu();
        };

        self.searchBox.autocomplete("instance")._renderItem = function (ul, item) {
            if (typeof self.options.renderDataItem === "function") {
                return self.options.renderDataItem(ul, item);
            }

            return $("<li>").text(item.label).appendTo(ul);
        };

        self.searchBox.autocomplete("instance")._search = function (value) {
            var that = this;

            that.pending++;
            that.cancelSearch = false;

            // append spinner
            that.menu.element.find(".ui-autocomplete-info, .ui-autocomplete-loading").remove();
            $("<li>")
                .addClass("ui-autocomplete-loading")
                .data("ui-autocomplete-item", { value: null, state: "loading" })
                .html(self.options.loadingMessage)
                .appendTo(that.menu.element);

            var request = { term: value };
            if (self._allowPaging()) {

                request = $.extend({
                    skip: (self.pageIndex - 1) * self.options.paging.pageSize,
                    take: self.options.paging.pageSize
                }, request);
            }
            self.source(request, that._response());
        };

        self.searchBox.autocomplete("instance")._suggest = function (items) {
            var that = this,
                ul = that.menu.element;

            if (self._allowPaging()) {
                if (items.length === 0 ||
                    items.length < self.options.paging.pageSize) {
                    self.pageIndex = -1;
                }
                else {
                    self.pageIndex++;
                }
            }
            else {
                ul.empty();
            }

            that._renderMenu(ul, items);
            that.isNewMenu = true;
            that.menu.refresh();

            ul.show();
        };
    },

    _refresh: function () {
    },

    _destroy: function () {
        var self = this;

        self.searchBox.autocomplete("destroy");

        self.searchBox.remove();
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
                self._resizeCaptionPane();
                if (self.container.hasClass("open")) {
                    self.searchBox.autocomplete("widget").height("auto");
                    self._positionDropDownMenu();
                    self._resizeDropDownMenu();
                }
            }
        });

        self._on(self.searchBox.autocomplete("widget"), {
            scroll: function (event) {
                if (!self._allowPaging()) {
                    return;
                }

                var elem = $(event.currentTarget),
                    scrollHeight = elem[0].scrollHeight,
                    scrollTop = elem.scrollTop(),
                    outerHeight = elem.outerHeight();

                if (self.pageIndex > 0 &&
                    scrollTop > 0 &&
                    scrollHeight - scrollTop == outerHeight) {
                    if (self.searchBox.autocomplete("widget").find(".ui-autocomplete-loading").length > 0) {
                        return;
                    }

                    var term = self.searchBox.autocomplete("instance").term;
                    self.searchBox.autocomplete("instance")._search(term);
                }
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

    _positionDropDownMenu: function () {
        var self = this;

        self.dropdown.removeClass("up");

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

        if ((offsetLeft / viewPort.width) > 0.25 &&
            (offsetRight / viewPort.width) > 0.75) {
            self.dropdown.addClass("right");
        } else {
            self.dropdown.removeClass("right");
        }

        if ((offsetBottom / Math.max(viewPort.height, bodySize.height)) > 0.75) {
            self.dropdown.addClass("up");
        }

        var scrollTop = $(window).scrollTop();
        var bottom = offsetBottom - scrollTop;
        if ((bottom / viewPort.height) > 0.75) {
            self.dropdown.addClass("up");
        }
    },

    _resizeDropDownMenu: function () {
        if (!this.dropdown.hasClass("up")) {
            return;
        }

        var elOffsetTop = this.button.offset().top,
            dpHeight = this.dropdown.outerHeight(),
            scrollTop = $(window).scrollTop();

        var maxHeight = elOffsetTop - scrollTop;
        if (maxHeight < dpHeight) {
            this.searchBox.autocomplete("widget").outerHeight(maxHeight - 55);
        }
    },

    _resetTerm: function () {
        this.searchBox
            .autocomplete("close")
            .autocomplete("instance").term = null;

        this.searchBox
            .autocomplete("widget")
            .height("auto")
            .empty();

        this.searchBox
            .val("")
            .focus();
    },

    _initSource: function () {
        var array, url,
			self = this;

        if ($.isArray(this.options.source)) {
            array = this.options.source;
            this.source = function (request, response) {
                var data = $.ui.autocomplete.filter(array, request.term);
                if (self._allowPaging()) {
                    data = data.slice(request.skip, request.take);
                }
                response(data);
            };
        } else if (typeof this.options.source === "string") {
            url = this.options.source;
            this.source = function (request, response) {
                if (self.xhr) {
                    self.xhr.abort();
                }
                self.xhr = $.ajax({
                    async: true,
                    url: url,
                    data: request,
                    dataType: "json",
                    success: function (data) {
                        response(data);
                    },
                    error: function () {
                        response([]);
                    }
                });
            };
        } else {
            this.source = this.options.source;
        }
    },

    _setOption: function (key, value) {
        this._super(key, value);

        switch (key) {
            case "delay":
            case "minLength":
                this.searchBox.autocomplete("option", key, value);
                break;

            case "source":
                this._initSource();
                break;

            case "paging":
                if (this.options.paging) {
                    var defaults = {
                        pageSize: 15
                    };
                    this.options.paging = $.extend({}, defaults, this.options.paging);
                }
                break;
        }
    },

    _message: function (message) {
        this.searchBox.autocomplete("widget")
            .empty()
            .append($("<li>")
            .addClass("ui-autocomplete-info")
            .data("ui-autocomplete-item", { value: null, state: "info" })
            .html(message));
    },

    _value: function (value) {
        if (value) {
            this.element.val(value);
            return;
        }

        return this.element.val();
    },

    _allowPaging: function () {
        return (this.options.paging && this.options.paging.pageSize > 0);
    },

    show: function () {
        var self = this;

        if (self.container.hasClass("open")) {
            return;
        }

        var lostfocusMethod = function (evt) {
            var target = $(evt.target);
            if (target.closest(self.container).length) {
                return;
            }

            self.hide();
        };

        // Bind global combobox mousedown for hiding and
        $(document)
          .on("mousedown.combobox", lostfocusMethod)
           // also support mobile devices
          .on("touchend.combobox", lostfocusMethod)
           // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
          .on("click.combobox", "[data-toggle=dropdown]", lostfocusMethod)
           // and also close when focus changes to outside the picker (eg. tabbing between controls)
          .on("focusin.combobox", lostfocusMethod);

        self._trigger("show");

        if ('ontouchstart' in document.documentElement) {
            self.backdrop = $('<div>')
                .addClass("ui-dropdown-backdrop")
                .insertAfter(self.button)
                .on("click", function () {
                    self.hide();
                });
        }

        self._positionDropDownMenu();
        self.container.addClass("open");
        self.searchBox.autocomplete("widget").height("auto");
        self.button.attr("aria-expanded", "true");

        self._resetTerm();
        if (self.options.minLength <= 0) {
            self.searchBox.autocomplete("search", "");
        }
        else if (self.options.minLengthMessage.length > 0) {
            self._message(String.format(self.options.minLengthMessage, self.options.minLength));
            self._resizeDropDownMenu();
        }

        self._resizeCaptionPane();

        self._trigger("shown");
    },

    hide: function () {
        var self = this;

        if (self.container.hasClass("open")) {
            $(document).off(".combobox");

            self._trigger("hide");

            if (self.backdrop) {
                self.backdrop.remove();
                self.backdrop = null;
            }

            self.container.removeClass("open");
            self.button.attr("aria-expanded", "false");
            self._trigger("hidden");
        }

        self._resizeCaptionPane();
    }
});