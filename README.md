export-csv
==========
This plugin allows the user to export the chart data to a CSV string.

The contents of the plugin is located in the javascript file "export-csv.js". 
This plugin is published under the MIT license, and the license document is included in the repository.

### Demos
* [Categorized chart](http://jsfiddle.net/highcharts/cqjvD/)
* [Highstock with time axis](http://jsfiddle.net/highcharts/2Jyn5/)
* [Unit tests](http://jsfiddle.net/highcharts/pspdp2de/)

### Options
* `exporting.csv.dateFormat`
Which date format to use for exported dates on a datetime X axis. See [Highcharts.dateFormat](http://api.highcharts.com/highcharts#Highcharts.dateFormat\(\)).

* `exporting.csv.itemDelimiter`
The item delimiter, defaults to `,`. Use `;` for direct import to Excel.

* `exporting.csv.lineDelimiter`
The line delimiter, defaults to `\\n`.

* `series.includeInCSVExport`
Set this to false to prevent an individual series from being exported. To prevent the navigator in a stock chart, set `navigator.series.includeInCSVExport` to false.
