const expect = require("chai")
	.use(require("chai-as-promised"))
	.use(require("chai-bignumber")(web3.BigNumber))
	.expect;

const ProxyMultisig = artifacts.require("ProxyMultisig");
const State = artifacts.require("MultisigState");
const Methods = artifacts.require("MultisigWallet");
const Methods2 = artifacts.require("MultisigWalletUpgraded");

const EthCrypto = require("eth-crypto");

const firstOwner = EthCrypto.createIdentity();
const secondOwner = EthCrypto.createIdentity();
const thirdOwner = EthCrypto.createIdentity();

contract("UpgradeableMultisig", function([deployer, destination]) {
	describe("2 of 3", () => {
		before(async function() {
			this.value = web3.toWei(new web3.BigNumber(0.0001), "ether");

			this.owners = [firstOwner, secondOwner, thirdOwner];

			// for cheap duplicates check
			this.owners.sort((a, b) => a.address - b.address);

			const ownerAddresses = this.owners.map((owner) => owner.address);

			this.methods2 = await Methods2.new();

			this.multisig = await ProxyMultisig.new(2, ownerAddresses);

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

			for (let i = 0; i < this.owners.length - 1; i++) {
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

			for (let i = 0; i < this.owners.length - 1; i++) {
				const signature = EthCrypto.sign(this.owners[i].privateKey, hash);

				const vrs = EthCrypto.vrs.fromString(signature);

				vArr.push(vrs.v);
				rArr.push(vrs.r);
				sArr.push(vrs.s)
			}

			await this.multisig.upgrade(vArr, rArr, sArr, this.methods2.address);

			Object.assign(this.multisig, Methods2.at(this.multisig.address));

			expect(await this.multisig.newMethod()).to.be.equal(true);
		});

		it("should fail to execute transaction signed twice by the same owner", async function() {
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
					value: "0x"
				},
				{
					type: "uint256",
					value: "2"
				}
			]);

			const signature = EthCrypto.sign(this.owners[0].privateKey, hash);
			const vrs = EthCrypto.vrs.fromString(signature);

			const vArr = [vrs.v, vrs.v];
			const rArr = [vrs.r, vrs.r];
			const sArr = [vrs.s, vrs.s];

			try {
				await this.multisig.execute(vArr, rArr, sArr, destination, this.value, "0x");
			} catch(e) {
				return;
			}

			expect.fail("Expected throw but executed successfuly");
		});
	});
});