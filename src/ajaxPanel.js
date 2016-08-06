/*
* Rafflesia UI
* @version: 1.0.0
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.widget("rafflesia.ajaxPanel", {
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