pragma solidity ^0.4.23;

import "./State.sol";

contract Methods is State {
    // you can pass anything in constructor because multisig store it's own permanent state independently of methods contract state
    function Methods(uint256 _required, address[] _owners)
        State(_required, _owners)
        public
    {
    }

    function execute(uint8[] v, bytes32[] r, bytes32[] s, address destination, uint256 value, bytes data) public {
        require(v.length == required);
        require(v.length == r.length && r.length == s.length);

        bytes32 hash = keccak256(byte(0x19), this, destination, value, data, nonce);

        for (uint i = 0; i < required; i++) {
            address sender = ecrecover(hash, v[i], r[i], s[i]);
            require(isOwner[sender] == true);
        }

        nonce = nonce + 1;

        require(destination.call.value(value)(data));
    }

    function upgrade(uint8[] v, bytes32[] r, bytes32[] s, address upgradedMethods)
        public
    {
        require(v.length == required);
        require(v.length == r.length && r.length == s.length);

        bytes32 hash = keccak256(byte(0x19), this, upgradedMethods, nonce);

        for (uint i = 0; i < required; i++) {
            address sender = ecrecover(hash, v[i], r[i], s[i]);
            require(isOwner[sender] == true);
        }

        nonce = nonce + 1;

        methods = upgradedMethods;
    }

    function () payable {
    }

//    event Executed(address destination, uint256 value);
//    event Upgraded(address oldContract, address newContract);
}