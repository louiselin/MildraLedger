var path = require( 'path' );
var appRoot = require( 'app-root-path' );
var projectName = 'MildraLedger';

module.exports = {
    contractAddress: '0x9ff8dadcdc7e275551f5b2e4080402e9082b86e8',
    rootAddress: '0x54b79c19539df54be25da75eeaed2864d654bceb',
    sourceFile: appRoot + '/contract/' + projectName + '.sol',
    abiFile: appRoot + '/contract/' + projectName + '.abi',
    binaryFile: appRoot + '/contract/' + projectName + '.bin',
};
