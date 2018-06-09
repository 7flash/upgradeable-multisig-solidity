const fs = require("fs");
const path = require("path");

const HDWalletProvider = require("truffle-hdwallet-provider");

const mnemonic = fs.readFileSync(path.resolve(__dirname, "mnemonic")).toString().trim();

module.exports = {
	"networks": {
		"develop": {
			host: "localhost",
			port: 8545,
			gas: 4e6,
			gasPrice: 1,
			network_id: "*"
		},
		"mainnet": {
			provider: new HDWalletProvider(mnemonic, "https://mainnet.infura.io/jPkVat66IVKkmtAsy0DJ"),
			network_id: 1,
			gas: 4e6,
			gasPrice: 5e9
		},
		"ropsten": {
			provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/jPkVat66IVKkmtAsy0DJ"),
			network_id: 3,
			gas: 4e6,
			gasPrice: 80e9
		}
	}
};