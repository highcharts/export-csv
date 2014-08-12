/**
 * A small plugin for getting the CSV of a categorized chart
 */
(function (Highcharts) {
    
    
    var each = Highcharts.each;
    Highcharts.Chart.prototype.getCSV = function () {
        var columns = [],
            line,
            tempLine,
            csv = "", 
            row,
            col,
            options = (this.options.exporting || {}).csv || {},

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            lineDelimiter = options.lineDelimeter || "%0A";

        each (this.series, function (series) {
            if (series.options.includeInCSVExport !== false) {
                if (series.xAxis) {
                    var xData = series.xData.slice(),
                        xTitle = 'X values';
                    if (series.xAxis.isDatetimeAxis) {
                        xData = Highcharts.map(xData, function (x) {
                            return Highcharts.dateFormat(dateFormat, x)
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
        for (row = 0; row < columns[0].length; row++) {
            line = [];
            for (col = 0; col < columns.length; col++) {
                line.push(columns[col][row]);
            }
            csv += line.join(itemDelimiter) + lineDelimiter;
        }

        return csv;
    };

    // Now we want to add "Download CSV" to the exporting menu.
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
            onclick: function () {
                // http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
                var title = ((this.title || {}).text || 'chart') + '.csv',
                    a = document.createElement('a');

                if ("download" in a) { // modern browser - no need to use backend script
                    a.href = 'data:attachment/csv,' + encodeURIComponent(csv);
                    a.target = '_blank';
                    a.download = title;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    Highcharts.post(url, {
                        csv: csv,
                        title: title
                    });
                }
            }
        });
    }
}(Highcharts));

