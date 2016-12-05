pragma solidity ^0.4.4;

contract MildraLedger {

    struct UserInfo {
        bool isRegistered;
        uint8 permission;
    }

    uint8 constant CanModifyUser = 4;
    uint8 constant CanModifyLedger = 2;
    uint8 constant CanRead = 1;

    uint8 constant RootPermission = CanModifyUser | CanModifyLedger | CanRead;
    uint8 constant CashierPermission = CanModifyLedger | CanRead;
    uint8 constant UserPermission = CanRead;
    uint8 constant NoPermission = 0;


    event TransactionAddedEvent(address cashier, uint txId);
    event TransactionQueryedEvent(uint txId, uint timestamp, address cashier, uint amount, TransactionTypes txType, string txHash);

    event WriteOffAddedEvent(address cashier, uint writeOffId, uint txId);
    event WriteOffEntityQueryedEvent(uint writeOffId, uint txId, uint timestamp, address cashier, uint amount, TransactionTypes txType, string writeOffHash);

    enum TransactionTypes {
        Income,
        Expenses
    }

    struct Transaction {
        uint txId;                   // Transaction id in database. auto increment
        uint timestamp;              // Transaction creation timestamp in database
        address cashier;             // Who created this transaction
        uint amount;
        TransactionTypes txType;
        // FIXME use hash would be better ?
        string txHash;               // Transaction hash in database.
    }

    struct WriteOffEntity {
        uint writeOffId;
        uint txId;
        uint timestamp;
        address cashier;
        string writeOffHash;     // Transaction hash in database.
    }

    mapping (uint => Transaction) txList;
    uint txCount;

    mapping (uint => WriteOffEntity) writeOffList;
    uint writeOffCount;

    int amount;

    /* Root should not be change. */
    address root;
    address[] userList;
    mapping (address => UserInfo) userInfoMap;

    function MildraLedger() {
        root = msg.sender;
        txCount = 0;
        writeOffCount = 0;
        amount = 0;

        registerUser(root);
        userInfoMap[root].permission = RootPermission;
    }

    function getFastBalance() constant returns (int) {
        return amount;
    }

    function getTransactionCount() constant returns (uint) {
        return txCount;
    }

    function getWriteOffCount() constant returns ( uint) {
        return writeOffCount;
    }

    modifier isRoot() {
        if ( msg.sender != root) {
            throw;
        }
        _;
    }

    modifier isCashier() {
        if (!containsUser(msg.sender) || (getUserPermission(msg.sender) & CanModifyLedger) == 0 ) {
            throw;
        }
        _;
    }

    function containsUser(address addr) private constant returns (bool) {
        return userInfoMap[addr].isRegistered;
    }

    function getUserPermission(address addr) constant returns (uint8) {
        if (!containsUser(addr)) {
            throw;
        }
        return userInfoMap[addr].permission;
    }

    function changeUserPermission(address addr, uint8 _permission) isRoot returns (uint8){
        UserInfo info = userInfoMap[addr];
        info.permission = _permission;
    }

    function registerUser(address addr) isRoot {
        userInfoMap[addr] = UserInfo({
            isRegistered: true,
            permission: UserPermission
        });
    }

    function registerUsers(address[] addrs) isRoot {
        uint len = addrs.length;
        for (uint i = 0; i < len; ++i){
            userInfoMap[addrs[i]] = UserInfo({
                isRegistered: true,
                permission: UserPermission
            });
        }
    }

    function registerUser(address addr, uint8 _permission) isRoot {
        userInfoMap[addr] = UserInfo({
            isRegistered: true,
            permission: _permission
        });
    }

    function unregisterUser(address addr) isRoot {
        if (!containsUser(addr)){
            return;
        }

        if (root == addr) {
            throw;
        }

        userInfoMap[addr] = UserInfo({
            isRegistered: false,
            permission: NoPermission
        });
    }

    function activateUser(address addr) isRoot {
        if (!containsUser(addr)){
            return;
        }
        userInfoMap[addr].permission = UserPermission;
    }

    function activateUser(address addr, uint8 permission) isRoot {
        if (!containsUser(addr)){
            return;
        }
        userInfoMap[addr].permission = permission;
    }

    function deactivateUser(address addr) isRoot {
        if (!containsUser(addr)){
            return;
        }
        userInfoMap[addr].permission = NoPermission;
    }


    function getBalance() constant returns (int) {
        if (!containsUser(msg.sender) || (getUserPermission(msg.sender) & CanRead) == 0 ) {
            throw;
        }

        int amount = 0;
        uint length = txCount;
        uint i;
        int value;

        Transaction memory tx;
        for (i = 0; i < length; ++i ){
            tx = txList[i];
            value = int(tx.amount);
            amount += (tx.txType == TransactionTypes.Income)
                ? value
                : -value;
        }

        length = writeOffCount;
        WriteOffEntity memory entity;
        for (i = 0; i < length; ++i){
            entity = writeOffList[i];
            tx = txList[entity.txId];
            value = int(tx.amount);
            amount += (txList[i].txType == TransactionTypes.Income)
                ? -value
                : value;
        }

        return amount;
    }

    function addTransaction(uint _txId, uint _timestamp, uint _amount, TransactionTypes _txType, string _txHash) isCashier returns (uint) {
        if ( _txId != txCount || _amount == 0){
            throw;
        }

        if ( _txType == TransactionTypes.Income) {
            amount += int(_amount);
        } else if ( _txType == TransactionTypes.Expenses) {
            amount -= int(_amount);
        } else {
            throw;
        }

        txList[txCount] = Transaction ({
            timestamp: _timestamp,
            cashier: msg.sender,
            amount: _amount,
            txType: _txType,
            txId: _txId,
            txHash: _txHash
        });

        TransactionAddedEvent(msg.sender, _txId);
        return txCount++;
    }

    function queryTransaction(uint _txId) constant returns (
        uint timestamp,
        address cashier,
        uint amount,
        TransactionTypes txType,
        string txHash
        ) {

        if ( _txId >= txCount ) {
            throw;
        }

        Transaction memory tx = txList[_txId];

        timestamp = tx.timestamp;
        amount = tx.amount;
        txType = tx.txType;
        txHash = tx.txHash;
        cashier = tx.cashier;

    }

    function addWriteOffEntity(
        uint _writeOffId,
        uint _txId,
        uint _timestamp,
        string _writeOffHash) isCashier returns (uint) {

        if ( _writeOffId != writeOffCount) {
            throw;
        }

        Transaction memory tx = txList[_txId];
        if ( tx.amount == 0 ){
            throw;
        }

        if ( tx.txType == TransactionTypes.Income) {
            amount -= int(tx.amount);
        } else if ( tx.txType == TransactionTypes.Expenses) {
            amount += int(tx.amount);
        } else {
            throw;
        }

        writeOffList[writeOffCount] = WriteOffEntity({
            writeOffId: _writeOffId,
            txId: _txId,
            timestamp: _timestamp,
            cashier: msg.sender,
            writeOffHash: _writeOffHash
        });

        WriteOffAddedEvent(msg.sender, _writeOffId, _txId);
        return writeOffCount++;
    }

    function queryWriteOffEntity(uint _writeOffId) constant returns (
        uint timestamp,
        address cashier,
        uint amount,
        uint txId,
        TransactionTypes txType,
        string writeOffHash
    ) {
        if ( _writeOffId >= writeOffCount) {
            throw;
        }

        WriteOffEntity memory wo = writeOffList[_writeOffId];
        txId = wo.txId;
        Transaction memory tx = txList[txId];

        timestamp = wo.timestamp;
        cashier = wo.cashier;
        amount = tx.amount;
        txType = tx.txType;
        writeOffHash = wo.writeOffHash;

    }
}
