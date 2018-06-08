pragma solidity ^0.4.23;

import "./State.sol";

contract UpgradeableMultisig is State {
    function UpgradeableMultisig(uint256 _required, address[] _owners, address _methods)
        State(_required, _owners)
        public
    {

        methods = _methods;
    }

    function () payable public {
    }
}