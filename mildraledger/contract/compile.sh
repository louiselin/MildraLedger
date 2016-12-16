#!/bin/bash
SOURCE_FILE="MildraLedger.sol"
solc --bin --optimize -o `pwd` $SOURCE_FILE
solc --abi -o `pwd` $SOURCE_FILE


