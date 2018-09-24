const SHA256 = require("crypto-js/sha256");

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    constructor(timestamp, transactions, prevhash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = prevhash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block Mined: " + this.hash + "  nonce:" + this.nonce);
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 3;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block("01/01/18", [], "0");
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLastBlock().hash;
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);
        
        //pass all pending transaction ;block cannot exceed 1MB
        let block = new Block(Date.now(), this.pendingTransactions, this.getLastBlock().hash);
        block.mineBlock(this.difficulty);
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){

                //Reduce amount if from account is own
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainValid() {
        //ignore block 0 (genesis block)
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let jayCoin = new BlockChain();

jayCoin.createTransaction(new Transaction('Bob', 'Alice', 75));
jayCoin.createTransaction(new Transaction('Alice', 'Charlie', 50));
jayCoin.createTransaction(new Transaction('Alice', 'Bob', 48));
jayCoin.createTransaction(new Transaction('Charlie', 'Bob', 30));

console.log("BOB MINES");
jayCoin.minePendingTransactions('Bob');

console.log("CHARLIE MINES");
jayCoin.minePendingTransactions('Charlie');


console.log("BALANCE BOB:",jayCoin.getBalanceOfAddress('Bob'));
console.log("BALANCE ALICE:",jayCoin.getBalanceOfAddress('Alice'));
console.log("BALANCE CHARLIE:",jayCoin.getBalanceOfAddress('Charlie'));

//console.log(JSON.stringify(jayCoin,null,4));
