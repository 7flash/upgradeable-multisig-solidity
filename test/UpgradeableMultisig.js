const expect = require("chai")
	.use(require("chai-as-promised"))
	.use(require("chai-bignumber")(web3.BigNumber))
	.expect;

const UpgradeableMultisig = artifacts.require("UpgradeableMultisig");
const State = artifacts.require("State");
const Methods = artifacts.require("Methods");
const Methods2 = artifacts.require("MethodsUpgradedExample");

const EthCrypto = require("eth-crypto");

const firstOwner = EthCrypto.createIdentity();
const secondOwner = EthCrypto.createIdentity();
const thirdOwner = EthCrypto.createIdentity();

function extend(obj1, obj2) {
	Object.keys(obj2).forEach(function(key) {
		if (!(key in obj1)) {
			obj1[key] = obj2[key];
		}
	});
}

contract("UpgradeableMultisig", function([deployer, destination]) {
	describe("2 of 3", () => {
		before(async function() {
			this.value = web3.toWei(new web3.BigNumber(0.0001), "ether");

			this.owners = [firstOwner, secondOwner, thirdOwner];

			this.owners.sort();

			const ownerAddresses = this.owners.map((owner) => owner.address);

			this.methods = await Methods.new();
			this.methods2 = await Methods2.new();

			this.multisig = await UpgradeableMultisig.new(2, ownerAddresses, this.methods.address);

			// extend multisig ABI with methods ABI
			Object.assign(this.multisig, Methods.at(this.multisig.address));

			await this.multisig.sendTransaction({ from: deployer, value: this.value });
		});

		it("should be initialized correctly", async function() {
			expect(await State.at(await this.multisig.state()).owners(0)).to.be.bignumber.equal(this.owners[0].address);
			expect(await State.at(await this.multisig.state()).owners(1)).to.be.bignumber.equal(this.owners[1].address);
			expect(await State.at(await this.multisig.state()).owners(2)).to.be.bignumber.equal(this.owners[2].address);
			expect(await State.at(await this.multisig.state()).required()).to.be.bignumber.equal(2);
			expect(web3.eth.getBalance(this.multisig.address)).to.be.bignumber.equal(this.value);
		});

		it("should execute transaction signed by 2 of 3 owners", async function() {
			const destinationBalanceBefore = await web3.eth.getBalance(destination);

			const data = "0x";

			let vArr = [], rArr = [], sArr = [];

			for (let i = 0; i < this.owners.length - 1; i++) {
				const hash = EthCrypto.hash.keccak256([
					{
						type: "bytes",
						value: "0x19"
					},
					{
						type: "address",
						value: this.multisig.address
					},
					{
						type: "address",
						value: destination
					},
					{
						type: "uint256",
						value: this.value
					},
					{
						type: "bytes",
						value: data
					},
					{
						type: "uint256",
						value: 0
					}
				]);

				const signature = EthCrypto.sign(this.owners[i].privateKey, hash);

				const vrs = EthCrypto.vrs.fromString(signature);

				vArr.push(vrs.v);
				rArr.push(vrs.r);
				sArr.push(vrs.s);
			}

			await this.multisig.execute(vArr, rArr, sArr, destination, this.value, data);

			expect(web3.eth.getBalance(destination)).to.be.bignumber.above(destinationBalanceBefore);
		});

		it("should change implementation when signed by 2 of 3 owners", async function() {
			let vArr = [], rArr = [], sArr = [];

			for (let i = 0; i < this.owners.length - 1; i++) {
				const hash = EthCrypto.hash.keccak256([
					{
						type: "bytes",
						value: "0x19"
					},
					{
						type: "address",
						value: this.multisig.address
					},
					{
						type: "address",
						value: this.methods2.address
					},
					{
						type: "uint256",
						value: 1
					}
				]);

				const signature = EthCrypto.sign(this.owners[i].privateKey, hash);

				const vrs = EthCrypto.vrs.fromString(signature);

				vArr.push(vrs.v);
				rArr.push(vrs.r);
				sArr.push(vrs.s)
			}

			await this.multisig.upgrade(vArr, rArr, sArr, this.methods2.address);

			Object.assign(this.multisig, Methods2.at(this.multisig.address));

			expect(await this.multisig.getMultipliedNonce()).to.be.bignumber.equal(2*2);
		})
	});
});