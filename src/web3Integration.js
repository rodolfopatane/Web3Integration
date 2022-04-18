export class Web3Integration {
    web3
    constructor(provider) {
        this.web3 = new Web3(provider)
    }

    // retorna uma instancia do contrato
    loadContract = (abiInterface, contractAddress) => {
        return new this.web3.eth.Contract(abiInterface, contractAddress)
    }

    // retorna nonce do usuario
    getNonce = async (userAddress) => {
        return this.web3.utils.toHex(await this.web3.eth.getTransactionCount(userAddress))
    }

    // retorna gasprice
    getGasPrice = async () => {
        this.web3.utils.toHex(await this.web3.eth.getGasPrice())
    }

    // retorna hex
    getGasLimit = async (limit) => {
        return this.web3.utils.toHex(limit)
    }

    // aguarda transação ser minerada
    getTransactionReceiptMined = (txHash) => {
        const transactionReceiptAsync = (resolve, reject) => {
            this.web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
                if (error) {
                    reject(error)
                } else if (receipt == null) {
                    setTimeout(
                        () => transactionReceiptAsync(resolve, reject),
                        500)
                } else {
                    resolve(receipt)
                }
            })
        }

        if (Array.isArray(txHash)) {
            return Promise.all(txHash.map(
                oneTxHash => this.getTransactionReceiptMined(oneTxHash, interval)))
        } else if (typeof txHash === `string`) {
            return new Promise(transactionReceiptAsync)
        } else {
            throw new Error(`Invalid Hash: ${txHash}`)
        }
    }

    // monta a tx para ser enviada    
    createTxObject = async (contractAbi, contractAddress, ownerAddress, method, gasLimit, ...paramsOfMethod) => {
        return {
            to: contractAddress,
            from: ownerAddress,
            nonce: await this.getNonce(ownerAddress),
            gasLimit: await this.getGasLimit(gasLimit),
            gasPrice: await this.getGasPrice(),
            data: await this.loadContract(contractAbi, contractAddress).methods[method](...paramsOfMethod).encodeABI()
        }
    }

    sendToWallet = async (wallet, txObject) => {
        return wallet.request({
            method: `eth_sendTransaction`,
            params: [txObject]
        })
    }

    getWalletPermission = async (wallet) => {
        await wallet.request({
            method: `wallet_requestPermissions`,
            params: [{
                eth_accounts: {}
            }]
        })
        return ethereum.request({ method: `eth_accounts` })
    }

    getNetWork = async () => {
        return new Promise((resolve, reject) => {
            this.web3.eth.getChainId((err, netId) => {
                console.log(netId)
                switch (netId) {
                    case 44787:
                        resolve('Celo (Alfajores Testnet) - ID 44787')
                        break
                    case 42220:
                        resolve('Celo (Mainnet) - ID 42220')
                        break
                    default:
                        resolve('ID ' + netId)
                }

            })
        })

    }
}