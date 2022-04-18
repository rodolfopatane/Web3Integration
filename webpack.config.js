const path = require('path');

module.exports = {
    entry: [
        path.resolve(__dirname, 'node_modules/web3/dist', 'web3.min.js'),
        path.resolve(__dirname, 'src/web3Integration.js')
    ],
    output: {
        filename: './dist/web3Integration.js',
    }
}