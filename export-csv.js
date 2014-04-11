/**
 * A small plugin for getting the CSV of a categorized chart
 */
 (function (Highcharts) {
    
    
    var each = Highcharts.each;
    Highcharts.Chart.prototype.downloadCSV = function ( returnOutput ) {
        var columns = [],
            line,
            csv = "",
            row,
            col,
            options = (this.options.exporting || {}).csv || {},

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            // We post the CSV to a simple PHP script that returns it with a content-type header as a
            // downloadable file.
            // The source code for the PHP script can be viewed at
            // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
            url = options.url || 'http://www.highcharts.com/studies/csv-export/csv.php',
            lineDelimiter = options.lineDelimeter || '\n';

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
        
	if ( returnOutput ) {
            return csv;
	} else {
            Highcharts.post(url, { csv : csv });
	}
    };
    
    Highcharts.Chart.prototype.getCSV = function () {
	return this.downloadCSV(true);
    }

    // Now we want to add "Download CSV" to the exporting menu. We post the CSV
    // to a simple PHP script that returns it with a content-type header as a 
    // downloadable file.
    // The source code for the PHP script can be viewed at 
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if (Highcharts.getOptions().exporting) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
            onclick : function () { this.downloadCSV() }
        });
    }
}(Highcharts));
