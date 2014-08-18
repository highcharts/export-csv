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
            maxRows,
            options = (this.options.exporting || {}).csv || {},

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            lineDelimiter = options.lineDelimiter || '\n';

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
        maxRows = Math.max.apply(this, Highcharts.map(columns, function (col) { return col.length; }));
        for (row = 0; row < maxRows; row++) {
            line = [];
            for (col = 0; col < columns.length; col++) {
                line.push(columns[col][row]);
            }
            csv += line.join(itemDelimiter) + lineDelimiter;
        }

        return csv;
    };

    // Now we want to add "Download CSV" to the exporting menu.
    // If supported by the browser we use the download attribute
    // on an anchor element to tell the browser to return the url
    // data as a downloadable file.
    // If the download attribute is not supported we post the CSV
    // to a simple PHP script that returns it with a content-type
    // header as a downloadable file.
    // The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
            onclick: function () {
                // http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
                var title = ((this.title || {}).text || 'chart') + '.csv',
                    a = document.createElement('a');

                if ("download" in a) { // modern browser - no need to use backend script
                    a.href = 'data:text/csv;charset=UTF-8,' + encodeURIComponent(csv);
                    a.target = '_blank';
                    a.download = title;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    Highcharts.post('http://www.highcharts.com/studies/csv-export/csv.php', {
                        csv: this.getCSV(),
                        title: title
                    });
                }
            }
        });
    }
}(Highcharts));

