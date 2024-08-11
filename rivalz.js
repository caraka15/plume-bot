require("dotenv").config(); // Memuat variabel lingkungan dari .env
const { ethers } = require("ethers");
const axios = require("axios");

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider(
  "https://rivalz2.rpc.caldera.xyz/http"
); // URL RPC
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Menggunakan private key dari .env

// Contract address
const contractAddress = "0xeBBa6Ffff611b7530b57Ed07569E9695B98e6c82"; // Alamat kontrak

// Define ABI for the claim function
const abi = ["function claim()"];
const iface = new ethers.Interface(abi);
const data = iface.encodeFunctionData("claim");

// Counter for successful transactions
let successfulClaims = 0;
const maxClaims = 20;
const transactionHashes = []; // Array to store transaction hashes

// Function to send Telegram message
async function sendTelegramMessage(message) {
  // Telegram bot configuration
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const telegramChatId = process.env.TELEGRAM_USER_ID;
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error.message);
  }
}

// Function to create and send transaction
async function sendTransaction() {
  try {
    // Create transaction
    const tx = {
      to: contractAddress,
      data: data,
      type: 2, // EIP-1559 transaction type
    };

    // Send transaction
    const txResponse = await wallet.sendTransaction(tx);
    console.log("Transaction Hash:", txResponse.hash);

    // Store transaction hash
    transactionHashes.push(txResponse.hash);

    // Wait for transaction confirmation
    const receipt = await txResponse.wait();

    if (receipt.status === 1) {
      successfulClaims++;
      console.log("Transaction confirmed in block:", receipt.blockNumber);
    } else {
      console.log("Transaction failed:", txResponse.hash);
    }

    return receipt.status === 1; // Return true if the transaction was successful
  } catch (error) {
    console.error("Error sending transaction:", error);
    return false; // Return false if an error occurred
  }
}

// Run sendTransaction until 20 successful transactions are achieved
async function runMultipleTransactions() {
  while (successfulClaims < maxClaims) {
    console.log(
      `Attempting to send transaction ${successfulClaims + 1}/${maxClaims}`
    );
    const success = await sendTransaction();
    if (success) {
      console.log(
        `Successfully completed ${successfulClaims}/${maxClaims} claims.`
      );
    }
    // Optional: Add delay between transactions to avoid hitting rate limits
    await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds delay
  }

  // Create summary message
  const summaryMessage =
    `All transactions completed successfully. Here are the details:\n\n` +
    transactionHashes
      .map(
        (hash, index) =>
          `Transaction ${
            index + 1
          }: [Link](https://rivalz2.explorer.caldera.xyz/tx/${hash})`
      )
      .join("\n");

  // Send summary message to Telegram
  await sendTelegramMessage(summaryMessage);
  console.log("All transactions completed successfully.");
}

// Start sending transactions
runMultipleTransactions();
