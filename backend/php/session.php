<?php
require 'database.php';

class Session extends Database {
    public $dbConnection;

    public function __construct() {
        $this->dbConnection = new Database();
    }

    /**
     * [destroySession delete all session data]
     * @return [array] [delete resposne code "delete_success"]
     */
    public function destroySession() {
        $this->dbConnection->cleanUpSession();
        return json_encode(array(
            'code' => 'delete_success'
        ));
    }
    
}

/* Initialize and access methods in Session */
if(!empty($_POST)) {
    $session = new Session();
    return $session->destroySession();
} else {
    throw new Exception('Method POST - data is empty');
}
