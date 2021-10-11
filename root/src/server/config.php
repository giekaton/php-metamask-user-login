<?php 

$servername = "192.168.1.148";
$username = "root";
$password = "MYSQL_ROOT_PASSWORD";
$dbname = "MYSQL_DATABASE";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname, 9906);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}