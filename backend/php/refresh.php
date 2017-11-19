<?php
require_once 'datatable.php';

class Refresh extends Database {
    public $dbConnection;
    protected $datatable;

    public function __construct() {
        $this->dbConnection = new Database();
        $this->datatable = new DataTableReports();
    }

    /**
     * [updateSession update records count session data]
     * @return [array] [ response code "refresh_success"]
     */
    public function updateSession() {
        $this->datatable->refreshData();
        echo json_encode(array(
            'code' => 'refresh_success'
        ));
    }
    
}

/* Initialize and access methods in Session */
if(!empty($_POST) && isset($_POST['timestamp'])) {
    $refresh = new Refresh();
    return $refresh->updateSession();
} else {
    throw new Exception('Method POST - data is empty');
}
