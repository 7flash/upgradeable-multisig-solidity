pragma solidity ^0.4.23;

import "./State.sol";
import "./StateContainer.sol";

contract UpgradeableMultisig is StateContainer {
    function UpgradeableMultisig(uint256 _required, address[] _owners, address _methods)
        public
    {
        state = new State(_required, _owners, _methods);
    }

    function () payable public {
        address _currentMethods = state.methods();
        bytes memory data = msg.data;

        assembly {
          let result := delegatecall(gas, _currentMethods, add(data, 0x20), mload(data), 0, 0)
          let size := returndatasize
          let ptr := mload(0x40)
          returndatacopy(ptr, 0, size)
          switch result
          case 0 { revert(ptr, size) }
          default { return(ptr, size) }
        }
    }
}