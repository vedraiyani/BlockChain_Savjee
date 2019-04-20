const SHA256 = require("crypto-js/sha256");

// var fs = require("fs");

// fs.readFileSync("coin.key", function(err, buf) {
//   console.log(buf.toString());
// });

// Import elliptic
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Create key object
const myKey = ec.keyFromPrivate('7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf');
const myWalletAddress = myKey.getPublic('hex');


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

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
    
        return true;
    }
}

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount)
                .toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }
    
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;
      
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }
    
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
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

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must include from and to address');
        }
    
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }
    
        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {
        // Send the mining reward
        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward));
        // Create new block with all pending transactions and mine it..
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);
    
        // Add the newly mined block to the chain
        this.chain.push(block);

        // Reset the pending transactions and send the mining reward
        this.pendingTransactions=[];
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
        return new Block("01/01/2017", [], "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    isChainValid(){
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
        
            // Recalculate the hash of the block and see if it matches up.
                // This allows us to detect changes to a single block
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        
            // Check if this block actually points to the previous block (hash)
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
        }
        
          // Check the genesis block
        if(JSON.stringify(this.chain[0]) !== JSON.stringify(this.createGenesisBlock())){
            return false;
        }
          
        // If we managed to get here, the chain is valid!
        return true;
    }

}

// Create new instance of Blockchain class
const savjeeCoin = new Blockchain();

// Make a transaction
const tx1 = new Transaction(myWalletAddress, 'public key of recipient', 10);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);
console.log('Balance of xavier is', savjeeCoin.getBalanceOfAddress(myWalletAddress));

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');

// Tampering
savjeeCoin.chain[1].transactions[0].amount = 20;//genesis->block->null

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');