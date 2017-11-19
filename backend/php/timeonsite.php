<?php
require_once 'database.php';

class TimeOnSite extends Database {
    public $dbConnection = NULL;

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
				$query = "INSERT INTO tos (tos_id, tos_session_key, tos_user_id, url, title, entry_time, exit_time, timeonpage, timeonpage_by_duration, timeonpage_tracked_by, timeonsite, timeonsite_by_duration, tracking_type) VALUES (".$data->TOSId.", '".$data->TOSSessionKey."', '".$data->TOSUserId."', '".$data->URL."', '".$data->title."', '".$data->entryTime."', '".$data->exitTime."', ".$data->timeOnPage.", '".$data->timeOnPageByDuration."', '".$data->timeOnPageTrackedBy."', ".$data->timeOnSite.", '".$data->timeOnSiteByDuration."', '".$data->trackingType."')";
			} else {
				$query = "INSERT INTO activity (tos_id, tos_session_key, tos_user_id, url, title, activity_start, activity_end, time_taken, time_taken_by_duration, time_taken_tracked_by, tracking_type) VALUES (".$data->TOSId.", '".$data->TOSSessionKey."', '".$data->TOSUserId."', '".$data->URL."', '".$data->title."', '".$data->activityStart."', '".$data->activityEnd."', ".$data->timeTaken.",  '".$data->timeTakenByDuration."', '".$data->timeTakenTrackedBy."', '".$data->trackingType."')";
			}

			$response = mysqli_query($this->dbConnection, $query);
			if($response) {
				echo 'success';
			} else {
				throw new Exception(mysqli_error($this->dbConnection));
			}
		}
		catch(Exception $e)
        {
            $this->handleException($e);
        }
	}

	public function __destruct() {
        if($this->dbConnection) {
            mysqli_close($this->dbConnection);
        }
    }
}


/* Initialize and access methods in TimeOnSite */
if($_SERVER['REQUEST_METHOD'] == 'POST') {
	$data = json_decode(file_get_contents("php://input"));
	$analytics = new TimeOnSite();
	$analytics->save($data);
} else {
	throw new Exception('Method is not POST.');
}
