var app = new Vue({
  el: "#app",
  data: {
    state: "loggedOut",
    ethAddress: "",
    buttonText: "Log in",
    publicName: "",
    JWT: "",
    config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  },
  methods: {
    logInOut: async function() {
      if(this.state == "loggedOut") {
        await onConnectLoadWeb3Modal();
      }
      if (web3ModalProv) {
        window.web3 = web3ModalProv;
        try {
          this.login();
        } catch (error) {
          console.log(error);
          this.state = 'needLogInToMetaMask';
          return;
        }
      }
      else {
        this.state = 'needMetamask';
        return;
      }
    },
    login: async function() {
      var vm = this;
      if (vm.state == "loggedIn") {
        vm.state = "loggedOut";
        vm.JWT = "";
        vm.buttonText = "Log in";
        return;
      }
      if (typeof window.web3 === "undefined") {
        vm.state = "needMetamask";
        return;
      }
      let accountsOnEnable = await web3.eth.getAccounts();
      let address = accountsOnEnable[0];
      address = address.toLowerCase();
      if (address == null) {
        vm.state = "needLogInToMetaMask";
        return;
      }
      vm.state = "signTheMessage";

      axios.post(
        "server/ajax.php",
        {
          request: "login",
          address: address
        },
        vm.config
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
                  if (err) vm.state = "loggedOut";
                  return resolve({ publicAddress, signature });
                }
              )
            );
          }

          function handleAuthenticate({ publicAddress, signature }) {
            axios
              .post(
                "server/ajax.php",
                {
                  request: "auth",
                  address: arguments[0].publicAddress,
                  signature: arguments[0].signature
                },
                vm.config
              )
              .then(function(response) {
                if (response.data[0] == "Success") {
                  vm.state = "loggedIn";
                  vm.buttonText = "Log out";
                  vm.ethAddress = address;
                  vm.publicName = response.data[1];
                  vm.JWT = response.data[2];
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
  },
  computed: {
    updatePublicName: {
      get() {
        return this.publicName;
      },
      set(value) {
        axios
          .post(
            "server/ajax.php",
            {
              request: "updatePublicName",
              address: this.ethAddress,
              JWT: this.JWT,
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
    }
  },
  mounted() {
    var vm = this;
    
    if (window.web3) {
      ethereum.on('accountsChanged', (_chainId) => ethNetworkUpdate());

      async function ethNetworkUpdate() {      
        let accountsOnEnable = await web3.eth.getAccounts();
        let address = accountsOnEnable[0];
        address = address.toLowerCase();
        if (vm.ethAddress != address) {
          vm.ethAddress = address;
          if (vm.state == "loggedIn") {
            vm.JWT = "";
            vm.state = "loggedOut";
            vm.buttonText = "Log in";
          }
        }
        if (vm.ethAddress != null && vm.state == "needLogInToMetaMask") {
          vm.state = "loggedOut";
        }
      }
    }

  }
});