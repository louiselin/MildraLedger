var path = require( 'path' );
var appRoot = require( 'app-root-path' );
var projectName = 'MildraLedger';

module.exports = {
    contractAddress: '0x49f7b3437c3881705c1a57df184c0da4f62f7f14',
    rootAddress: '0xb86d83929219cc8e52c854fc7cabe4fd30435948',
    rootAddressPassword: 'a',
    sourceFile: appRoot + '/contract/' + projectName + '.sol',
    abiFile: appRoot + '/contract/' + projectName + '.abi',
    binaryFile: appRoot + '/contract/' + projectName + '.bin',
};
