
# MildraLedger
### 智能合約x記帳系統

```sh
$ cd Scontract/server
$ npm install 
$ node app.js
```

### 初步使用者介面

```sh
$ cd FirstUI
$ open main.html
```

### 整合使用者介面和智能合約
更新資料庫 > @server/db/create_database.sql
(記得之後再修改再再 config>databse.js 內容資訊)

```sh
$ cd mildraledger/server
$ npm install
$ npm start
```


# Smart Contract
 本節將說明一智能合約範例，透過建構一個合約來允許不同權限的人進行團裡資金記錄。

### 權限/user management

- 角色

|    權限    | user management |
| ---------- | --- |
|    Root (admin)    | 用user address，在deploy決定，不能修改 |
| Cashier |  記帳人員 |
| NormalUser   |  一般使用者 |

- 使用者管理

|    權限    | user.permission  |
| ---------- | --- |
|    isRoot()  | CanModifyUser | CanModifyLedge | CanRead   |
| isCashier() |  CanModifyLedge | CanRead |
| isNormalUser() |  CanRead   |

   ** CanModifyUser = 4, CanModifyLedge = 2, CanRead = 1, like files access permission on linux kernel(r=4, w=2, x=1)
= > if(!(Permission & 4) == 0) user.permission=CanModifyUser

- 管理成員

|        | 敘述 |
| ---------- | --- |
|    register(address)  | 加成員  |
| unregister(address) |  去除成員 |

   ** contract 本身並不自動產生address，由前、後端產生（address=user，而user會被權限控制）

- 管理成員

|        | 敘述 |
| ---------- | --- |
|  activate(address) | 解凍成員  |
| deactivate(address) | 凍結成員原有權限，連看都不能看 |


### 交易
- 定義Transaction內容參數

|  參數   | 參數敘述 |
| ---------- | --- |
|  Timestamp | 記錄前端傳來的時間值 |
| User Address(Cashier) | 擁有修改帳本的權限(user.permission=CanModifyLedge)的使用者address |
|  Amount | 金額 |
| Transaction Type(txType) | 有分收入(Income)/支出(Expenses) |
| txId | 資料庫每筆交易的id |
| hashCode | 將資料庫整筆交易(row)Hash過，其內容包含交易名目、交易時間與交易金額等資訊 |

- 沖消（處理壞帳）
** WriteOffEntity
txId, writeId, timestamp, cashier, hashCode
** addWriteOffEntity
** queryWriteOffEntity

- addTransaction
** 權限判斷：msg.sender = CanModifyLedge
** Transaction, to return index++, that adding a transaction. 	

- queryTransaction
** using txId to return the data about transction record(timestamp, address user -> cashier, TransactionType(Income or Expenses), txHash, amount)


### 架構
** 在改變任何功能，是先寫入Smart Contract，再寫入資料庫


![系統架構](https://github.com/louiselin/MildraLedger/blob/master/Screenshot/structure.png)


### UI
** 角色：NormalUser、Cashier、Root

![系統流程](https://github.com/louiselin/MildraLedger/blob/master/Screenshot/ui.png)

