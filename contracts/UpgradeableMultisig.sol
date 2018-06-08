pragma solidity ^0.4.23;

contract UpgradeableMultisig {
    uint256 nonce;
    mapping (address => bool) isOwner;

    uint256 public required;
    address[] public owners;

    function UpgradeableMultisig(uint256 _required, address[] _owners) public {
        required = _required;
        owners = _owners;

        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
    }

    function execute(uint8[] v, bytes32[] r, bytes32[] s, address destination, uint256 value, bytes data) public {
        require(v.length == required);
        require(v.length == r.length && r.length == s.length);

        bytes32 hash = keccak256(byte(0x19), byte(0), this, destination, value, data, nonce);

        for (uint i = 0; i < required; i++) {
            address sender = ecrecover(hash, v[i], r[i], s[i]);
            //require(isOwner[sender] == true);
        }

        nonce = nonce + 1;

        require(destination.call.value(value)(data));
    }

    function () public payable {}
}