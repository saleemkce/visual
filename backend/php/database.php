<?php
session_start();

class Database extends Exception {
    protected $serverName;
    protected $username;
    protected $password;
    protected $database;
    protected $connection;

    public function __construct() {
        $this->serverName = 'localhost';
        $this->username = 'root';
        $this->password = '';
        $this->database = 'localdata';
    }

    /**
     * [connectDB Establish connection with database]
     */
    public function connectDB() {
        try {
            $this->connection = mysqli_connect($this->serverName, $this->username, $this->password, $this->database);

            if($this->connection) {
                return $this->connection;
            }

            if(mysqli_connect_errno()) {
                throw new Exception(mysqli_connect_errno());
            }
        }
        catch(Exception $e)
        {
            $this->handleException($e);
        }
    }

    public function cleanUpSession() {
        session_destroy();
    }

    /**
     * [handleException It handles all exceptions in application]
     * @param  Exception $e [exception thrown]
     */
    public function handleException(Exception $e) {
        echo json_encode(array(
            'error' => array(
                'code' => $e->getCode(),
                'message' => $e->getMessage()
            )
        ));
    }
}
