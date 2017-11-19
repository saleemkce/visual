<?php
require_once 'datatable.php';

/* Initialize and access methods in DataTableReports */
if(!empty($_POST)) {
    $datatable = new DataTableReports();
    $datatable->getDatatable();
} else {
    throw new Exception('Method POST - data is empty');
}
