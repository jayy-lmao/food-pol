const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');


const provider = new HDWalletProvider(
  'monster dentist auction dust traffic crawl sketch sick praise ghost include arch',
  'https://rinkeby.infura.io/v3/9f6b7935e96a46d6a95e9cee4e4aaf8b'
);

const web3= new Web3(provider);

(async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account', accounts[0]);
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({gas: '1000000', from: accounts[0]});
  console.log(result.options.address);
})();

