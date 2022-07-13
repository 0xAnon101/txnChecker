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
      setTimeout(async () => {
        try {
          const txn = await this.web3.getTransaction(txnHash);
          if (txn !== null && txn.to !== null) {
            if (this.accounts === txn.from.toLowerCase()) {
              // dumps the data onto the CLI
              console.log({
                address: txn.from,
                value: ethers.utils.formatEther(txn.value),
                timestamp: new Date(),
                txnHash: txn.hash,
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
