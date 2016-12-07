var path = require( 'path' );
var appRoot = require( 'app-root-path' );
var projectName = 'MildraLedger';

module.exports = {
    contractAddress: '0x5f74a44397856f45d5af78dc25099ddd15a40b1d',
    rootAddress: '1fea7682907a6b74624f1bd85dcb0ec6360151b2',
    rootAddressPassword: 'a',
    sourceFile: appRoot + '/contract/' + projectName + '.sol',
    abiFile: appRoot + '/contract/' + projectName + '.abi',
    binaryFile: appRoot + '/contract/' + projectName + '.bin',
};
