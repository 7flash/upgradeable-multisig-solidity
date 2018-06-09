const EthCrypto = require("eth-crypto");

const privateKeys = [
	"0x0da5431e85e71fe5ab27ae46a7d2a5ae8545e6b0557612bcd8c2042206be726b",
	"0x45fc86d828fffd6c249998373b31d7b231b859ecc26b3beda2534c62b5326127",
	"0x6a9637f3856eab377be9eb934366e0adc559cb041c72cef2c1484fbfa0c78014"
];

const proxy = "0xa8a02f705445551e60cd51817451db5a62e7895e";
const methods = "0x8df9242b6f115b15f417d0ae623182ef7b65581c";

const signatures = privateKeys.map((ownerPrivateKey) => {
	const hash = EthCrypto.hash.keccak256([
		{
			type: "bytes",
			value: "0x19"
		},
		{
			type: "address",
			value: proxy
		},
		{
			type: "address",
			value: methods
		},
		{
			type: "uint256",
			value: 0
		}
	]);

	return EthCrypto.sign(ownerPrivateKey, hash);
});

console.log(signatures);

const vrsArray = signatures.map((signature) => {
	return EthCrypto.vrs.fromString(signature);
});

console.log(vrsArray);