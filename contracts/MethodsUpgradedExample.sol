pragma solidity ^0.4.23;

import "./State.sol";

contract MethodsUpgradedExample is State {
    // you can pass anything in constructor because multisig store it's own permanent state independently of methods contract state
    function MethodsUpgradedExample(uint256 _required, address[] _owners)
        State(_required, _owners)
        public
    {
    }

    function upgradedMethod()
        public returns (bool)
    {
        return true;
    }
}