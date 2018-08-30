// in node.js
const Accounts = require("aion-keystore");
const Web3 = require("aion-web3");
var rp = require("request-promise");

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
const account = new Accounts();
const acc = account.privateKeyToAccount(
  "debbee79513a88d6bc7163bd76d6fda3b1431b164a6bcdc9dba87db2f11cd04cc9e17d6dd641635c4b7c85a36233b532922ade477b7072105228b601bf84b7ea"
);

console.log(`acc : ${JSON.stringify(acc)}`);
console.log(`bal : ${web3.eth.getBalance(acc.address) / 1e18}`);
let tempNonce = "";

const ddata = {
  jsonrpc: "2.0",
  method: "eth_getTransactionCount",
  params: [`${acc.address}`, "latest"],
  id: 1
};
rp({
  method: "POST",
  uri: "http://127.0.0.1:8545",
  body: ddata,
  json: true
})
  .then(body => {
    tempNonce = body.result;
    console.log(`nonce : ${tempNonce}`);
  })
  .catch(error => {
    console.log(`error : ${error}`);
  });
// construct transaction payload
const transaction = {
  to: "0xa0a6ade7564fd875dd055a87deb2ae34784f2c8bb3146c6a631f592e712092db",
  data: "0x1234567890abcd",
  gasPrice: 10000000000,
  gas: 21000,
  value: 1000000000000000000,
  nonce: tempNonce,
  timestamp: Date.now()
};

acc.signTransaction(transaction).then(signed => {
  console.log(`signed ${JSON.stringify(signed)}`);
  var data = {
    jsonrpc: "2.0",
    method: "eth_sendRawTransaction",
    params: [signed.rawTransaction],
    id: 1
  };

  rp({
    method: "POST",
    uri: "http://127.0.0.1:8545",
    body: data,
    json: true
  })
    .then(response => {
      console.log("txHash " + JSON.stringify(response.result));
      const txHash = response.result;
      resp = {
        isError: false,
        data: txHash
      };
    })
    .catch(response => {
      console.log("error " + response);
      // resp = {
      //   isError: true,
      //   error: err
      // };
    });
});