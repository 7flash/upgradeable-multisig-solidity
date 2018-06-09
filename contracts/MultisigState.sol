pragma solidity ^0.4.23;

contract MultisigState {
    uint256 public nonce;
    mapping (address => bool) public isOwner;

    uint256 public required;
    address[] public owners;

    address public methods;

    address public wallet;

    modifier onlyWallet() {
        require(msg.sender == wallet);
        _;
    }

    function MultisigState (uint256 _required, address[] _owners, address _methods)
        public
    {
        assert(msg.sender != tx.origin);

        wallet = msg.sender;

        required = _required;
        owners = _owners;

        for (uint256 i = 0; i < _owners.length; i++) {
            isOwner[_owners[i]] = true;
        }

        methods = _methods;
    }

    function incrementNonce()
        public onlyWallet
    {
        nonce = nonce + 1;
    }

    function changeMethods(address _newContract)
        public onlyWallet
    {
        methods = _newContract;
    }
}