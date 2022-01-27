<?php

include_once "config.php";

try {
        if ($servertype == "pgsql") {
                $sql = "CREATE TABLE IF NOT EXISTS $tablename(
                ID SERIAL PRIMARY KEY,
                address VARCHAR(42) NOT NULL,
                publicName VARCHAR(250) DEFAULT NULL,
                nonce VARCHAR(250) DEFAULT NULL,
                created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);";
        } elseif ($servertype == "mysql") {
                $sql = "CREATE TABLE IF NOT EXISTS $tablename (
                 ID INT(11) NOT NULL AUTO_INCREMENT,
                 address VARCHAR(42) NOT NULL UNIQUE,
                 publicName TINYTEXT DEFAULT NULL,
                 nonce TINYTEXT DEFAULT NULL,
                 created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                 PRIMARY KEY (ID)) ENGINE=MyISAM DEFAULT CHARSET=latin1";
        }else{
                die('DB Config Error');
        }

        $conn->exec($sql);
        print("Created $tablename Table.\n");
        $conn = null;
}
catch(PDOException $e) {
        echo $e->getMessage();
}

?>
