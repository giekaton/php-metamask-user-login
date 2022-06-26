const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

(async () => {
  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
      }
    },
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  // https://web3js.readthedocs.io/en/v1.3.0/getting-started.html
  web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
})();

async function fetchAccountData() {
  web3ModalProv = new Web3(provider);
  
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    console.log(accounts);
    ethAccountsChanged();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
    // ethChainChanged();
  });

  // Subscribe to session disconnection
  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
    // ethDisconnect();
  });
}

async function refreshAccountData() {
  await fetchAccountData(provider);
}

async function onConnectLoadWeb3Modal() {
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  
  await refreshAccountData();
}


// Clear previous provider to re-open walletconnect dialog on mobiles
async function clearProvider() {
  if (typeof(provider) != 'undefined') {
    console.log("Killing the wallet connection", provider);

    if(provider.close) {
      await provider.close();

      await web3Modal.clearCachedProvider();
      provider = null;
    }

    selectedAccount = null;
  } 
}

// Clear cached provider
clearProvider();