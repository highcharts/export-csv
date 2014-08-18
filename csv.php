<?php

/**
 * DISCLAIMER: Don't use www.highcharts.com/studies/csv-export/csv.php in 
 * production! This file may be removed at any time.
 */

$csv = $_POST['csv'];
$filename = (empty($_POST['filename'])) ? 'chart.csv' : $_POST['filename'];

if ($csv) {
	header('Content-type: text/csv');
	header("Content-disposition: attachment;filename=$filename");
	echo $csv;
}

?>
