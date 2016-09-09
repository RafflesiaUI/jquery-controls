/*
* Rafflesia UI
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

/* ========================================================================
 * Rafflesia: core.js v1.0.2
 * ======================================================================== */
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

/* ========================================================================
 * Rafflesia: ajaxpanel.js v1.0.0
 * ======================================================================== */
$.widget("rafflesia.ajaxpanel", {
    version: "1.0.0",
    options: {
        autoLoad: true,
        appendTo: null,
        source: null,

        noResultsMessage: "No results match",

        renderDataItem: null
    },

    pending: 0,
    requestIndex: 0,

    _appendTo: function () {
        var container = this.element;
        if (this.options.appendTo) {
            container = $(this.options.appendTo, this.element);
        }
        return container;
    },

    _create: function () {
        this._initSource();

        if (this.options.autoLoad) {
            this.load(null);
        }
    },

    _initSource: function () {
        var url,
			self = this;

        if (typeof this.options.source === "string") {
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
            case "source":
                this._initSource();
                break;
        }
    },

    _response: function () {
        var index = ++this.requestIndex;

        return $.proxy(function (content) {
            if (index === this.requestIndex) {
                this.__response(content);
            }

            this.pending--;
            if (!this.pending) {

            }
        }, this);
    },

    __response: function (content) {
        var container = this._appendTo();

        this.element.removeClass("ui-state-loading");
        this._trigger("response");

        if (this.cancelSearch) {
            return;
        }

        this._appendTo().empty();

        if (content && content.length) {
            this._suggest(content);
        }
        else if (this.options.noResultsMessage) {
            container.append(this.options.noResultsMessage);
        }
    },

    _suggest: function (items) {
        var container = this._appendTo(),
            renderDataItem = this.options.renderDataItem;

        if (typeof renderDataItem === "function") {
            $.each(items, function (index, item) {
                renderDataItem(container, item);
            });
        }
    },

    load: function (request) {
        this.pending++;
        this.cancelSearch = false;

        this.element.addClass("ui-state-loading");
        this._trigger("beforeLoad");

        this.source(request, this._response());
    }
});

/* ========================================================================
 * Rafflesia: combobox.js v1.0.8
 * ======================================================================== */
$.widget("rafflesia.combobox", {
    version: "1.0.8",
    defaultElement: "<input>",
    options: {
        enableClear: false,
        enableSearch: true,
        delay: 300,
        disabled: false,
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
    pending: 0,
    requestIndex: 0,
    selectedItems: [],

    _create: function () {
        this.element.hide();

        if (this._isSelectElement()) {
            this.selectedItems = this._getSelectItems();
        }

        this._createComboBox();
        this._createDropDown();

        this._bindEvents();

        this._setOptions({
            "enableClear": this.options.enableClear,
            "enableSearch": this.options.enableSearch,
            "disabled": this.options.disabled,
            "paging": this.options.paging,
            "source": this.options.source
        });

        var value = this._value();
        if (value && value.length) {
            var label = this._getLabelFromArray(value);
            this._label(label);
        } else {
            this._label();
        }

        this._resizeCaptionPane();
    },

    _createComboBox: function () {
        this.button = $("<button>")
            .attr("type", "button")
            .attr("title", "")
            .addClass("ui-combobox");
        this.element.after(this.button);

        var captionPane = $("<div>")
            .addClass("ui-captionpane")
            .appendTo(this.button);

        this.clearButton = $("<div>")
            .addClass("ui-clearbutton")
            .html("<a href='#'>&times;</a>")
            .appendTo(this.button);

        this.toggleButton = $("<div>")
            .addClass("ui-togglebutton")
            .html("<span class=\"caret\"></span>")
            .appendTo(this.button);

        this.caption = $("<span>")
            .appendTo(captionPane);
    },

    _createDropDown: function () {
        this.dropdown = $("<div>")
            .addClass("ui-combobox-menu")
            .appendTo(this.document[0].body);

        this.searchBox = $("<input>")
            .attr("type", "text")
            .attr("autocomplete", "off")
            .appendTo($("<div>")
            .addClass("ui-searchbox")
            .appendTo(this.dropdown));

        this.dropdownList = $("<ul>")
            .attr("tabIndex", 0)
			.appendTo(this.dropdown)
    },

    _allowClear: function () {
        if (!this.options.enableClear) {
            return false;
        }

        if (!this._isSelectElement()) {
            return true;
        }

        var emptyOptions = $.grep(this.selectedItems, function (item) {
            return !item.value || (item.value.length == 0);
        });
        return emptyOptions && emptyOptions.length;
    },

    _allowPaging: function () {
        return (this.options.paging && this.options.paging.pageSize > 0);
    },

    _bindEvents: function () {
        var suppressInput;

        this._on(this.button, {
            keydown: function (event) {
                if ('ontouchstart' in document.documentElement) {
                    return true;
                }

                if (this.dropdown.hasClass("open")) {
                    return true;
                }

                var keyCode = $.rafflesia.keyCode;
                switch (event.keyCode) {
                    case keyCode.ALT:
                    case keyCode.BACKSPACE:
                    case keyCode.CAPSLOCK:
                    case keyCode.CTRL:
                    case keyCode.DELETE:
                    case keyCode.DOWN:
                    case keyCode.END:
                    case keyCode.ESCAPE:
                    case keyCode.INSERT:
                    case keyCode.LEFT:
                    case keyCode.NUMLOCK:
                    case keyCode.PAGE_DOWN:
                    case keyCode.PAGE_UP:
                    case keyCode.PAUSE:
                    case keyCode.PERIOD:
                    case keyCode.RIGHT:
                    case keyCode.SCROLLLOCK:
                    case keyCode.SHIFT:
                    case keyCode.TAB:
                    case keyCode.UP:
                        break;

                    default:
                        this.show();
                        break;
                }
            },
            click: function () {
                if (this.dropdown.hasClass("open")) {
                    this.hide();
                } else {
                    this.show();
                }

                return false;
            }
        });

        this._on(this.clearButton, {
            click: function () {
                this.hide();
                this._clear();

                return false;
            },
            keydown: function (event) {
                var keyCode = $.rafflesia.keyCode;
                switch (event.keyCode) {
                    case keyCode.ENTER:
                        this.hide();
                        this._clear();
                        return false;
                        break;
                }
            }
        });

        this._on(window, {
            resize: function () {
                this._resizeCaptionPane();

                if (this.dropdown.hasClass("open")) {
                    this._resizeDropDown();
                    this._positionDropDown();
                }
            }
        });

        this._on(this.searchBox, {
            keydown: function (event) {
                suppressInput = false;

                var keyCode = $.rafflesia.keyCode;
                switch (event.keyCode) {
                    case keyCode.PAGE_DOWN:
                    case keyCode.DOWN:
                    case keyCode.RIGHT:
                    case keyCode.TAB:
                        this._focus();
                        event.preventDefault();
                        break;

                    case keyCode.ESCAPE:
                        this.hide();
                        this.button.focus();
                        break;

                    case keyCode.ENTER:
                        this._searchTimeout(event, 0);
                        break;

                    default:
                        this._searchTimeout(event, this.options.delay);
                        break;
                }
            },
            input: function (event) {
                if (suppressInput) {
                    suppressInput = false;
                    event.preventDefault();
                    return;
                }
                this._searchTimeout(event, this.options.delay);
            }
        });

        this._on(this.dropdownList, {
            "mousedown .ui-combobox-menu-item": function (event) {
                event.preventDefault();
            },
            "mouseenter .ui-combobox-menu-item": function (event) {
                var target = $(event.target);
                if (!target.is(".ui-combobox-menu-item")) {
                    target = target.closest(".ui-combobox-menu-item");
                }

                if (target.not(".ui-state-loading, .ui-state-info").length) {
                    this._focus(target);
                }
            },
            "click .ui-combobox-menu-item": function (event) {
                var target = $(event.target);
                if (!target.is(".ui-combobox-menu-item")) {
                    target = target.closest(".ui-combobox-menu-item");
                }

                if (target.not(".ui-state-loading, .ui-state-info").length) {
                    var item = target.data("ui-combobox-item");
                    this._change(event, { item: item });
                }
                event.preventDefault();
            },
            "keydown .ui-combobox-menu-item": function (event) {
                var target = $(event.target);
                if (!target.is(".ui-combobox-menu-item")) {
                    target = target.closest(".ui-combobox-menu-item");
                }

                if (target.not(".ui-state-loading, .ui-state-info").length) {
                    var keyCode = $.rafflesia.keyCode;
                    switch (event.keyCode) {
                        case keyCode.PAGE_UP:
                        case keyCode.UP:
                        case keyCode.LEFT:
                            this._move("prev");
                            event.preventDefault();
                            break;

                        case keyCode.PAGE_DOWN:
                        case keyCode.DOWN:
                        case keyCode.RIGHT:
                            this._move("next");
                            event.preventDefault();
                            break;

                        case keyCode.ENTER:
                            var item = target.data("ui-combobox-item");
                            this._change(event, { item: item });
                            event.preventDefault();
                            break;
                    }
                }
            },
            scroll: function (event) {
                if (this.pending || !this._allowPaging()) {
                    return;
                }

                var target = $(event.currentTarget),
                    scrollHeight = target[0].scrollHeight,
                    scrollTop = target.scrollTop(),
                    outerHeight = target.outerHeight();

                if (this.pageIndex > 0 &&
                    scrollTop > 0 &&
                    scrollHeight - scrollTop > outerHeight - 25) {
                    this._search(this.term);
                }
            },
            keydown: function (event) {
                var keyCode = $.rafflesia.keyCode;
                switch (event.keyCode) {
                    case keyCode.TAB:
                        event.preventDefault();

                    case keyCode.ESCAPE:
                        this.hide();
                        this.button.focus();
                        break;

                    case keyCode.ENTER:
                        var target = $(event.target).closest("li"),
                            item = target.data("ui-combobox-item");
                        if (target.not(".ui-state-loading, .ui-state-info")) {
                            event.preventDefault();
                            this._change(event, { item: item });
                        }
                        break;
                }
            }
        });
    },

    _clear: function (event) {
        if (this._allowClear()) {
            this._change(event, { item: { value: "", label: "" } });
        }
    },

    _clearList: function () {
        this.dropdownList.empty()
    },

    _change: function (event, ui) {
        var previous = this._value(),
            value = ui.item.value;

        if (value !== previous) {
            if (this._trigger("changing", event, ui) === false) {
                return;
            }
        }

        if (value && value.length) {
            this._label(ui.item.label);
            this._value(value);
        } else {
            this._label();
            this._value("");
        }

        this.hide();
        this.button.focus();

        if (value !== previous) {
            this._trigger("change", event, ui);
        }
    },

    _destroy: function () {
        clearTimeout(this.searching);

        this.dropdownList.remove();
        this.searchBox.remove();
        this.dropdown.remove();
        this.caption.remove();
        this.clearButton.remove();
        this.toggleButton.remove();
        this.button.remove();

        this.element.show();
    },

    _focus: function (target) {
        if (target && target.length) {
            if (!target.hasClass("ui-state-focus")) {
                this.dropdownList.find(".ui-state-focus").removeClass("ui-state-focus");
                target.addClass("ui-state-focus");
                target.focus();
            }
            return;
        }

        var active = this.dropdownList.find(".ui-state-focus");
        if (active && active.length) {
            active.focus();
            return;
        }

        target = this.dropdownList.find("li:not(.ui-state-loading, .ui-state-info)").first();
        target.addClass("ui-state-focus");
        target.focus();
    },

    _getLabelFromArray: function (value) {
        if (value && value.length) {
            if ($.isArray(this.options.source)) {
                var selectedItem = $.grep(this.options.source, function (item) {
                    return item["value"] == value;
                });

                if (selectedItem && selectedItem.length) {
                    return selectedItem[0]["label"];
                }
            }
        }
        return value;
    },

    _getSelectItems: function () {
        var options = $(this.element).find("option");
        return $.map(options, function (option) {
            return {
                label: option.text,
                value: option.value
            };
        });
    },

    _initSource: function () {
        var array, url,
			self = this;

        if (this._isSelectElement()) {
            if (this.options.enableClear) {
                this.options.source = this.selectedItems.filter(function (item) {
                    return (item.value && item.value.length);
                });
            } else {
                this.options.source = this.selectedItems;
            }
        }

        if ($.isArray(this.options.source)) {
            array = this.options.source;
            this.source = function (request, response) {
                var data = $.rafflesia.combobox.filter(array, request.term);
                if (self._allowPaging()) {
                    data = data.slice(request.skip, request.skip + request.take);
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

    _isSelectElement: function () {
        return (this.element[0].nodeName.toLowerCase() == "select");
    },

    _label: function (label) {
        this.button.attr("title", "");
        this.caption
            .addClass("ui-placeholder")
            .text(this._placeholder());
        this.clearButton.removeClass("display");

        if (label && label.length) {
            this.button.attr("title", label);
            this.caption
                .removeClass("ui-placeholder")
                .text(label);

            if (this._allowClear()) {
                this.clearButton.addClass("display");
            }
        }
    },

    _message: function (message, params) {
        this._clearList();

        $("<li>")
            .addClass("ui-state-info")
            .html(String.format(message, params))
            .appendTo(this.dropdownList);
    },

    _move: function (direction) {
        var target;

        if (direction == "first") {
            target = this.dropdownList.children().first();
            this._focus(target);
            return;
        }

        var active = this.dropdownList.find(".ui-state-focus");
        if (active && active.length) {
            switch (direction) {
                case "next":
                    target = active.next(":not(.ui-state-loading, .ui-state-info)");
                    break;
                case "prev":
                    target = active.prev(":not(.ui-state-loading, .ui-state-info)");
                    break;
            }
        }

        if (target && target.length) {
            this._focus(target);
        }
    },

    _normalize: function (items) {
        if (typeof this.options.normalizeDataItems === "function") {
            return this.options.normalizeDataItems(items);
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
    },

    _placeholder: function () {
        return this.element.attr("placeholder") || "";
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

    _renderMenu: function (ul, items) {
        var self = this;
        $.each(items, function (index, item) {
            self._renderItemData(ul, item);
        });
    },

    _renderItemData: function (ul, item) {
        return this._renderItem(ul, item)
            .data("ui-combobox-item", item);
    },

    _renderItem: function (ul, item) {
        var li = $("<li>");

        if (typeof this.options.renderDataItem === "function") {
            this.options.renderDataItem(li, item);
        } else {
            li.append($("<p>").text(item.label));
        }

        return li.appendTo(ul);
    },

    _resetTerm: function () {
        this.term = null;
        this._clearList();
        this.searchBox.val("");
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

    _response: function () {
        var index = ++this.requestIndex;

        return $.proxy(function (content) {
            if (index === this.requestIndex) {
                this.__response(content);
            }

            this.pending--;
            if (!this.pending) {
                this.dropdownList.find(".ui-state-loading").remove();
            }
        }, this);
    },

    __response: function (content) {
        if (content) {
            content = this._normalize(content);
        }

        this._trigger("response", null, { content: content });

        this.dropdownList.find(".ui-state-info, .ui-state-loading").remove();

        if (this.options.disabled || this.cancelSearch) {
            return;
        }

        if (content && content.length) {
            this._suggest(content);
        } else if (this._allowPaging() && this.pageIndex > 1) {
            this.pageIndex = -1;
        } else if (this.pageIndex <= 1) {
            this._message(this.options.noResultsMessage);
        }

        if ('ontouchstart' in document.documentElement) {
            this.dropdownList.focus();
        }
        this._positionDropDown();
    },

    _search: function (value) {
        this.pending++;
        this.cancelSearch = false;

        this._spinner();
        this._positionDropDown();

        var request = { term: value };
        if (this._allowPaging()) {
            request = $.extend({
                skip: (this.pageIndex - 1) * this.options.paging.pageSize,
                take: this.options.paging.pageSize
            }, request);
        }
        this.source(request, this._response());
    },

    _searchTimeout: function (event, delay) {
        clearTimeout(this.searching);

        this.searching = this._delay(function () {
            var equalValues = this.term === this.searchBox.val(),
				dropdownVisible = this.dropdown.hasClass("open"),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

            if (!equalValues || (equalValues && !dropdownVisible && !modifierKey)) {
                this.search(null, event);
            }
        }, delay);
    },

    _setOption: function (key, value) {
        switch (key) {
            case "enableClear":
                var selectedValue = this._value();
                if (this._allowClear() && selectedValue && selectedValue.length) {
                    this.clearButton.addClass("display");
                } else {
                    this.clearButton.removeClass("display");
                }

                if (this._isSelectElement()) {
                    this._initSource();
                }
                this._super(key, value);
                break;

            case "enableSearch":
                var div = $("div.ui-searchbox", this.dropdown);
                if (value) {
                    div.show();
                } else {
                    div.hide();
                }

                this._super(key, value);
                break;

            case "disabled":
                if (value && this.xhr) {
                    this.xhr.abort();
                }

                if (value) {
                    this.button.attr("disabled", true);
                } else {
                    this.button.removeAttr("disabled");
                }

                this._super(key, value);
                break;

            case "source":
                if (this._isSelectElement()) {
                    return;
                }

                this.options.source = value;
                this._initSource();
                break;

            case "paging":
                if (this.options.paging) {
                    var defaults = {
                        pageSize: 15
                    };
                    this.options.paging = $.extend({}, defaults, this.options.paging);
                }

                this._super(key, value);
                break;

            default:
                this._super(key, value);
                break;
        }
    },

    _spinner: function () {
        this.dropdownList.find(".ui-state-info, .ui-state-loading")
            .remove();

        $("<li>")
            .addClass("ui-state-loading")
            .html(this.options.loadingMessage)
            .appendTo(this.dropdownList);
    },

    _suggest: function (items) {
        if (this._allowPaging()) {
            if (items.length === 0 ||
                items.length < this.options.paging.pageSize) {
                this.pageIndex = -1;
            } else {
                this.pageIndex++;
            }
        } else {
            this._clearList();
        }

        this._renderMenu(this.dropdownList, items);
        $.each(this.dropdownList.children(), function (index, item) {
            $(item).addClass("ui-combobox-menu-item").attr("tabindex", -1);
        });
    },

    _value: function (value) {
        if (value) {
            this.element.val(value);
            return;
        }

        return this.element.val();
    },

    focus: function () {
        this.button.focus();
    },

    search: function (value, event) {
        value = value != null ? value : this.searchBox.val();

        this.term = this.searchBox.val();

        if (value.length < this.options.minLength) {
            this.cancelSearch = true;

            this._message(this.options.minLengthMessage, this.options.minLength);
            this._positionDropDown();
            return;
        }

        if (this._trigger("search", event) === false) {
            return;
        }

        this.pageIndex = 1;
        this._clearList();

        return this._search(value);
    },

    show: function () {
        var self = this,
            isTouchDevice = ('ontouchstart' in document.documentElement);

        if (this.options.disabled || this.dropdown.hasClass("open")) {
            return;
        }

        var lostfocusMethod = function (evt) {
            var target = $(evt.target);
            if (target.closest(self.button).length || target.closest(self.dropdown).length) {
                return;
            }

            self.hide();
        };

        $(document)
          .on("mousedown.combobox", lostfocusMethod)
          .on("touchend.combobox", lostfocusMethod)
          .on("click.combobox", "[data-toggle=dropdown]", lostfocusMethod)
          .on("focusin.combobox", lostfocusMethod);

        if (isTouchDevice) {
            this.backdrop = $('<div>')
                .addClass("ui-combobox-backdrop")
                .insertAfter(this.button)
                .on("click", function () {
                    self.hide();
                });
        }

        this._trigger("show");
        this._resetTerm();
        this._resizeDropDown();

        if (this.options.minLength <= 0) {
            this._positionDropDown();
            this.search("");
        } else {
            this.cancelSearch = true;
            if (this.xhr) {
                this.xhr.abort();
            }

            this._message(self.options.minLengthMessage, self.options.minLength);
            this._positionDropDown();
        }

        this.dropdown.addClass("open");
        this.button.attr("aria-expanded", "true");

        if (this.options.enableSearch) {
            this.searchBox.focus();
        } else if (!isTouchDevice) {
            this._move("first");
        }

        this._resizeCaptionPane();
        this._trigger("shown");
    },

    hide: function () {
        this.cancelSearch = true;
        if (this.xhr) {
            this.xhr.abort();
        }

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
    },

    value: function (value) {
        if (!value) {
            // Get
            return this._value();
        }

        // Set
        var previous = this._value();
        if (value !== previous) {
            var label = (value.length) ? this._getLabelFromArray(value) : null,
                item = { item: { label: label, value: value } };

            if (this._trigger("changing", null, item) === false) {
                return;
            }

            this._value(value);
            this._label(label);
            this._resizeCaptionPane();

            this._trigger("change", null, item);
        }
    }
});

$.extend($.rafflesia.combobox, {
    escapeRegex: function (value) {
        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    },
    filter: function (array, term) {
        var matcher = new RegExp($.rafflesia.combobox.escapeRegex(term), "i");
        return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
        });
    }
});

/* ========================================================================
 * Rafflesia: datepicker.js v1.0.1
 * ======================================================================== */
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