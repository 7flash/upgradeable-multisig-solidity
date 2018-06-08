pragma solidity ^0.4.23;

contract State {
    uint256 nonce;
    mapping (address => bool) isOwner;

    uint256 public required;
    address[] public owners;

    address public methods;

    function State(uint256 _required, address[] _owners) public {
        required = _required;
        owners = _owners;

        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }
    }
}