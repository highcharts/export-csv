/**
 * A small plugin for getting the CSV of a categorized chart
 */
(function (Highcharts) {
    
    
    var each = Highcharts.each;
	// check if we can download on client side
	var downloadAttrSupported = !!("download" in document.createElement("a"));


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
            itemDelimiter = options.itemDelimiter || ';', // use ';' for direct import to Excel
			lineDelimiter = (downloadAttrSupported ? options.lineDelimiter || "%0A" :options.lineDelimiter || '\n\r'); // '\n' isn't working with the js csv data extraction


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
	// If the browser do support the downlod attrinute
	//		then extraction is done on Client side
	//		else extraction is done on Server side
	// For the Client side extraction we addapt the code from 
	//		 http://stackoverflow.com/questions/17836273/export-javascript-data-to-csv-file-without-server-interaction
	// For the Server Side Extraction 
	// We post the CSV
    // to a simple PHP script that returns it with a content-type header as a
    // downloadable file.
    // The source code for the PHP script can be viewed at
    // https://raw.github.com/highslide-software/highcharts.com/master/studies/csv-export/csv.php
	if (Highcharts.getOptions().exporting) {
		Highcharts.getOptions().exporting.buttons.contextButton.menuItems.push({
			text: Highcharts.getOptions().lang.downloadCSV || "Download CSV",
			onclick: function () {
			var a = document.createElement('a');
			
			if(typeof a.download != "undefined")
			{
				// download attribute is supported
				// Client side extraction
				a.href        = 'data:attachment/csv,' + this.getCSV();
				a.target      = '_blank';
				var fileName='savedChart';
				if (this.title){
					fileName= this.title.textStr.replace(/ /g ,'_') 
				}
				a.download    = fileName + '.csv';
				document.body.appendChild(a);
				a.click();
			}
			else
			{
			  // download attribute is not supported
			  // Server side extraction
				Highcharts.post('http://www.highcharts.com/studies/csv-export/csv.php', {
					csv: this.getCSV()
				});
			}

			a.remove();
			}
		});
	}
	
	
	
	
}(Highcharts));
