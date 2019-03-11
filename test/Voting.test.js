const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const { interface, bytecode } = require("../compile");

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let poll;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  poll = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ["2"] })
    .send({ from: accounts[0], gas: "6000000" });

  poll.setProvider(provider);
});

describe("Poll Contract", async () => {
  // Can succesffully deploy
  it("0. Deploys a contract", () => {
    assert.ok(poll.options.address);
  });

  // 1. The contract creator is able to add n choices

  it("1. Can add a choice", async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    const contractChoice = web3.utils.hexToUtf8(await poll.methods.choiceNames(0).call()); //.slice(0,choice.length);
    assert.equal(choice, contractChoice);
  });
  it("1. Can add multiple choices", async () => {
    const choice0 = "Nandos";
    const choice1 = "Maccas";
    const choice2 = "Puddin";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice0)).send({
      from: accounts[0]
    });
    await poll.methods.addChoice(web3.utils.asciiToHex(choice1)).send({
      from: accounts[0]
    });
    await poll.methods.addChoice(web3.utils.asciiToHex(choice2)).send({
      from: accounts[0]
    });
    const contractChoice0 =web3.utils.hexToUtf8( await poll.methods.choiceNames(0).call());
    assert.equal(choice0, contractChoice0);
    const contractChoice1 =web3.utils.hexToUtf8( await poll.methods.choiceNames(1).call());
    assert.equal(choice1, contractChoice1);
    const contractChoice2 =web3.utils.hexToUtf8( await poll.methods.choiceNames(2).call());
    assert.equal(choice2, contractChoice2);
  });

  // 2. Only the contract creator is able to add n choices via deployed contract
  it("2. non-friend cannot add a choice", async () => {
    try {
    const choice = "Nandos";
    await poll.methods.addChoice(choice).send({
      from: accounts[1]
    });
    const contractChoice = web3.utils.hexToUtf8(await poll.methods.choiceNames(0).call());
    assert(false);
    } catch (err) {
      assert(err)
    }
  });
  it("2. friend cannot add a choice", async () => {
    try {
    const choice = "Nandos";
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[1]
    });
    const contractChoice = web3.utils.hexToUtf8(await poll.methods.choiceNames(0).call());
    assert(false);
    } catch (err) {
      assert(err)
    }
  });

  // 3. The contract creator is able to select m friends to vote for n

  it('3. Contractor able to add friend', async () => {
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    const friend = poll.methods.voters(accounts[1]);
    assert(friend);
  });

  it('3. Contractor able to add multiple friends', async () => {
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[2]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[3]).send({
      from: accounts[0]
    });
    const friend0 = poll.methods.voters(accounts[1]);
    assert(friend0);
    const friend1 = poll.methods.voters(accounts[2]);
    assert(friend1);
    const friend2 = poll.methods.voters(accounts[3]);
    assert(friend2);
  });

  // 4. Only the contract creator is be able to add m friends via deployed contract
  it('4. Only creator can add friends', async () => {
    try {
      await poll.methods.addFriend(accounts[1]).send({
        from: accounts[2]
      });
      const friend0 = poll.methods.voters(accounts[2]);
      assert(!friend0);
    } catch (err) {
      assert(err)
    }
  });
  // 5. Contract creator shall set q quorum.

  it('5. Contract creator can set quorum', async () => {
    const amount = 5;
    await poll.methods.setQuorum(amount).send({ from: accounts[0]});
    const q = await poll.methods.q().call();
    assert.equal(q, amount);
  
  });

  // 7. Each selected friend can only vote once. 

  it('7. friend can vote', async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.vote(0).send({ from: accounts[1] })
    const votes = await poll.methods.choiceVotes(0).call()
    assert.equal(votes, 1);
  });
  it('7. several friend can vote', async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[2]).send({
      from: accounts[0]
    });
    await poll.methods.vote(0).send({ from: accounts[1] })
    await poll.methods.vote(0).send({ from: accounts[2] })
    const votes = await poll.methods.choiceVotes(0).call()
    assert.equal(votes, 2);
  });
  it('7. Each selected friend can vote ONLY ONCE', async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    try { await poll.methods.vote(0).send({ from: accounts[1] })
    await poll.methods.vote(0).send({ from: accounts[1] })
    const votes = await poll.methods.choiceVotes(0).call()
    assert(false);
    } catch (err) {
      assert(err)
    }
  });

  //8. The contract must stop accepting vote when q is met
  it('8. Stops accepting after q votes', async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[2]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[3]).send({
      from: accounts[0]
    });
    try { 
      await poll.methods.vote(0).send({ from: accounts[1] })
      await poll.methods.vote(0).send({ from: accounts[2] })
      await poll.methods.vote(0).send({ from: accounts[3] })
      const votes = await poll.methods.choiceVotes(0).call()
    assert(false);
    } catch (err) {
      assert(err)
    }
  });

  // 9. Anyone can call the getResult() function to get the result of the poll
  it('9. Anyone can get the result!', async () =>{
    const choice = "Nandos";
    const choice2 = "Maccas"
    await poll.methods.setQuorum(3).send({ from: accounts[0]});
    await poll.methods.addChoice(web3.utils.asciiToHex(choice)).send({
      from: accounts[0]
    });
    await poll.methods.addChoice(web3.utils.asciiToHex(choice2)).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[1]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[2]).send({
      from: accounts[0]
    });
    await poll.methods.addFriend(accounts[3]).send({
      from: accounts[0]
    });
    await poll.methods.vote(0).send({ from: accounts[1] })
    await poll.methods.vote(0).send({ from: accounts[2] })
    await poll.methods.vote(1).send({ from: accounts[3] })
    const victor =web3.utils.hexToUtf8(await poll.methods.getResult().call())
    assert.equal(choice, victor);
  });

  // 10. The creator can destroy the smart contract after the poll 
  it('10. Creator can destroy their contract', async() => {
    await poll.methods.destroy().send({from: accounts[0]});
    try {
      await poll.methods.creator().call();
      assert(fail);
    } catch (err) {
      assert(err);
    }
  });
});
