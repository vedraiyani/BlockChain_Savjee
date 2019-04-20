const SHA256 = require("crypto-js/sha256");

class Block{
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        // Keep changing the nonce until the hash of our block starts with enough zero's.
        while (!this.hash.startsWith(Array(difficulty + 1).join("0"))) {
            // while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
          this.nonce++;
          this.hash = this.calculateHash();
        }
          
        console.log("BLOCK MINED: " + this.hash);
    }
}

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;

        // Place to store transactions in between block creation
        this.pendingTransactions = [];

        // How many coins a miner will get as a reward for his/her efforts
        this.miningReward = 100;
    }

    createTransaction(transaction) {
        // There should be some validation here!
    
        // Push into onto the "pendingTransactions" array
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {
        // Create new block with all pending transactions and mine it..
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
    
        // Add the newly mined block to the chain
        this.chain.push(block);
    
        // Reset the pending transactions and send the mining reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    getBalanceOfAddress(address){
        let balance = 0; // you start at zero!
    
        // Loop over each block and each transaction inside the block
        for(const block of this.chain){
            for(const trans of block.transactions){
    
                // If the given address is the sender -> reduce the balance
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }
    
                // If the given address is the receiver -> increase the balance
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
    
        return balance;
    }

    createGenesisBlock(){
        return new Block("01/01/2017", "Genesis block", "0");
    }

    // getLatestBlock(){
    //     return this.chain[this.chain.length - 1];
    // }

    // addBlock(newBlock){

    //     // The new block needs to point to the hash of the latest block on the chain.
    //     newBlock.previousHash = this.getLatestBlock().hash;
        
    //     newBlock.mineBlock(this.difficulty);
    
    //     // Now the block is ready and can be added to chain!
    //     this.chain.push(newBlock);
    // }

    // isChainValid(){
    //     for (let i = 1; i < this.chain.length; i++){
    //         const currentBlock = this.chain[i];
    //         const previousBlock = this.chain[i - 1];
        
    //         // Recalculate the hash of the block and see if it matches up.
    //             // This allows us to detect changes to a single block
    //         if (currentBlock.hash !== currentBlock.calculateHash()) {
    //             return false;
    //         }
        
    //         // Check if this block actually points to the previous block (hash)
    //         if (currentBlock.previousHash !== previousBlock.hash) {
    //             return false;
    //         }
    //     }
        
    //       // Check the genesis block
    //     if(JSON.stringify(this.chain[0]) !== JSON.stringify(this.createGenesisBlock())){
    //         return false;
    //     }
          
    //     // If we managed to get here, the chain is valid!
    //     return true;
    // }

}

let savjeeCoin = new Blockchain();

console.log('Creating some transactions...');
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
savjeeCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('Starting the miner...');
savjeeCoin.minePendingTransactions('xaviers-address');

console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));

console.log('Starting the miner again!');
savjeeCoin.minePendingTransactions("xaviers-address");

console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));
// Output: 100

console.log('Starting the miner again!');
savjeeCoin.minePendingTransactions("xaviers-address");

console.log('Balance of Xaviers address is', savjeeCoin.getBalanceOfAddress('xaviers-address'));
// Output: 200