const SHA256 = require("crypto-js/sha256");

class Block{
    constructor(timestamp, data, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
            
        // When creating a new Block, automatically calculate its hash.
        this.hash = this.calculateHash();
    }
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}



class Blockchain{
    constructor() {
      this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block("01/01/2017", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){

        // The new block needs to point to the hash of the latest block on the chain.
        newBlock.previousHash = this.getLatestBlock().hash;
        
        // Calculate the hash of the new block
        newBlock.hash = newBlock.calculateHash();
    
        // Now the block is ready and can be added to chain!
        this.chain.push(newBlock);
    }

}

let savjeeCoin = new Blockchain();

savjeeCoin.addBlock(new Block("20/07/2017", { amount: 4 }));
savjeeCoin.addBlock(new Block("22/07/2017", { amount: 10 }));

console.log(JSON.stringify(savjeeCoin, null, 4));