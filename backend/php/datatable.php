<?php
require_once 'database.php';

class DataTableReports extends Database {
    public $dbConnection = NULL;
    public $recordsCount = 0;
    public $recordsFiltered = 0;
    public $filteredQuery = '';
    public $sessionAvailability;

    public function __construct() {
        $dbConfig = new Database();
        $this->dbConnection = $dbConfig->connectDB();
        $this->checkSession();
    }
    
    /**
     * [getRecordsCount retrieves overall data count]
     */
    public function getRecordsCount() {
        try{
            $queryTotal = "SELECT count(*) as total FROM tos";
            $responseTotal = mysqli_query($this->dbConnection, $queryTotal);

            if($responseTotal) {
                while($row = mysqli_fetch_assoc($responseTotal)) {
                    $_SESSION['count'] = (int) $row['total'];
                    $this->recordsCount = $_SESSION['count'];
                    $this->recordsFiltered = $_SESSION['count'];
                }
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
     * [checkSession checks if session already exists]
     */
    public function checkSession() {
        if(!isset($_SESSION['count'])) {$this->sessionAvailability = false;
            $this->getRecordsCount();
        } else {$this->sessionAvailability = true;
            $this->recordsCount = $_SESSION['count'];
            $this->recordsFiltered = $_SESSION['count'];
        }
    }

    /**
     * [handleDate build query for formatted date search]
     * @param  [string] $k [entry_time || exit_time]
     * @param  [string] $v [actual date string]
     * @return [string]    [prepared date query]
     */
    public function handleDate($k, $v) {
        $str = $v;

        if ($str == trim($str) && strpos($str, ' ') !== false) {
            return $k."='".$this->escapeInput($v)."'";
        } else {
            $nextDate = new DateTime( $v . ' + 1 day');
            return $k.">='".$this->escapeInput($v)."' AND ".$k."<'".$nextDate->format('Y-m-d H:i:s')."'";
        }

    }

    /**
     * [hanldeDateJoinCondition build query for simple date search with AND condition between entry_time and exit_time]
     * @param  [string] $entryDateField [entry_time field]
     * @param  [string] $exitDateField  [exit_time field]
     * @param  [string] $entryDate      [entry_time]
     * @param  [string] $exitDate       [exit_time]
     * @return [string]                 [prepared date query]
     */
    public function hanldeDateJoinCondition($entryDateField, $exitDateField, $entryDate, $exitDate) {
        return $entryDateField.">='".$this->escapeInput($entryDate)."' AND ".$exitDateField."<='".$this->escapeInput($exitDate)."'";
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
     * [getDatatable function to process search queries and retrive DATATABLES data from DB]
     * @return [array] [data set]
     */
    public function getDatatable() {
        try {
            $searchCol = array();
            $colKeys = array();

            foreach($_POST['columns'] as $columns) {
                $colKeys[] = $columns['data'];
            }  
            
            
            $orderBy = null;
            $orderDir = 'ASC';
            foreach($_POST['order'] as $order) {
                $ind = (int) $order['column'];
                $orderBy = $colKeys[$ind]; 
                $orderDir = $order['dir'];

                // 2D array transformation in case of using datatable order() API
                if(is_array($order['dir'])) {
                    $newDirData = [];
                    foreach($order['dir'] as $newDir) {
                       $newDirData[] = $newDir;
                    }
                    $orderBy = $newDirData[0];
                    $orderDir = $newDirData[1];
                }
            }
            
            foreach($_POST['columns'] as $columns) {
                if($columns['search']['value']) {
                    $searchCol[] = array($columns['data'] => $columns['search']['value']);
                }    
            }

            $news = [];
            if(count($searchCol) >= 1) {
                
                $query = "SELECT * FROM tos WHERE ";

                $entryTimePresent = false;
                $exitTimePresent = false;
                $entryDateTemp = NULL;
                $exitDateTemp = NULL;
                $dateQry = NULL;

                foreach($searchCol as $cols) {
                    foreach($cols as $k => $v) {
                        if($k == 'tos_id' || $k == 'timeonpage' || $k == 'timeonsite') {
                            $query .= $k."=".$v." AND ";

                        } else if($k == 'entry_time' || $k == 'exit_time') {
                            
                            if($k == 'entry_time' && $k != 'exit_time') {
                                $entryDateField = $k;
                                $entryTimePresent = true;
                                $entryDateTemp = $v;

                                $dateQry = $this->handleDate($k, $this->escapeInput($v)) ." AND ";

                            }else if($k == 'exit_time' && $k != 'entry_time') {
                                $exitDateField = $k;
                                $exitTimePresent = true;
                                $exitDateTemp = $v;

                                if($entryTimePresent && $exitTimePresent) {
                                    $dateQry = $this->hanldeDateJoinCondition($entryDateField, $exitDateField, $entryDateTemp, $exitDateTemp) ." AND ";
                                } else {
                                    $dateQry = $this->handleDate($k, $this->escapeInput($v)) ." AND "; 
                                }
                                
                            }

                        } else {
                            $query .= $k." LIKE '%".$this->escapeInput($v)."%' AND ";

                        }
                    }
                }

                if($dateQry) {
                    $query .= $dateQry;
                }

                $query = substr($query, 0, -5);
                $this->filteredQuery = $query;

                $filteredQueryResponse = mysqli_query($this->dbConnection, $this->filteredQuery);
                $this->recordsFiltered = mysqli_num_rows($filteredQueryResponse);


                if($orderBy) {
                    $query .= " ORDER BY " .$orderBy." ".$orderDir;
                }

                $query .= " limit " . $_POST['start'] . ', ' .$_POST['length'];
                
            } else {
                // Perform queries
                $query = "SELECT * FROM tos ORDER BY entry_time DESC limit " . $_POST['start'] . ', ' .$_POST['length'];        
            }
           
            $queryResponse = mysqli_query($this->dbConnection, $query);
            //$this->recordsFiltered = mysqli_affected_rows($this->dbConnection);

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

            $response = new stdClass();
            if($queryResponse) {
                $response->draw = intval($_POST['draw']);
                $response->recordsTotal = $this->recordsCount;
                $response->recordsFiltered = $this->recordsFiltered;
                $response->data = $results;

                //$response->post___ = $_POST;
                //$response->sessionAvailability = $this->sessionAvailability;
                //$response->query = $query;

                echo json_encode($response);
            } else {
                $response->error = mysqli_error($this->dbConnection);
                throw new Exception(json_encode($response));
            }
        }
        catch(Exception $e)
        {
            $this->handleException($e);
        }
    }

    /**
     * [refreshData get current table information]
     */
    public function refreshData() {
        $this->getRecordsCount();
    }

    public function __destruct() {
        if($this->dbConnection) {
            mysqli_close($this->dbConnection);
        }
    }

}
