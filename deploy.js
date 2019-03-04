const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');


const provider = new HDWalletProvider(
  'monster dentist auction dust traffic crawl sketch sick praise ghost include arch',
  'https://rinkeby.infura.io/v3/3906e495ccd24e6fb32613d0058d313b'
);

const web3= new Web3(provider);


(async () => {
  const accounts = await web3.eth.getAccounts();
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ['4'] })
    .send({gas: '1000000', from: accounts[0]});
  console.log(result.options.address);
})();

