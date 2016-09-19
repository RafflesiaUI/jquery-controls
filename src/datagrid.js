/*
* Rafflesia UI
* @version: 1.0.0
* @author: GSLAI
* @copyright: Copyright (c) 2016 Rafflesia UI Foundation. All rights reserved.
* @license: Licensed under the MIT license.
*/

$.widget("rafflesia.datagrid", {
    options: {
        appendNewRow: false,
        editable: false,
        columns: [],
        source: [],

        headerRowStyles: null,
        rowStyles: null,
        insertRowStyles: null,
        editRowStyles: null,
        footerRowStyles: null,

        renderFooter: null
    },

    headers: [],
    footers: [],
    rows: [],
    selectedRow: null,
    editIndex: -1,

    _create: function () {
        this._setOptions({
            "columns": this.options.columns
        });

        this._renderHeader(this.options.columns);
        this._renderBody(this.options.columns, this.options.source);
        this._renderFooter(this.options.columns);

        this._bindEvents();
    },

    _bindEvents: function () {
        var self = this,
            suppressBlur = false;

        this._on(this.element, {
            "click tbody > tr": function (event) {
                var target = $(event.target);
                if (target.is("button")) {
                    return;
                }

                this._rowCommand("edit", event);
            },
            "click button[name=\"Delete\"]": function (event) {
                this._rowCommand("delete", event);
                event.preventDefault();
            },
            "focus tbody > tr": function (event) {
                var target = $(event.target);
                if (target.is("button")) {
                    return;
                }

                this._rowCommand("edit", event);
            },
            "comboboxshown tbody > tr": function () {
                suppressBlur = true;
            },
            "comboboxhidden tbody > tr": function () {
                suppressBlur = false;
            },
            "datepickershown tbody > tr": function () {
                suppressBlur = true;
            },
            "datepickerhidden tbody > tr": function () {
                suppressBlur = false;
            }
        });

        $(document).on("focusin.datagrid", function (event) {
            var target = $(event.target),
                tbody = $("tbody", self.element);

            if (target.closest(tbody).length) {
                return;
            }

            clearTimeout(self.rowBlur);
            self.rowBlur = self._delay(function () {
                if (!suppressBlur && self.editIndex !== -1) {
                    var row = self.rows.eq(self.editIndex);
                    self._rowCancel(self.editIndex, row);

                    if (self.options.editable && self.options.appendNewRow) {
                        var lastTr = self.element.find("tbody > tr:last"),
                            dataitem = lastTr.data("ui-datagrid-item");

                        if (dataitem !== null) {
                            var newRow = self.addRow(null);
                            index = this.rows.length;
                            self._rowEdit(event, index - 1, newRow);
                        }
                    }

                    self.refreshFooter();
                }
            }, 10);
        });
    },

    _destroy: function () {
        clearTimeout(this.rowBlur);

        $(document).off(".datagrid");

        this.element.empty();
    },

    _renderHeader: function (columns) {
        var headers = $.map(columns, function (column, index) {
            var th = $("<th>");

            if (column.headerStyles && column.headerStyles.length) {
                th.addClass(column.headerStyles);
            }

            if (typeof column.headerTemplate === "string") {
                th.text(column.headerTemplate);
            } else if (typeof column.headerTemplate === "function") {
                column.headerTemplate(th);
            }

            return th;
        });

        var tr = $("<tr>").appendTo($("<thead>").appendTo(this.element));
        if (this.options.headerRowStyles && this.options.headerRowStyles.length) {
            tr.addClass(this.options.headerRowStyles);
        }

        $.each(headers, function (index, header) {
            tr.append(header);
        });

        this.headers = this.element.find("thead > tr > th");
    },

    _renderBody: function (columns, source) {
        var self = this,
            rows = $.map(source, function (item, index) {
                return $("<tr>")
                    .uniqueId()
                    .attr("tabindex", 0)
                    .data("ui-datagrid-item", item);
            });

        this.tbody = $("<tbody>").appendTo(this.element);
        $.each(rows, function (index, tr) {
            var dataitem = tr.data("ui-datagrid-item");

            if (self.options.rowStyles && self.options.rowStyles.length) {
                tr.addClass(self.options.rowStyles);
            }

            self._renderRow(columns, tr, index, dataitem, $.rafflesia.uiView.readOnly);
            self.tbody.append(tr);
        });

        if (this.options.editable && this.options.appendNewRow) {
            this.addRow(null);
        }

        this.rows = this.element.find("tbody > tr");
    },

    _renderRow: function (columns, row, rowIndex, item, rowView) {
        row.empty();

        $.each(columns, function (index, column) {
            var td = $("<td>").appendTo(row);

            var styles = "",
                template = null;

            if (column.itemStyles && column.itemStyles.length) {
                styles = column.itemStyles;
            }

            var uiView = $.rafflesia.uiView;
            switch (rowView) {
                case uiView.edit:
                    if (column.editStyles && column.editStyles.length) {
                        styles += (" " + column.editStyles);
                    }

                    if (column.editTemplate) {
                        template = column.editTemplate;
                    } else if (column.dataBoundField && column.dataBoundField.length) {
                        template = (item ? item[column.dataBoundField] || "" : "");
                    } else {
                        template = column.itemTemplate;
                    }
                    break;
                default:
                    if (column.dataBoundField && column.dataBoundField.length) {
                        template = (item ? item[column.dataBoundField] || "" : "");
                    } else {
                        template = column.itemTemplate;
                    }
                    break;
            }

            if (styles && styles.length) {
                td.addClass(styles);
            }

            if (typeof template === "string") {
                td.text(template);
            } else if (typeof template === "function") {
                var ui = { index: index, rowIndex: rowIndex, item: item };
                template(td, ui);
            }
        });
    },

    _renderFooter: function (columns) {
        var tfoot = $("<tfoot>").appendTo(this.element);
        if (typeof this.options.renderFooter === "function") {
            this.options.renderFooter(tfoot);
        }

        var footers = $.map(columns, function (column, index) {
            var td = $("<td>");

            if (column.footerStyles && column.footerStyles.length) {
                td.addClass(column.footerStyles);
            }

            if (typeof column.footerTemplate === "string") {
                td.text(column.footerTemplate);
            } else if (typeof column.footerTemplate === "function") {
                column.footerTemplate(td);
            } else {
                return;
            }

            return td;
        });

        if (footers.length == 0) {
            return;
        }

        var tr = $("<tr>").appendTo(tfoot);
        if (this.options.footerRowStyles && this.options.footerRowStyles.length) {
            tr.addClass(this.options.footerRowStyles);
        }

        $.each(footers, function (index, footer) {
            tr.append(footer);
        });

        this.footers = this.element.find("tfoot > tr > td");
    },

    _rowCommand: function (command, event) {
        var self = this,
            target = $(event.target);
        if (!target.is("tr")) {
            target = target.closest("tr");
        }

        var currentIndex = this.rows.index(target);

        switch (command.toLowerCase()) {
            case "edit":
                this._rowEdit(event, currentIndex, target);
                break;
            case "cancel":
                this._rowCancel(currentIndex, target);
                break;
            case "delete":
                this._rowDelete(event, currentIndex, target);
                // reload the grid rows
                $.each(this.rows, function (index, row) {
                    var tr = $(row),
                        dataitem = tr.data("ui-datagrid-item");

                    tr.empty();
                    self._renderRow(self.options.columns, tr, index, dataitem, $.rafflesia.uiView.readOnly);
                });
                break;
            case "new":
                break;
            default:
                break;
        }

        if (this.options.editable && this.options.appendNewRow) {
            var lastTr = this.element.find("tbody > tr:last"),
                dataitem = lastTr.data("ui-datagrid-item");

            if (dataitem !== null) {
                this.addRow(null);
            }
        }

        this.rows = this.element.find("tbody > tr");

        this.refreshFooter();
    },

    _rowCancel: function (index, row) {
        if (!this.options.editable ||
            !row ||
            index !== this.editIndex) {
            return;
        }

        var cancelingui = { row: row, index: index };
        if (this._trigger("rowCancelling", event, cancelingui) === false) {
            return false;
        }

        if (this.options.editRowStyles && this.options.editRowStyles.length) {
            row.removeClass(this.options.editRowStyles);
        }
        row.attr("tabindex", 0);

        var dataitem = row.data("ui-datagrid-item");
        this._renderRow(this.options.columns, row, index, dataitem, $.rafflesia.uiView.readOnly);

        var canceledui = { row: row, item: dataitem };
        this._trigger("rowCancelled", event, canceledui);

        this.selectedRow = null;
        this.editIndex = -1;
    },

    _rowDelete: function (event, index, row) {
        if (!this.options.editable) {
            return;
        }

        var dataitem = row.data("ui-datagrid-item"),
                  ui = { row: row, index: index, item: dataitem };
        if (this._trigger("rowDeleting", event, ui) === false) {
            return false;
        }

        row.remove();
        if (this.editIndex == index) {
            this.editIndex = -1;
        }

        this._trigger("rowDeleted", event, ui);

        this.rows = this.element.find("tbody > tr");
    },

    _rowEdit: function (event, index, row) {
        if (!this.options.editable || this.editIndex == index) {
            return;
        }

        if (this.editIndex !== -1) {
            this.editIndex = this._getSelectedIndex();

            var canceRow = this.rows.eq(this.editIndex);
            if (this._rowCancel(this.editIndex, canceRow) === false) {
                return;
            }
        }

        index = this.rows.index(row);

        var editingui = { row: row, newEditIndex: index };
        if (this._trigger("rowEditing", event, editingui) === false) {
            return false;
        }

        row.removeAttr("tabindex");
        if (this.options.editRowStyles && this.options.editRowStyles.length) {
            row.addClass(this.options.editRowStyles);
        }

        var dataitem = row.data("ui-datagrid-item");
        this._renderRow(this.options.columns, row, index, dataitem, $.rafflesia.uiView.edit);

        this.selectedRow = row;
        this.editIndex = index;

        var editedui = { row: row, item: dataitem };
        this._trigger("rowEdited", event, editedui);
    },

    _getSelectedIndex: function () {
        if (!this.selectedRow) {
            return -1;
        }

        var selectedIndex = -1,
            selectedId = this.selectedRow.attr("id");
        $.each(this.rows, function (index, row) {
            if ($(row).attr("id") == selectedId) {
                selectedIndex = index;
                return true;
            }
        });
        return selectedIndex;
    },

    _setOption: function (key, value) {
        switch (key) {
            case "columns":
                var columns = [];
                if ($.isArray(value)) {
                    columns = $.map(value, function (column) {
                        return $.extend(
                            {},
                            {
                                headerTemplate: null,
                                headerStyles: null,
                                dataBoundField: null,
                                itemTemplate: null,
                                itemStyles: null,
                                editTemplate: null,
                                editStyles: null,
                                footerTemplate: null,
                                footerStyles: null
                            },
                            column);
                    });
                }
                this._super(key, columns);
                break;
            default:
                this._super(key, value);
                break;
        }
    },

    addRow: function (dataitem) {
        var tr = $("<tr>")
            .uniqueId()
            .attr("tabindex", 0)
            .data("ui-datagrid-item", dataitem);

        if (this.options.rowStyles && this.options.rowStyles.length) {
            tr.addClass(this.options.rowStyles);
        }

        var index = this.rows.length + 1;
        this._renderRow(this.options.columns, tr, index, dataitem, $.rafflesia.uiView.readOnly);
        this.tbody.append(tr);

        var ui = { row: tr, item: dataitem };
        this._trigger("rowCreated", null, ui);

        this.rows = this.element.find("tbody > tr");

        return tr;
    },

    deleteRow: function (row) {
        var self = this,
            index = self.rows.index(row);

        self._rowDelete(event, index, row);
        // reload the grid rows
        $.each(self.rows, function (index, row) {
            var tr = $(row),
                dataitem = tr.data("ui-datagrid-item");

            tr.empty();
            self._renderRow(self.options.columns, tr, index, dataitem, $.rafflesia.uiView.readOnly);
        });
    },

    editRow: function (row) {
        var index = this.rows.index(row);
        this._rowEdit(null, index, row);

        this.rows = this.element.find("tbody > tr");
    },

    items: function () {
        return $.map(this.rows, function (row, index) {
            var dataitem = $(row).data("ui-datagrid-item");
            if (dataitem) {
                return dataitem;
            }
            return;
        });
    },

    refreshFooter: function () {
        var footer = this.element.find("tfoot");
        footer.remove();

        this._renderFooter(this.options.columns);
    }
});