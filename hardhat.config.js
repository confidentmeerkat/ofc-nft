require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    mainnet: {
      url: "https://mainnet.infura.io/v3/436c5af4f2824391ade0031ee6332ee3", // or any other JSON-RPC provider
      accounts: {
        mnemonic:
          "bullet endorse ceiling solid merge apple radio extend crumble clean inflict foot",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/436c5af4f2824391ade0031ee6332ee3",
      accounts: {
        mnemonic:
          "bullet endorse ceiling solid merge apple radio extend crumble clean inflict foot",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/436c5af4f2824391ade0031ee6332ee3",
      accounts: {
        mnemonic:
          "bullet endorse ceiling solid merge apple radio extend crumble clean inflict foot",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
        passphrase: "",
      },
    },
  },
};
