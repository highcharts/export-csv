/**
 * A Highcharts plugin for exporting data from a rendered chart as CSV, XLS or HTML table
 *
 * Author:   Torstein Honsi
 * Licence:  MIT
 * Version:  1.3.1
 */
/*global Highcharts, window, document, Blob */
(function (Highcharts) {

    'use strict';

    var each = Highcharts.each,
        downloadAttrSupported = document.createElement('a').download !== undefined;


    /**
     * Get the data rows as a two dimensional array
     */
    Highcharts.Chart.prototype.getDataRows = function () {
        var options = (this.options.exporting || {}).csv || {},
            xAxis = this.xAxis[0],
            rows = {},
            rowArr = [],
            dataRows,
            names = [],
            i,
            x,

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S';

        // Loop the series and index values
        i = 0;		
		this.series.sort(function (a,b) {
			return a.options.legendIndex - b.options.legendIndex
		});
        each(this.series, function (series) {
            if (series.options.includeInCSVExport !== false) {
                names.push(series.name);
                each(series.points, function (point) {
                    if (!rows[point.x]) {
                        rows[point.x] = [];
                    }
                    rows[point.x].x = point.x;

                    // Pies, funnels etc. use point name in X row
                    if (!series.xAxis) {
                        rows[point.x].name = point.name;
                    }

                    rows[point.x][i] = point.y;
                });
                i += 1;
            }
        });

        // Make a sortable array
        for (x in rows) {
            if (rows.hasOwnProperty(x)) {
                rowArr.push(rows[x]);
            }
        }
        // Sort it by X values
        rowArr.sort(function (a, b) {
			return a.x - b.x;
        });

        // Add header row
        dataRows = [[xAxis.isDatetimeAxis ? 'DateTime' : 'Category'].concat(names)];

        // Transform the rows to CSV
        each(rowArr, function (row) {

            // Add the X/date/category
            row.unshift(row.name || (xAxis.isDatetimeAxis ? Highcharts.dateFormat(dateFormat, row.x) : xAxis.categories ? Highcharts.pick(xAxis.categories[row.x], row.x) : row.x));
            dataRows.push(row);
        });

        return dataRows;
    };

    /**
     * Get a CSV string
     */
    Highcharts.Chart.prototype.getCSV = function (useLocalDecimalPoint) {
        var csv = '',
            rows = this.getDataRows(),
            options = (this.options.exporting || {}).csv || {},
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            lineDelimiter = options.lineDelimiter || '\n'; // '\n' isn't working with the js csv data extraction

        // Transform the rows to CSV
        each(rows, function (row, i) {
            var val = '',
                j = row.length,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';
            while (j--) {
                val = row[j];
                if (typeof val === "string") {
                    val = '"' + val + '"';
                }
                if (typeof val === 'number') {
                    if (n === ',') {
                        val = val.toString().replace(".", ",");
                    }
                }
                row[j] = val;
            }
            // Add the values
            csv += row.join(itemDelimiter);

            // Add the line delimiter
            if (i < rows.length - 1) {
                csv += lineDelimiter;
            }
        });
        return csv;
    };

    /**
     * Build a HTML table with the data
     */
    Highcharts.Chart.prototype.getTable = function (useLocalDecimalPoint) {
        var html = '<table>',
            rows = this.getDataRows();

        // Transform the rows to HTML
        each(rows, function (row, i) {
            var tag = i ? 'td' : 'th',
                val,
                j,
                n = useLocalDecimalPoint ? (1.1).toLocaleString()[1] : '.';

            html += '<tr>';
            for (j = 0; j < row.length; j++) {
                val = row[j];
                // Add the cell
                if (typeof val === 'number') {
                    if (n === ',') {
                        html += '<' + tag + (typeof val === 'number' ? ' class="number"' : '') + '>' + val.toString().replace(".", ",") + '</' + tag + '>';
                    } else {
                        html += '<' + tag + (typeof val === 'number' ? ' class="number"' : '') + '>' + val.toString() + '</' + tag + '>';
                    }
                } else {
                    html += '<' + tag + '>' + val + '</' + tag + '>';
                }
            }

            html += '</tr>';
        });
        html += '</table>';
        return html;
    };

    function getContent(chart, href, extention, content, MIME) {
        var a,
            blobObject,
            name = (chart.title ? chart.title.textStr.replace(/ /g, '-').toLowerCase() : 'chart'),
            options = (chart.options.exporting || {}).csv || {},
            url = options.url || 'http://www.highcharts.com/studies/csv-export/download.php';

        // Download attribute supported
        if (downloadAttrSupported) {
            a = document.createElement('a');
            a.href = href;
            a.target      = '_blank';
            a.download    = name + '.' + extention;
            document.body.appendChild(a);
            a.click();
            a.remove();

        } else if (window.Blob && window.navigator.msSaveOrOpenBlob) {
            // Falls to msSaveOrOpenBlob if download attribute is not supported
            blobObject = new Blob([content]);
            window.navigator.msSaveOrOpenBlob(blobObject, name + '.' + extention);

        } else {
            // Fall back to server side handling
            Highcharts.post(url, {
                data: content,
                type: MIME,
                extension: extention
            });
        }
    }

    // Add "Download CSV" to the exporting menu. Use download attribute if supported, else
    // run a simple PHP script that returns a file. The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || 'Download CSV',
            onclick: function () {
                var csv = this.getCSV(true);
                getContent(
                    this,
                    'data:text/csv,' + csv.replace(/\n/g, '%0A'),
                    'csv',
                    csv,
                    'text/csv'
                );
            }

        }, {
            text: Highcharts.getOptions().lang.downloadXLS || 'Download XLS',
            onclick: function () {
                var uri = 'data:application/vnd.ms-excel;base64,',
                    template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
                        '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
                        '<x:Name>Ark1</x:Name>' +
                        '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
                        '<style>td{border:none;font-family: Calibri, sans-serif;} .number{mso-number-format:"0.00";}</style>' +
                        '<meta name=ProgId content=Excel.Sheet>' +
                        '</head><body>' +
                        this.getTable(true) +
                        '</body></html>',
                    base64 = function (s) { return window.btoa(decodeURIComponent(encodeURIComponent(s))); };
                getContent(
                    this,
                    uri + base64(template),
                    'xls',
                    template,
                    'application/vnd.ms-excel'
                );
            }
        });
    }
}(Highcharts));
