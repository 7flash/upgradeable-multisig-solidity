pragma solidity ^0.4.23;

import "./StateContainer.sol";

contract MultisigWalletUpgraded is StateContainer {
    function newMethod()
        public constant returns (bool)
    {
        return true;
    }

    function execute(uint8[] v, bytes32[] r, bytes32[] s, address destination, uint256 value, bytes data) public {
        require(v.length == state.required());
        require(v.length == r.length && r.length == s.length);

        bytes32 hash = keccak256(byte(0x19), this, destination, value, data, state.nonce());

        address previousSender = address(0);
        for (uint i = 0; i < state.required(); i++) {
            address sender = ecrecover(hash, v[i], r[i], s[i]);

            require(sender > previousSender);
            require(state.isOwner(sender) == true);

            previousSender = sender;
        }

        state.incrementNonce();

        if (destination.call.value(value)(data)) {
            emit FailedExecution(destination, value);
        } else {
            emit SuccessfulExecution(destination, value);
        }
    }

    function upgrade(uint8[] v, bytes32[] r, bytes32[] s, address upgradedMethods)
        public
    {
        require(v.length == state.required());
        require(v.length == r.length && r.length == s.length);

        bytes32 hash = keccak256(byte(0x19), this, upgradedMethods, state.nonce());

        address previousSender = address(0);
        for (uint i = 0; i < state.required(); i++) {
            address sender = ecrecover(hash, v[i], r[i], s[i]);

            require(sender > previousSender);
            require(state.isOwner(sender) == true);

            previousSender = sender;
        }

        state.incrementNonce();

        emit Upgraded(state.methods(), upgradedMethods);

        state.changeMethods(upgradedMethods);
    }

    function () payable {
    }

    event FailedExecution(address destination, uint256 value);
    event SuccessfulExecution(address destination, uint256 value);
    event Upgraded(address oldContract, address newContract);
}