const EthCrypto = require("eth-crypto");

const MultisigWalletUpgraded = artifacts.require("MultisigWalletUpgraded");
const ProxyMultisig = artifacts.require("ProxyMultisig");

const { upgradeSignatures } = require("../config.json");

module.exports = function(deployer, network, accounts) {
	if(network === 'develop') return;

	let vArr = [], rArr = [], sArr = [];

	for(let i = 0; i < upgradeSignatures.length; i++) {
		const vrs = EthCrypto.vrs.fromString(upgradeSignatures[i]);
		vArr.push(vrs.v);
		rArr.push(vrs.r);
		sArr.push(vrs.s);
	}

	let newMethods;
	let proxy;

	deployer.then(function() {
		return deployer.deploy(MultisigWalletUpgraded);
	}).then(function(wallet) {
		console.log(`Wallet deployed at ${wallet.address}`);

		newMethods = wallet;

		return ProxyMultisig.deployed();
	}).then(function(proxy) {
		Object.assign(proxy, MultisigWalletUpgraded.at(proxy.address));

		return proxy.upgrade(vArr, rArr, sArr, newMethods.address);
	}).then(function() {
		console.log(`${proxy.address} upgraded to ${netMethods.address}`);
	});
}