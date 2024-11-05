require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");

// Setup provider and wallet
const provider = new ethers.JsonRpcProvider("https://rivalz2.rpc.caldera.xyz/http");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY2, provider);

// Contract address
const contractAddress = "0xF0a66d18b46D4D5dd9947914ab3B2DDbdC19C2C0";

// Define ABI for the claim function
const abi = ["function claim() external"];
const contract = new ethers.Contract(contractAddress, abi, wallet);

// Counter for successful transactions
let successfulClaims = 0;
const maxClaims = 16;
const transactionHashes = [];

// Function to send Telegram message
async function sendTelegramMessage(message) {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const telegramChatId = process.env.TELEGRAM_USER_ID;
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error.message);
  }
}

// Function to get current gas price with buffer
async function getGasPrice() {
  const gasPrice = await provider.getFeeData();
  // Add 10% buffer to maxFeePerGas
  const maxFeePerGas = gasPrice.maxFeePerGas * BigInt(110) / BigInt(100);
  const maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas * BigInt(110) / BigInt(100);

  return { maxFeePerGas, maxPriorityFeePerGas };
}

// Function to create and send transaction
async function sendTransaction() {
  try {
    // Get gas price
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasPrice();

    // Estimate gas
    const gasLimit = await contract.claim.estimateGas();
    const adjustedGasLimit = gasLimit * BigInt(120) / BigInt(100); // Add 20% buffer

    // Create and send transaction
    const tx = await contract.claim({
      maxFeePerGas,
      maxPriorityFeePerGas,
      gasLimit: adjustedGasLimit,
    });

    console.log("Transaction Hash:", tx.hash);
    transactionHashes.push(tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      successfulClaims++;
      console.log("Transaction confirmed in block:", receipt.blockNumber);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    } else {
      console.log("Transaction failed:", tx.hash);
    }

    return receipt.status === 1;
  } catch (error) {
    console.error("Error sending transaction:", error);

    // Log more detailed error information
    if (error.reason) console.error("Error reason:", error.reason);
    if (error.code) console.error("Error code:", error.code);
    if (error.data) console.error("Error data:", error.data);

    return false;
  }
}

// Run sendTransaction until 20 successful transactions are achieved
async function runMultipleTransactions() {
  let retryCount = 0;
  const maxRetries = 30; // Maximum number of retry attempts

  while (successfulClaims < maxClaims && retryCount < maxRetries) {
    console.log(`Attempting to send transaction ${successfulClaims + 1}/${maxClaims}`);
    const success = await sendTransaction();

    if (success) {
      console.log(`Successfully completed ${successfulClaims}/${maxClaims} claims.`);
      retryCount = 0; // Reset retry counter after successful transaction
    } else {
      console.log("Transaction failed, waiting before retry...");
      retryCount++;
      console.log(`Retry attempt ${retryCount}/${maxRetries}`);
    }

    // Add random delay between 30-45 seconds
    const delay = 30000 + Math.floor(Math.random() * 15000);
    console.log(`Waiting ${delay / 1000} seconds before next transaction...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Create summary message
  let summaryMessage;
  if (successfulClaims === maxClaims) {
    summaryMessage =
      `🎉 All ${maxClaims} transactions completed successfully!\n\n` +
      transactionHashes
        .map((hash, index) =>
          `Claim ${index + 1}: [View Transaction](https://rivalz2.explorer.caldera.xyz/tx/${hash})`
        )
        .join('\n');
  } else {
    summaryMessage =
      `⚠️ Script completed with ${successfulClaims}/${maxClaims} successful claims.\n\n` +
      transactionHashes
        .map((hash, index) =>
          `Claim ${index + 1}: [View Transaction](https://rivalz2.explorer.caldera.xyz/tx/${hash})`
        )
        .join('\n');
  }

  // Send final summary message to Telegram
  await sendTelegramMessage(summaryMessage);

  if (successfulClaims === maxClaims) {
    console.log("All transactions completed successfully.");
  } else {
    console.log(`Script completed with ${successfulClaims}/${maxClaims} successful claims.`);
  }
}

// Start sending transactions
runMultipleTransactions().catch(console.error);