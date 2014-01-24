/**
 * A small plugin for getting the CSV of a categorized chart
 */
(function (Highcharts) {
    
    
    var each = Highcharts.each;
    var filename;
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
            lineDelimiter = options.lineDelimeter || '\n';

        filename = this.title.text;
        charttype = this.options.chart.type;

        each (this.series, function (series) {
            if (series.options.includeInCSVExport !== false) {
                if (series.xAxis && charttype != "pie") {
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
                    if (series.xAxis.axisTitle && series.xAxis.axisTitle.text)
                        xTitle = series.xAxis.axisTitle.text;
                    columns.push(xData);
                    columns[columns.length - 1].unshift(xTitle);
                } else if (charttype == "pie") {
                    xData = series.xData.slice();
                    xData = Highcharts.map(xData, function (x) {
                        return Highcharts.pick(series.data[x].name, x);
                    });
                    xTitle = series.name;
                    columns.push(xData);
                    columns[columns.length - 1].unshift(xTitle);
                }
                columns.push(series.yData.slice());
                columns[columns.length - 1].unshift(series.name);
            }
        });

        // Transform the columns to CSV
        var maxColLength = 0;
        for (var i = 0; i < columns.length; i++) {
            if (maxColLength < columns[i].length) {
                maxColLength = columns[i].length;
            }
        }
        for (row = 0; row < maxColLength; row++) {
            line = [];
            for (col = 0; col < columns.length; col++) {
                line.push(columns[col][row]);
            }
            csv += line.join(itemDelimiter) + lineDelimiter;
        }

        return csv;
    };

    // Now we want to add "Download CSV" to the exporting menu. We post the CSV
    // to a simple PHP script that returns it with a content-type header as a 
    // downloadable file.
    // The source code for the PHP script can be viewed at 
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
            onclick: function () {
                Highcharts.post('http://www.highcharts.com/studies/csv-export/csv.php', {
                    csv: this.getCSV(),
                    filename: filename
                });
            }
        });
    }
}(Highcharts));

