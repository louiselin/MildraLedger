var path = require( 'path' );
var appRoot = require( 'app-root-path' );
var projectName = 'MildraLedger';

module.exports = {
    contractAddress: '0x3d6f70c2d7c6f112afdf19e284eabaa260c7eac0',
    rootAddress: '0x188726339b3d51bc45438dfb2bcceac8e9cc0068',
    rootAddressPassword: 'a',
    sourceFile: appRoot + '/contract/' + projectName + '.sol',
    abiFile: appRoot + '/contract/' + projectName + '.abi',
    binaryFile: appRoot + '/contract/' + projectName + '.bin',
};
