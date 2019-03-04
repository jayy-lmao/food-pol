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
    .deploy({ data: bytecode, arguments: ["3"] })
    .send({ from: accounts[0], gas: "1000000" });

  poll.setProvider(provider);
});

describe("Poll Contract", async () => {
  // Can succesffully deploy
  it("Deploys a contract", () => {
    assert.ok(poll.options.address);
  });

  // 1. The contract creator is able to add n choices

  it("Can add a choice", async () => {
    const choice = "Nandos";
    await poll.methods.addChoice(choice).send({
      from: accounts[0]
    });
    const contractChoice = await poll.methods.choices(0).call();
    assert.equal((choice = contractChoice));
  });
});
