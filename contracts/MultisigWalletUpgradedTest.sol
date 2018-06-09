pragma solidity ^0.4.23;

import "./StateContainer.sol";

contract MultisigWalletUpgradedTest is StateContainer {
    function getMultipliedNonce()
        public constant returns (uint256)
    {
        return state.nonce() * 2;
    }
}