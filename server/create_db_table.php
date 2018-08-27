<?php

//Connect to Mysql
include_once "config.php";


// sql to create 'users' table
$sql = "CREATE TABLE `users` (
 `ID` INT(11) NOT NULL AUTO_INCREMENT,
 `address` VARCHAR(42) NOT NULL UNIQUE,
 `publicName` TINYTEXT NOT NULL,
 `nonce` TINYTEXT NOT NULL,
 `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1";



if ($conn->query($sql) === TRUE) {
    echo "Table 'users' created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}


$conn->close();

?>