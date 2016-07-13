/*
* Rafflesia UI
* @version: 1.0.1
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
        this._setOptions({
            "paging": this.options.paging
        });

        this.element.hide();

        this._createComboBox();
        this._createDropDown();
        this._createAutoComplete();

        this._initSource();
        this._bindEvents();
    },

    _createComboBox: function () {
        this.button = $("<button>")
            .attr("type", "button")
            .addClass("ui-combobox");
        this.element.after(this.button);

        var captionPane = $("<div>")
            .addClass("ui-captionpane")
            .appendTo(this.button);

        this.toggleButton = $("<div>")
            .addClass("ui-togglebutton")
            .html("<span class=\"caret\"></span>")
            .appendTo(this.button);

        this.caption = $("<span>")
            .text(this._value())
            .appendTo(captionPane);

        this._resizeCaptionPane();
    },

    _createDropDown: function () {
        this.dropdown = $("<div>")
            .addClass("ui-dropdownmenu")
            .appendTo(this.document[0].body);

        this.searchBox = $("<input>")
            .attr("type", "text")
            .appendTo($("<div>")
            .addClass("ui-searchbox")
            .appendTo(this.dropdown));
    },

    _createAutoComplete: function () {
        var self = this;

        self.searchBox
            .autocomplete({
                appendTo: self.dropdown,
                delay: self.options.delay,
                minLength: self.options.minLength,
                source: self.options.source,

                open: function () {
                    self._positionDropDown();
                },
                close: function () {
                    self.pageIndex = -1;

                    if (this.value.length < self.options.minLength &&
                        self.options.minLengthMessage.length > 0) {
                        self._message(String.format(self.options.minLengthMessage, self.options.minLength));
                    }

                    self._positionDropDown();
                },
                focus: function (event, ui) {
                    return false;
                },
                select: function (event, ui) {
                    if (ui.item.state &&
                       (ui.item.state == "loading" || ui.item.state == "info")) {
                        return false;
                    }

                    self.button.attr("title", ui.item.label);
                    self.caption.text(ui.item.label);
                    self._value(ui.item.value);
                    self.hide();
                    self.button.focus();

                    self._trigger("change", event, ui);

                    return false;
                },
                search: function (event, ui) {
                    self.pageIndex = 1;

                    self.searchBox.autocomplete("widget").empty();
                },
                response: function (event, ui) {
                    self.searchBox.autocomplete("widget").find(".ui-autocomplete-info, .ui-autocomplete-loading").remove();

                    if (ui.content.length == 0 && self.pageIndex < 2) {
                        self._message(self.options.noResultsMessage);
                    }
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

    _destroy: function () {
        this.searchBox.autocomplete("destroy");

        this.searchBox.remove();
        this.dropdown.remove();
        this.caption.remove();
        this.toggleButton.remove();
        this.button.remove();

        this.element.show();
    },

    _bindEvents: function () {
        var self = this;

        self._on(self.button, {
            click: function () {
                if (self.dropdown.hasClass("open")) {
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

                if (self.dropdown.hasClass("open")) {
                    self._resizeDropDown();
                    self._positionDropDown();
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

    _positionDropDown: function () {
        var parent = this.button,
            parentSize = {
                height: parent.outerHeight(),
                width: parent.outerWidth()
            },
            dropDownSize = {
                height: this.dropdown.outerHeight(),
                width: this.dropdown.outerWidth()
            },
            windowSize = {
                height: $(window).height(),
                width: $(window).width()
            },
            bodySize = {
                height: $("body").height(),
                width: $("body").width()
            };

        var parentOffset = parent.offset();
        var parentPosition = {
            left: parentOffset.left,
            right: parentOffset.left + parentSize.width,
            top: parentOffset.top,
            bottom: parentOffset.top + parentSize.height
        };

        var myHorizontal = "left",
            atHorizontal = "left",
            myVertical = "top+1",
            atVertical = "bottom+1";

        if (parentPosition.left / windowSize.width > 0.25 &&
            parentPosition.right / windowSize.width > 0.75) {
            myHorizontal = "right";
            atHorizontal = "right";
        }

        var scrollTop = $(window).scrollTop();
        if (parentPosition.top > dropDownSize.height) {
            if ((Math.max(windowSize.height, bodySize.height) - parentPosition.bottom) < dropDownSize.height ||
               (parentPosition.bottom - scrollTop) / windowSize.height > 0.75) {
                myVertical = "bottom-1";
                atVertical = "top-1";
            }
        }

        this.dropdown
            .css({ top: "auto", left: "auto" })
            .position({
                of: parent,
                my: myHorizontal + " " + myVertical,
                at: atHorizontal + " " + atVertical,
                collision: "none"
            });
    },

    _resizeCaptionPane: function () {
        var captionPane = $(this.button).find('.ui-captionpane');

        this.caption.hide()
            .outerWidth(captionPane.innerWidth())
            .show();
    },

    _resizeDropDown: function () {
        var parent = this.button,
            parentWidth = parent.outerWidth();

        this.dropdown.outerWidth(parentWidth);
    },

    _resetTerm: function () {
        this.searchBox
            .autocomplete("close")
            .autocomplete("instance").term = null;

        this.searchBox.autocomplete("widget").empty();

        this.searchBox.val("");
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

        if (self.dropdown.hasClass("open")) {
            return;
        }

        var lostfocusMethod = function (evt) {
            var target = $(evt.target);
            if (target.closest(self.button).length || target.closest(self.dropdown).length) {
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

        if ('ontouchstart' in document.documentElement) {
            self.backdrop = $('<div>')
                .addClass("ui-dropdown-backdrop")
                .insertAfter(self.button)
                .on("click", function () {
                    self.hide();
                });
        }

        self._trigger("show");

        self._resetTerm();
        self._resizeDropDown();
        if (self.options.minLength <= 0) {
            self._positionDropDown();
            self.searchBox.autocomplete("search", "");
        } else {
            self._message(String.format(self.options.minLengthMessage, self.options.minLength));
            self._positionDropDown();
        }

        self.dropdown.addClass("open");
        self.button.attr("aria-expanded", "true");
        self.searchBox.focus();

        self._resizeCaptionPane();

        self._trigger("shown");
    },

    hide: function () {
        if (this.dropdown.hasClass("open")) {
            $(document).off(".combobox");

            this._trigger("hide");

            if (this.backdrop) {
                this.backdrop.remove();
                this.backdrop = null;
            }

            this.dropdown.removeClass("open");
            this.button.attr("aria-expanded", "false");
            this._trigger("hidden");
        }

        this._resizeCaptionPane();
    }
});