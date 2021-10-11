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

  // Prepared statement to protect against SQL injections
  $stmt = $conn->prepare("SELECT nonce FROM users WHERE address = ?");
  $stmt->bind_param("s", $address);
  $stmt->execute();
  $stmt->bind_result($nonce);
  $stmt->fetch();
  $stmt->close();

  if ($nonce) {
    // If user exists, return message to sign
    echo("Sign this message to validate that you are the owner of the account. Random string: " . $nonce);
  }
  else {
    // If user doesn't exist, register new user with generated nonce, then return message to sign
    $nonce = uniqid();

    // Prepared statement to protect against SQL injections
    $stmt = $conn->prepare("INSERT INTO users (address, nonce) VALUES (?, ?)");
    $stmt->bind_param("ss", $address, $nonce);

    if ($stmt->execute() === TRUE) {
      echo ("Sign this message to validate that you are the owner of the account. Random string: " . $nonce);
    } else {
      echo "Error" . $stmt->error;
    }

    $stmt->close();
    $conn->close();
  }

  exit;

}


if ($request == "auth") {
  $address = $data->address;
  $signature = $data->signature;

  // Prepared statement to protect against SQL injections
  if($stmt = $conn->prepare("SELECT nonce FROM users WHERE address = ?")) {
    $stmt->bind_param("s", $address);
    $stmt->execute();
    $stmt->bind_result($nonce);
    $stmt->fetch();
    $stmt->close();

    $message = "Sign this message to validate that you are the owner of the account. Random string: " . $nonce;
  }

  // Check if the message was signed with the same private key to which the public address belongs
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

  // If verification passed, authenticate user
  if (verifySignature($message, $signature, $address)) {

    $sql = "SELECT publicName FROM users WHERE address = '".$address."'";
    $result = $conn->query($sql);
    $result = mysqli_fetch_object($result);
    $publicName = $result->publicName;
    $publicName = htmlspecialchars($publicName, ENT_QUOTES, 'UTF-8');

    // Create a new random nonce for the next login
    $nonce = uniqid();
    $sql = "UPDATE users SET nonce = '".$nonce."' WHERE address = '".$address."'";
    $conn->query($sql);

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

  // Prepared statement to protect against SQL injections
  $stmt = $conn->prepare("UPDATE users SET publicName = ? WHERE address = '".$address."'");
  $stmt->bind_param("s", $publicName);

  if ($stmt->execute() === TRUE) {
    echo "Public name updated";
  }

  $stmt->close();
  $conn->close();
  exit;

}


?>