var app = new Vue({
  el: "#app",
  data: {
    state: "loggedOut",
    ethAddress: "",
    network: "",
    buttonText: "Log in",
    publicName: "",
    JWT: "",
    config: { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  },
  methods: {
    logInOut: function() {
      var vm = this;
      if (vm.state == "loggedIn") {
        vm.state = "loggedOut";
        vm.JWT = "";
        vm.buttonText = "Log in";
        return;
      }
      if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        vm.state = "mobileDevice";
        return;
      }
      if (typeof window.web3 === "undefined") {
        vm.state = "needMetamask";
        return;
      }
      if (web3.eth.coinbase == null) {
        vm.state = "needLogInToMetaMask";
        return;
      }
      vm.state = "signTheMessage";
      axios
        .post(
          "server/ajax.php",
          {
            request: "login",
            address: web3.eth.coinbase
          },
          vm.config
        )
        .then(function(response) {
          if (response.data.substring(0, 5) != "Error") {
            let message = response.data;
            let publicAddress = web3.eth.coinbase;
            handleSignMessage(message, publicAddress).then(handleAuthenticate);

            function handleSignMessage(message, publicAddress) {
              return new Promise((resolve, reject) =>
                web3.personal.sign(
                  web3.fromUtf8(message),
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
                    vm.ethAddress = web3.eth.coinbase;
                    vm.publicName = response.data[1];
                    vm.JWT = response.data[2];
                  }
                })
                .catch(function(error) {
                  console.error(error);
                });
            }
          } else {
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
    web3.currentProvider.publicConfigStore.on("update", ethNetworkUpdate);
    function ethNetworkUpdate({ selectedAddress, networkVersion }) {
      if (vm.ethAddress != arguments[0].selectedAddress) {
        vm.ethAddress = arguments[0].selectedAddress;
        if (vm.state == "loggedIn") {
          vm.JWT = "";
          vm.state = "loggedOut";
          vm.buttonText = "Log in";
        }
      }
      if (vm.ethAddress != null && vm.state == "needLogInToMetaMask") {
        vm.state = "loggedOut";
      }
      vm.network = arguments[0].networkVersion;
    }
  }
});

// // Make vue global
// window.vue = app;
