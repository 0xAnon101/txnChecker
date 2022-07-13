const { ethers } = require("ethers");
require("dotenv").config();

class TxnChecker {
  web3 = null;
  accounts = null;
  subscription = null;

  constructor(projectId, account) {
    console.log(account);
    this.web3 = new ethers.providers.WebSocketProvider(
      `wss://rinkeby.infura.io/ws/v3/${projectId}`
    );
    if (account) this.accounts = account.toLowerCase();
  }

  subscribe(topic) {
    this.web3.on(topic, async (txnHash) => {
      try {
        const txn = await this.web3.getTransaction(txnHash);
        const block = await this.web3.getBlock("latest");
        const blockNumber = block.number;
        console.log(`Searching block ${blockNumber}`);

        if (txn !== null && txn.to !== null) {
          if (this.accounts === txn.from.toLowerCase()) {
            console.log({
              address: txn.from,
              value: ethers.utils.formatEther(txn.value),
              timestamp: new Date(),
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
}

const checker = new TxnChecker(
  process.env.PROJECT_ID,
  process.argv[2] // target account to track
);

checker.subscribe("pending");
