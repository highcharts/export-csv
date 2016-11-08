export-csv
==========
This plugin allows the user to export the chart data to various formats and views.

The contents of the plugin is located in the JavaScript file "export-csv.js". 
This plugin is published under the MIT license, and the license document is included in the repository.

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