"use strict";

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;

// Address of the selected account
let selectedAccount;

// Web3Loaded
let web3ModalProv;

function web3ModalInit() {
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
}

async function fetchAccountData() {
  web3ModalProv = new Web3(provider);
 
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    console.log(accounts);
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    console.log(chainId);
  });

  // Subscribe to session disconnection
  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
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

window.addEventListener('load', async () => {
  web3ModalInit();
});
