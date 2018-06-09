## Upgradeable Multisig Wallet
Multisig wallet have to make storing the funds more secure, also it may implement complex logic for funds management.
It has a flaw because the more logic becomes complicated the more probability for vulnerabilities increases.

The solution is to make multisig wallet upgradeable. That way the owners can change the functionality by their agreement.

### Architecture

### ProxyMultisig.sol

Main contract store the address of permanent state. Delegate calls to replaceable wallet contract.

### MultisigState.sol

Permanent state store constant fields, increasing nonce, and the address of wallet contract that can be changed.

### MultisigWallet.sol

Implementation of multisig wallet that execute transactions confirmed with detached signatures of owners.

## Testing
```
npm install -g truffle
npm install
truffle test
```
## Deployment

1) Edit config.json (set owners and required field)
2) Run migration to deploy contracts
```
truffle migrate --network ropsten -f 2

```

## Upgrade
1) Prepare new version of MultisigWalletUpgradedTest.sol
2) Collect signatures from owners and set `signatures` field at config.json
3) Run migration to deploy prepared version of methods and call method to change wallet in proxy
```
truffle migrate --network ropsten -f 3
```

## Ropsten example

## Limitations
- State has predefined structure
- Owners cannot add/remove owner