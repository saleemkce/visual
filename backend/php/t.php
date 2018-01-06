<?php
// $d = new DateTime('2017-01-04 16:18:47.000'.' - 2 year');
// var_dump($d);

require_once 'database.php';

class growDB extends Database {
    public $dbConnection = NULL;
    public $counter = 0;
    public $start = 0;

    public function __construct() {
        $dbConfig = new Database();
        $this->dbConnection = $dbConfig->connectDB();
    }

    /**
     * [save description]
     * @param  [object] $data [data to be saved in table]
     * @return [string]       [responds with success message]
     */
    public function save($data) {
    	try{
			// Perform queries
			if($data->trackingType == 'tos') {
				$query = "INSERT INTO tos_temp (tos_id, tos_session_key, tos_user_id, url, title, entry_time, exit_time, timeonpage, timeonpage_by_duration, timeonpage_tracked_by, timeonsite, timeonsite_by_duration, tracking_type) VALUES (".$data->TOSId.", '".$data->TOSSessionKey."', '".$data->TOSUserId."', '".$data->URL."', '".$data->title."', '".$data->entryTime."', '".$data->exitTime."', ".$data->timeOnPage.", '".$data->timeOnPageByDuration."', '".$data->timeOnPageTrackedBy."', ".$data->timeOnSite.", '".$data->timeOnSiteByDuration."', '".$data->trackingType."')";
			}

			$response = mysqli_query($this->dbConnection, $query);
			if($response) {
				//++$this->counter;
				//echo 'success '.$this->counter.'<br/>';
				// $this->start = $this->start + 1;
				// echo 'start value '.$this->start;
				// $this->read();
			} else {
				throw new Exception(mysqli_error($this->dbConnection));
			}
		}
		catch(Exception $e)
        {
            $this->handleException($e);
        }
	}


	public function read() {

			// $query = "SELECT * FROM tos_temp limit ".$this->start.", 1";
	  //       $response = mysqli_query($this->dbConnection, $query);
	        

	  //       if($response) {
	  //           while($row = mysqli_fetch_assoc($response)) {

	  //              	$data = new stdClass();
			//         $data->TOSId = $row['tos_id'];
			//        	$data->TOSSessionKey = $row['tos_session_key'];
			//        	$data->TOSUserId = $row['tos_user_id'];
			//    		$data->URL = $row['url'];
			//    		$data->title = $row['title'];
			// 		$data->entryTime = $this->procssDate($row['entry_time']);
			// 		$data->exitTime = $this->procssDate($row['exit_time']);
			// 		$data->timeOnPage = $row['timeonpage'];
			// 		$data->timeOnPageByDuration = $row['timeonpage_by_duration'];
			// 		$data->timeOnPageTrackedBy = $row['timeonpage_tracked_by'];
			// 		$data->timeOnSite = $row['timeonsite'];
			// 		$data->timeOnSiteByDuration = $row['timeonsite_by_duration'];
			// 		$data->trackingType = $row['tracking_type'];


			// 		$this->save($data);

			// 		// var_dump($data);
			// 		// die();
	  //           }
	  //       }



			$query = "SELECT distinct tos_session_key FROM tos_temp";
	        $response = mysqli_query($this->dbConnection, $query);
	        if($response) {
	        	//$countss = 0;
	            while($row = mysqli_fetch_assoc($response)) {
	            	print_r('key-'.$row['tos_session_key']);print_r('<br/>');print_r('<br/>');


	            	$q2 = "SELECT * FROM tos_temp where tos_session_key=".$row['tos_session_key'];
			        $res2 = mysqli_query($this->dbConnection, $q2);
			        

			        if($res2) {
			        	//$newSessionKey = 'aaaaa'.$countss;
			        	$newSessionKey = time().mt_rand().substr(uniqid(), -2);
			        	echo '<br/>Session Key is : '.$newSessionKey.'<br/>';
			            while($row2 = mysqli_fetch_assoc($res2)) {
			            	//print_r($row2);print_r('<br/>');

			            		$data = new stdClass();
						        $data->TOSId = 8899;
						       	$data->TOSSessionKey = $newSessionKey;
						       	$data->TOSUserId = $row2['tos_user_id'];
						   		$data->URL = $row2['url'];
						   		$data->title = $row2['title'];

						   		// $data->entryTime = $row2['entry_time'];
						   		// $data->exitTime = $row2['exit_time'];

								$data->entryTime = $this->procssDate($row2['entry_time']);
								$data->exitTime = $this->procssDate($row2['exit_time']);
								$data->timeOnPage = $row2['timeonpage'];
								$data->timeOnPageByDuration = $row2['timeonpage_by_duration'];
								$data->timeOnPageTrackedBy = $row2['timeonpage_tracked_by'];
								$data->timeOnSite = $row2['timeonsite'];
								$data->timeOnSiteByDuration = $row2['timeonsite_by_duration'];
								$data->trackingType = $row2['tracking_type'];

								//print_r($data->entryTime . ' '. $data->exitTime);print_r('<br/>');

								$this->save($data);
								++$this->start;
								echo 'done '.$this->start.'<br/>';

								if($this->start >= 30000) {
									echo 'exiting....';
									exit;
								}


			            }
			        }


		        
	            }
	        }

		
	}

	public function procssDate($v) {
		$previousYear = new DateTime( $v . ' - 2 year'); //echo $previousYear->format('Y-m-d H:i:s.ms');
        return $previousYear->format('Y-m-d H:i:s.ms');
        
	}

	public function __destruct() {
        if($this->dbConnection) {
            mysqli_close($this->dbConnection);
        }
    }
}


// echo time().mt_rand().substr(uniqid(), -2);
// die();

echo '<h1>you want to run really to crash???</h1>';die();
$r = new growDB();
$r->read();