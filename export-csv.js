/**
 * A small plugin for getting the CSV of a categorized chart v 1.0.3
 * https://github.com/highslide-software/export-csv
 * http://www.highcharts.com/plugin-registry/single/7/Export-CSV
 */
(function( Highcharts ) {

    Highcharts.Chart.prototype.downloadCSV = function( returnOutput ) {
        var titles = [],
            xValues = [],
            line,
            csv = "",
            col,
            options = (this.options.exporting || {}).csv || {},
            totalSeries = 0,
            xNeedsSorting = false,

            // Options
            dateFormat = options.dateFormat || '%Y-%m-%d %H:%M:%S',
            itemDelimiter = options.itemDelimiter || ',', // use ';' for direct import to Excel
            // We post the CSV to a simple PHP script that returns it with a content-type header as a
            // downloadable file.
            // The source code for the PHP script can be viewed at
            // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
            url = options.url || 'http://www.highcharts.com/studies/csv-export/csv.php',
            lineDelimiter = options.lineDelimeter || '\n';

        Highcharts.each(this.series, function( series, seriesNo ) {
            if ( series.options.includeInCSVExport === true ) return;
            if ( series.options.xAxis ) { // if option is set and not zero
                alert("Downloading charts as CSV with multiple axes is no supported, sorry.");
                throw false;
            }
            if ( titles.length === 0 ) {
                var xTitle = ((series.xAxis.options || {}).title || {}).text;

                if ( xTitle ) {
                    // series.xAxis.title.text exists and we use it
                } else if ( series.xAxis.isDatetimeAxis ) {
                    xTitle = 'DateTime';
                    xNeedsSorting = true;
                } else if ( series.xAxis.categories ) {
                    xTitle = 'Category';
                } else {
                    xTitle = 'X values';
                }
                titles.push(xTitle);
            }

            titles.push(series.name);
            totalSeries++;
        });

        Highcharts.each(this.series, function( series, seriesNo ) {
            if ( series.options.includeInCSVExport === true ) return;

            Highcharts.each(series.data, function( point ) {
                var l = xValues.length;
                while ( l-- ) {
                    if ( xValues[l].x === point.x ) {
                        xValues[l].y[seriesNo] = point.y;
                        return;
                    }
                }

                var y = new Array(totalSeries);
                y[-1] = point.x; // -1nth element holds formatted x axis value
                y[seriesNo] = point.y;

                if ( series.xAxis.isDatetimeAxis ) {
                    y[-1] = Highcharts.dateFormat(dateFormat, point.x);
                } else if ( series.xAxis.categories ) {
                    y[-1] = Highcharts.pick(series.xAxis.categories[point.x], point.x);
                }

                xValues.push({ x : point.x, y : y });
            })
        });

        if ( xNeedsSorting ) {
            xValues.sort(function( a, b ) {return a.x - b.x});
        }
        csv = titles.join(itemDelimiter) + lineDelimiter;
        Highcharts.each(xValues, function( values ) {
            line = [];
            for ( col = -1; col < values.y.length; col++ ) {
                line.push(values.y[col]);
            }
            csv += line.join(itemDelimiter) + lineDelimiter;
        });

        if ( returnOutput ) {
            return csv;
        } else {
            var title = ((this.title || {}).text || 'chart') + '.csv',
                a = document.createElement('a');

            if ( "download" in a ) { // modern browser - no need to use backend script
                a.href = 'data:attachment/csv,' + encodeURIComponent(csv);
                a.target = '_blank';
                a.download = title;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                Highcharts.post(url, { csv : csv, title : title });
            }
        }
    };

    Highcharts.Chart.prototype.getCSV = function() {
        return this.downloadCSV(true);
    };

    // Now we want to add "Download CSV" to the exporting menu. We post the CSV
    // to a simple PHP script that returns it with a content-type header as a
    // downloadable file.
    // The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
    if ( Highcharts.getOptions().exporting ) {
        Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
            text    : Highcharts.getOptions().lang.downloadCSV || "Download CSV",
            onclick : function() { this.downloadCSV() }
        });
    }
}(Highcharts));
