const { ethers } = require("ethers");
require("dotenv").config();

class TxnChecker {
  web3 = null;
  accounts = null;

  constructor(projectId, account) {
    this.web3 = new ethers.providers.InfuraProvider("rinkeby", projectId);
    this.accounts = account.toLowerCase();
  }

  async checkBlock() {
    const block = await this.web3.getBlock("latest");
    const blockNumber = block.number;
    console.log(`Searching block ${blockNumber}`);

    if (block !== null && block.transactions !== null) {
      for (let txnHash of block.transactions) {
        let txn = await this.web3.getTransaction(txnHash);

        // check if the to exists
        if (txn.to) {
          const reciever = txn.from.toLowerCase();
          if (reciever === this.accounts) {
            console.log(`Txn found on block: ${blockNumber}`);
            console.log({
              address: txn.from,
              value: ethers.utils.formatEther(txn.value),
              timestamp: new Date(),
            });
          }
        }
      }
    }
  }
}

const checker = new TxnChecker(
  process.env.PROJECT_ID,
  process.argv[2] // target account to track
);

setInterval(() => {
  checker.checkBlock(); // checks the block real time, if the txn is present in that block or not
}, 13000);
