const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const fs = require("fs");
const MINT_ADDRESS = "4V71AnwK77tffB81Ud25eGNss1iefFAnYkKt2sHCbE9p";

const whitelist = [
  {address: "DGDUBh1MuQFAqgSx6VmJ9oQZ72d3SD4HpMhrryZBoj31", amount: 3},
  {address: "9fnZZonj2wnUXSRP1D1XA1jBkTgqVgf4rUXfCogbsp7J", amount: 3},
  {address: "9YR7gRh1LhVB9DAbhGyX3A2rLE5hzk7YwHBfXTZC6WTP", amount: 3},
  {address: "SVzZbottxf57NvEKQW5whg4ViwxCZ8YJQb3WdkfPXCj", amount: 3},
];

(async () => {
  const ownerJson = fs.readFileSync("/home/spl_1.json", {encoding: 'utf8'});
  // const ownerJson = fs.readFileSync("/root/.config/solana/id.json", {encoding: 'utf8'});

  var connection = new web3.Connection(web3.clusterApiUrl("devnet"));
  let owner = new web3.Account(Buffer.from(JSON.parse(ownerJson)));
  var tokenMint = new web3.PublicKey(MINT_ADDRESS);
  var token = new splToken.Token(
    connection,
    tokenMint,
    splToken.TOKEN_PROGRAM_ID,
    owner
  );
  var ownerTokenAccount = await token.getOrCreateAssociatedAccountInfo(
    owner.publicKey
  )

  for (let i = 0; i < whitelist.length; i++) {
    try {
      var recipientWallet = new web3.PublicKey(whitelist[i].address)
      var recipientTokenAccount = await token.getOrCreateAssociatedAccountInfo(
        recipientWallet
      )

      var transaction = new web3.Transaction()
        .add(
          splToken.Token.createTransferInstruction(
            splToken.TOKEN_PROGRAM_ID,
            ownerTokenAccount.address,
            recipientTokenAccount.address,
            owner.publicKey,
            [],
            whitelist[i].amount
          )
        );

      var signature = await web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [owner]
      );
      console.log("From: ", owner.publicKey.toBase58());
      console.log("To: ", recipientWallet.toBase58());
      console.log("Sent: ", whitelist[i].amount);
      console.log("SIGNATURE", signature, "\n\n");
    } catch (e) {
      console.log(e);
      console.log("From: ", owner.publicKey.toBase58());
      console.log("To: ", recipientWallet.toBase58());
      console.log("Failed\n\n");
    }
  }
})();