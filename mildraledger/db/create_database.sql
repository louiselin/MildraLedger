DROP DATABASE IF EXISTS mildraledger;
CREATE DATABASE mildraledger;

USE mildraledger;

CREATE TABLE users
(
    user_id int NOT NULL AUTO_INCREMENT,
    account varchar(200) NOT NULL,
    password varchar(200) NOT NULL,
    eth_address varchar(50) ,
    permission int NOT NULL DEFAULT 1,
    registration_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_time datetime NOT NULL,
    PRIMARY KEY (user_id),
    UNIQUE(user_id),
    UNIQUE(account),
    UNIQUE(eth_address)
) ENGINE = INNODB CHARACTER SET = utf8;

CREATE TABLE transactions
(
    tx_id int NOT NULL,
    tx_type int NOT NULL,
    cashier_address varchar(100) NOT NULL,
    amount int NOT NULL,
    timestamp BIGINT NOT NULL,
    description varchar(100) NOT NULL,
    valid bool NOT NULL DEFAULT TRUE,
    PRIMARY KEY(tx_id),
    UNIQUE(tx_id)
) ENGINE = INNODB CHARACTER SET = utf8;

CREATE TABLE writeoffs
(
    tx_id int NOT NULL,
    writeoff_id  int NOT NULL,
    cashier_address varchar(100) NOT NULL,
    description varchar(200) NOT NULL,
    timestamp BIGINT NOT NULL,
    UNIQUE(writeoff_id),
    UNIQUE(tx_id),
    FOREIGN KEY (tx_id) REFERENCES transactions(tx_id)
) ENGINE = INNODB CHARACTER SET = utf8;
