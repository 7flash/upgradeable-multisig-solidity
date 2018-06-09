const ProxyMultisig = artifacts.require("ProxyMultisig");
const MultisigState = artifacts.require("MultisigState");
const MultisigWallet = artifacts.require("MultisigWallet");

const { required, owners } = require("../config.json");

module.exports = function(deployer, network, accounts) {
	if(network === 'develop') return;

	console.log("Owners: ");
	console.log(owners);

	deployer.then(function() {
		return deployer.deploy(ProxyMultisig, required, owners);
	}).then(function(multisig) {
		console.log(`Multisig deployed at ${multisig.address}`);

		return multisig.state();
	}).then(function(state) {
		console.log(`State deployed at ${state}`);

		return MultisigState.at(state).methods();
	}).then(function(methods) {
		console.log(`Methods deployed at ${methods}`);

		console.log(`Congratulations!`);
		console.log(`You can send transaction by calling "execute" method with signatures of owners as argument`);
	});
}