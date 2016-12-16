var path = require( 'path' );
var appRoot = require( 'app-root-path' );
var projectName = 'MildraLedger';

module.exports = {
    contractAddress: '0x563b2320ac7acffdfa44c27bcd63fe81ac6ae191',
    rootAddress: '0x23c09f3228b95a162cdfb47a75a4366eac8cd107',
    rootAddressPassword: 'a',
    sourceFile: appRoot + '/contract/' + projectName + '.sol',
    abiFile: appRoot + '/contract/' + projectName + '.abi',
    binaryFile: appRoot + '/contract/' + projectName + '.bin',
};
