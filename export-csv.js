/**
 * A small plugin for getting the CSV of a rendered chart
 */
/*global Highcharts, document */
(function (Highcharts) {

    'use strict';

    var each = Highcharts.each,
        downloadAttrSupported = document.createElement('a').download !== undefined;


    Highcharts.Chart.prototype.getCSV = function () {
        var columns = [],
            line,
            csv = '',
            row,
            col,
            maxRows,
            options = (this.options.exporting || {}).csv || {},

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            itemDelimiter = options.itemDelimiter || ';', // use ';' for direct import to Excel
            lineDelimiter = options.lineDelimiter || '\n'; // '\n' isn't working with the js csv data extraction


        each(this.series, function (series) {
            if (series.options.includeInCSVExport !== false) {
                if (series.xAxis) {
                    var xData = series.xData.slice(),
                        xTitle = 'X values';
                    if (series.xAxis.isDatetimeAxis) {
                        xData = Highcharts.map(xData, function (x) {
                            return Highcharts.dateFormat(dateFormat, x);
                        });
                        xTitle = 'DateTime';
                    } else if (series.xAxis.categories) {
                        xData = Highcharts.map(xData, function (x) {
                            return Highcharts.pick(series.xAxis.categories[x], x);
                        });
                        xTitle = 'Category';
                    }
                    columns.push(xData);
                    columns[columns.length - 1].unshift(xTitle);
                }
                columns.push(series.yData.slice());
                columns[columns.length - 1].unshift(series.name);
            }
        });

        // Transform the columns to CSV
        maxRows = Math.max.apply(this, Highcharts.map(columns, function (col) { return col.length; }));
        for (row = 0; row < maxRows; row = row + 1) {
            line = [];
            for (col = 0; col < columns.length; col = col + 1) {
                line.push(columns[col][row]);
            }
            csv += line.join(itemDelimiter) + lineDelimiter;
        }

        return csv;
    };

    // Add "Download CSV" to the exporting menu. Use download attribute if supported, else
    // run a simple PHP script that returns a file. The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || 'Download CSV',
            onclick: function () {
                var a;

                // Download attribute supported
                if (downloadAttrSupported) {
                    // Client side extraction
                    a = document.createElement('a');
                    a.href        = 'data:attachment/csv,' + this.getCSV().replace(/\n/g, '%0A');
                    a.target      = '_blank';
                    a.download    = (this.title ? this.title.textStr.replace(/ /g, '-').toLowerCase() : 'chart') + '.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                // Fall back to server side handling
                } else {
                    Highcharts.post('http://www.highcharts.com/studies/csv-export/csv.php', {
                        csv: this.getCSV()
                    });
                }

            }
        });
    }
}(Highcharts));
