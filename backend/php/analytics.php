<?php
require_once 'database.php';

class Analytics extends Database {
    public $dbConnection = NULL;
    public $analyticsDataLimit = 10000;

    public function __construct() {
        $dbConfig = new Database();
        $this->dbConnection = $dbConfig->connectDB();
    }

    /**
     * [getAnalytics Retrieves a set of data for making analytics with dc charting]
     * @return [array] [result set]
     */
    public function getAnalytics() {
        try {
            // Perform queries
            if(isset($_GET['startDate']) && isset($_GET['endDate'])) {
                if($this->isValidDate($_GET['startDate']) && $this->isValidDate($_GET['endDate'])) {
                    $query = "SELECT * FROM tos WHERE entry_time >= '".$this->escapeInput($_GET['startDate'])."' AND exit_time  <= '".$this->escapeInput($_GET['endDate'])."' ORDER BY entry_time DESC LIMIT " . $this->analyticsDataLimit;
                }
            } else {
                $query = "SELECT * FROM tos ORDER BY entry_time DESC LIMIT " . $this->analyticsDataLimit;
            }
            
            $queryResponse = mysqli_query($this->dbConnection, $query);
            $results = array();
            
            while($row = mysqli_fetch_assoc($queryResponse)) {
                $t = new stdClass();
                foreach($row as $key=>$value) {
                    if($key == 'id' || $key == 'tos_id' || $key == 'timeonpage' || $key == 'timeonsite') {
                        $t->$key = (int) $value;
                    } else {
                        $t->$key = $value;
                    }
                }
                array_push($results, $t);
            }

            /* free result set in case of large result set */
            if($queryResponse) {   
                mysqli_free_result($queryResponse);
            }

            if($queryResponse) {
                echo json_encode($results);
            } else {
                throw new Exception(mysqli_error($this->dbConnection));
            }

        }
        catch(Exception $e)
        {
            $this->handleException($e);
        }
    }

    /**
     * [escapeInput sanitize user input]
     * @param  [string] $d [user input]
     * @return [string]
     */
    public function escapeInput($d) {
        return mysqli_real_escape_string($this->dbConnection, $d);
    }

    /**
     * [isValidDate checks if given date is valid]
     * @param  [string]  $dateString [date string]
     * @return boolean
     */
    public function isValidDate($dateString) {
        return (bool)strtotime($dateString);
    }

    public function __destruct() {
        if($this->dbConnection) {
            mysqli_close($this->dbConnection);
        }
    }
}

/* Initialize and access methods in Analytics */
if($_SERVER['REQUEST_METHOD'] == 'GET') {
    $analytics = new Analytics();
    $analytics->getAnalytics();
}
