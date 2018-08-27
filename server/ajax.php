<?php
require_once "lib/Keccak/Keccak.php";
require_once "lib/Elliptic/EC.php";
require_once "lib/Elliptic/Curves.php";

require_once "lib/JWT/jwt_helper.php";
$GLOBALS['JWT_secret'] = '4Eac8AS2cw84easd65araADX';

use Elliptic\EC;
use kornrunner\Keccak;

require_once('config.php');

$data = json_decode(file_get_contents("php://input"));
$request = $data->request;


if ($request == "login") {
  $address = $data->address;

  $sql = "SELECT nonce FROM users WHERE address = '".$address."'";
  $result = $conn->query($sql);

  if ($result->num_rows > 0) {

    // If user exists, return nonce
    $result = mysqli_fetch_object($result);
    echo("Sign this message to validate that you are the owner of the account. Random string: " . $result->nonce);

  } else {

    // If user doesn't exist, register new user with generated nonce, then return nonce
    $nonce = uniqid();
    $sql = "INSERT INTO users (address, nonce) VALUES ('".$address."', '".$nonce."')";

    if ($conn->query($sql) === TRUE) {
      echo ("Sign this message to validate that you are the owner of the account. Random string: " . $nonce);
    } else {
      echo "Error: " . $conn->error;
    }

  }
  
  $conn->close();
  exit;

}


if ($request == "auth") {
  $address = $data->address;
  $signature = $data->signature;
  
  $sql = "SELECT nonce FROM users WHERE address = '".$address."'";
  $result = $conn->query($sql);
  if ($result->num_rows > 0) {
    $result = mysqli_fetch_object($result);
    $nonce = $result->nonce;
    $message = "Sign this message to validate that you are the owner of the account. Random string: " . $nonce;
  }

  function pubKeyToAddress($pubkey) {
    return "0x" . substr(Keccak::hash(substr(hex2bin($pubkey->encode("hex")), 1), 256), 24);
  }
  
  function verifySignature($message, $signature, $address) {
    $msglen = strlen($message);
    $hash   = Keccak::hash("\x19Ethereum Signed Message:\n{$msglen}{$message}", 256);
    $sign   = ["r" => substr($signature, 2, 64), 
               "s" => substr($signature, 66, 64)];
    $recid  = ord(hex2bin(substr($signature, 130, 2))) - 27; 
    if ($recid != ($recid & 1)) 
        return false;
  
    $ec = new EC('secp256k1');
    $pubkey = $ec->recoverPubKey($hash, $sign, $recid);
  
    return $address == pubKeyToAddress($pubkey);
  }
  
  if (verifySignature($message, $signature, $address)) {

    $sql = "SELECT publicName FROM users WHERE address = '".$address."'";
    $result = $conn->query($sql);
    $result = mysqli_fetch_object($result);
    $publicName = $result->publicName;

    // Create JWT Token
    $token = array();
    $token['address'] = $address;
    $JWT = JWT::encode($token, $GLOBALS['JWT_secret']);

    echo(json_encode(["Success", $publicName, $JWT]));
  } else {
    echo "Fail";
  }

  $conn->close();
  exit;

}


if ($request == "updatePublicName") {
  $publicName = $data->publicName;
  $address = $data->address;

  // Check if the user is logged in
  try { $JWT = JWT::decode($data->JWT, $GLOBALS['JWT_secret']); }
  catch (\Exception $e) { echo 'Authentication error'; exit; }

  $sql = "UPDATE users SET publicName = '".$publicName."' WHERE address = '".$address."'";

  if ($conn->query($sql) === TRUE) {
    echo("Public name updated");
  }
  
  $conn->close();
  exit;

}


?>