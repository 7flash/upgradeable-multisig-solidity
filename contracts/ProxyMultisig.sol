pragma solidity ^0.4.23;

import "./MultisigState.sol";
import "./MultisigWallet.sol";
import "./StateContainer.sol";

contract ProxyMultisig is StateContainer {
    function ProxyMultisig(uint256 _required, address[] _owners)
        public
    {
        require(_required <= _owners.length);

        address previousOwner = address(0);
        for(uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] > previousOwner);
            previousOwner = _owners[i];
        }

        address methods = new MultisigWallet();
        state = new MultisigState(_required, _owners, methods);
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