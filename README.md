export-csv
==========
This plugin allows the user to export the chart data to various formats and views.

# Deprecation notice
Given the popularity of this plugin, it has been taken in as a Highcharts module since v5.0.11 (2017-05-04), and
development will continue in the [official Highcharts repo](https://github.com/highcharts/highcharts/). This
means it can be loaded from [code.highcharts.com](https://code.highcharts.com/modules/export-data.js) and 
is available with the [Highcharts npm package](https://www.npmjs.com/package/highcharts). Issues should now
be reported in the [Highcharts repo](https://github.com/highcharts/highcharts/issues).

### Demos
* [Categorized chart](http://jsfiddle.net/highcharts/cqjvD/)
* [View data table from menu](http://jsfiddle.net/highcharts/j4w4s0mw/)
* [Highstock with time axis](http://jsfiddle.net/highcharts/2Jyn5/)
* [Unit tests](http://jsfiddle.net/highcharts/pspdp2de/)

### Options
* `exporting.csv.columnHeaderFormatter`
Formatter callback for the column headers. Parameters are `item` (the series or axis object), `key` (the point key, for example `y` or `z`), and `keyLength`. By default it returns the series name, followed by the key if there is more than one key. For the axis it returns the axis title or "Category" or "DateTime" by default.

* `exporting.csv.dateFormat`
Which date format to use for exported dates on a datetime X axis. See [Highcharts.dateFormat](http://api.highcharts.com/highcharts#Highcharts.dateFormat\(\)).

* `exporting.csv.itemDelimiter`
The item delimiter, defaults to `,`. Use `;` for direct import to Excel.

* `exporting.csv.lineDelimiter`
The line delimiter, defaults to `\\n`.

* `series.includeInCSVExport`
Set this to false to prevent an individual series from being exported. To prevent the navigator in a stock chart, set `navigator.series.includeInCSVExport` to false.

### Methods
* `Chart.getCSV()`
Returns the current chart data as a CSV string

* `Chart.getTable()`
Returns the current chart data as a HTML table string, ready to be inserted into the DOM using `innerHTML`.

* `Chart.getDataRows()`
Returns the current chart data as a two dimensional array.

* `Chart.viewData()`
Inserts a data table below the chart container.