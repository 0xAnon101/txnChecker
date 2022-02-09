const { ethers } = require("ethers");
require("dotenv").config();

class TxnChecker {
  web3 = null;
  accounts = null;
  subscription = null;

  constructor(projectId, account) {
    this.web3 = new ethers.providers.WebSocketProvider(
      `wss://rinkeby.infura.io/ws/v3/${projectId}`
    );
    this.accounts = account.toLowerCase();
  }

  subscribe(topic) {
    this.web3.on(topic, async (txnHash) => {
      setTimeout(async () => {
        try {
          const txn = await this.web3.getTransaction(txnHash);
          if (txn !== null) {
            console.log(`txn from: ${txn.from}`);
            if (this.accounts === txn.to.toLowerCase()) {
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
      }, 60000);
    });
  }
}

const checker = new TxnChecker(
  process.env.PROJECT_ID,
  process.argv[2] // target account to track
);

checker.subscribe("pending");
