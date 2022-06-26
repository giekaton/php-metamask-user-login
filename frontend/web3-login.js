let userLoginData = {
  state: "loggedOut",
  ethAddress: "",
  buttonText: "Log in",
  publicName: "",
  JWT: "",
  config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
}


if (typeof(backendPath) == 'undefined') {
  var backendPath = '';
}


// On accountsChanged
async function ethAccountsChanged() {      
  let accountsOnEnable = await web3.eth.getAccounts();
  let address = accountsOnEnable[0];
  address = address.toLowerCase();
  if (userLoginData.ethAddress != address) {
    userLogOut();
    getPublicName();
  }
  if (userLoginData.ethAddress != null && userLoginData.state == "needLogInToMetaMask") {
    userLoginData.state = "loggedOut";
  }
}

function userLogOut() {
  userLoginData.state = "loggedOut";
  userLoginData.ethAddress = "";
  userLoginData.buttonText = "Log in";
  showButtonText();
  userLoginData.publicName = "";
  userLoginData.JWT = "";
  document.getElementById('loggedIn').style.display = 'none';
  document.getElementById('loggedOut').style.display = 'block';
}


// Show current msg
function showMsg(id) {
  let x = document.getElementsByClassName("user-login-msg");
  let i;
  for (i = 0; i < x.length; i++) {
      x[i].style.display = 'none';
  }
  document.getElementById(id).style.display = 'block';
}


// Show current address
function showAddress() {
  document.getElementById('ethAddress').innerHTML = userLoginData.ethAddress;
}


// Show current button text
function showButtonText() {
  document.getElementById('buttonText').innerHTML = userLoginData.buttonText;
}


async function userLoginOut() {
  clearProvider();
  
  if(userLoginData.state == "loggedOut" || userLoginData.state == "needMetamask") {
    await onConnectLoadWeb3Modal();
  }
  if (web3ModalProv) {
    try {
      userLogin();
    } catch (error) {
      console.log(error);
      userLoginData.state = 'needLogInToMetaMask';
      showMsg(userLoginData.state);
      return;
    }
  }
  else {
    userLoginData.state = 'needMetamask';
    return;
  }
}


async function userLogin() {
  if (userLoginData.state == "loggedIn") {
    userLoginData.state = "loggedOut";
    showMsg(userLoginData.state);
    userLoginData.JWT = "";
    userLoginData.buttonText = "Log in";
    showButtonText();
    return;
  }
  if (typeof window.web3 === "undefined") {
    userLoginData.state = "needMetamask";
    showMsg(userLoginData.state);
    return;
  }
  let accountsOnEnable = await ethereum.request({ method: 'eth_accounts' });
  let address = accountsOnEnable[0];
  address = address.toLowerCase();
  if (address == null) {
    userLoginData.state = "needLogInToMetaMask";
    showMsg(userLoginData.state);
    return;
  }
  userLoginData.state = "signTheMessage";
  showMsg(userLoginData.state);

  axios.post(
    backendPath+"backend/server.php",
    {
      request: "login",
      address: address
    },
    userLoginData.config
  )
  .then(function(response) {
    if (response.data.substring(0, 5) != "Error") {
      let message = response.data;
      let publicAddress = address;
      handleSignMessage(message, publicAddress).then(handleAuthenticate);

      function handleSignMessage(message, publicAddress) {
        return new Promise((resolve, reject) =>  
          web3.eth.personal.sign(
            web3.utils.utf8ToHex(message),
            publicAddress,
            (err, signature) => {
              if (err) {
                userLoginData.state = "loggedOut";
                showMsg(userLoginData.state);
              }
              return resolve({ publicAddress, signature });
            }
          )
        );
      }

      function handleAuthenticate({ publicAddress, signature }) {
        axios
          .post(
            backendPath+"backend/server.php",
            {
              request: "auth",
              address: arguments[0].publicAddress,
              signature: arguments[0].signature
            },
            userLoginData.config
          )
          .then(function(response) {
            if (response.data[0] == "Success") {
              userLoginData.state = "loggedIn";
              showMsg(userLoginData.state);
              userLoginData.buttonText = "Log out";
              showButtonText();
              userLoginData.ethAddress = address;
              showAddress();
              userLoginData.publicName = response.data[1];
              getPublicName();
              userLoginData.JWT = response.data[2];
              // Clear Web3 wallets data for logout
              localStorage.clear();
            }
          })
          .catch(function(error) {
            console.error(error);
          });
      }
    } 
    else {
      console.log("Error: " + response.data);
    }
  })
  .catch(function(error) {
    console.error(error);
  });
} 


function getPublicName() {
  document.getElementById('updatePublicName').value = userLoginData.publicName;
}


function setPublicName() {
  let value = document.getElementById('updatePublicName').value;
  axios.post(
    backendPath+"backend/server.php",
    {
      request: "updatePublicName",
      address: userLoginData.ethAddress,
      JWT: userLoginData.JWT,
      publicName: value
    },
    this.config
  )
  .then(function(response) {
    console.log(response.data);
  })
  .catch(function(error) {
    console.error(error);
  });
}