$.widget("rafflesia.combobox", {
    _create: function () {
        var self = this;

        self.element.hide();
        self._createComboBox();
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

    _refresh: function() {
    },

    _destroy: function () {
        var self = this;

        self.caption.remove();
        self.toggleButton.remove();
        self.button.remove();

        self.element.show();
    },

    _bindEvents: function () {
        var self = this;

        $(window).on("resize", function () {
            self._resizeCaptionPane();
        });
    },

    _resizeCaptionPane: function () {
        var self = this,
            captionPane = $('.ui-captionPane', self.button);

        self.caption
            .hide()
            .width(captionPane.width())
            .show();
    }
});
