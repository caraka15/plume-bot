const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

// Baca konfigurasi dari file config.json
const config = JSON.parse(fs.readFileSync("config.json"));

// Ambil private key dari variabel lingkungan
const privateKey = process.env.PRIVATE_KEY;

// Baca ABI dari file ABI JSON
const approveBuyABI = JSON.parse(fs.readFileSync("abi/approveBUY.json"));
const buyLANDABI = JSON.parse(fs.readFileSync("abi/buyLAND.json"));
const approveVAULTABI = JSON.parse(fs.readFileSync("abi/approveVAULT.json"));
const depositLANDABI = JSON.parse(fs.readFileSync("abi/depositLAND.json"));

// Inisialisasi provider dan wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramUserId = process.env.TELEGRAM_USER_ID;

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  const payload = {
    chat_id: telegramUserId,
    text: message,
  };

  try {
    const response = await axios.post(url, payload);
    if (response.data.ok) {
      console.log("Telegram message sent successfully!");
    } else {
      console.log("Failed to send message:", response.data);
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error.message);
  }
}

async function main() {
  try {
    // 1. Approve transaction
    const approveBuyContract = new ethers.Contract(
      "0x5c1409a46cD113b3A667Db6dF0a8D7bE37ed3BB3",
      approveBuyABI,
      wallet
    );
    const approveTx = await approveBuyContract.approve(
      "0xd2aade12760d5e176f93c8f1c6ae10667c8fca8b",
      "100000000000000000" // 100000000000000000
    );
    console.log("Approve Transaction Hash:", approveTx.hash);
    await approveTx.wait();

    // 2. Swap transaction
    const swapContract = new ethers.Contract(
      "0xd2AadE12760d5e176F93C8F1C6Ae10667c8FCa8b",
      buyLANDABI,
      wallet
    );
    const swapTx = await swapContract.swap();
    console.log("Swap Transaction Hash:", swapTx.hash);
    await swapTx.wait();

    // 3. Approve transaction again
    const approveVaultContract = new ethers.Contract(
      "0x45934E0253955dE498320D67c0346793be44BEC0",
      approveVAULTABI,
      wallet
    );
    const approveVaultTx = await approveVaultContract.approve(
      "0x5374cf69c5610950526c668a7b540df6686531b4",
      "100000000000000000" // 100000000000000000
    );
    console.log("Approve Vault Transaction Hash:", approveVaultTx.hash);
    await approveVaultTx.wait();

    // 4. Deposit LAND
    const depositLANDContract = new ethers.Contract(
      "0x5374Cf69C5610950526C668A7B540df6686531b4",
      depositLANDABI,
      wallet
    );
    const depositLANDTx = await depositLANDContract.deposit(
      "0", // _pid
      "100000000000000000" // _amount
    );
    console.log("Deposit LAND Transaction Hash:", depositLANDTx.hash);
    await depositLANDTx.wait();

    // Send Telegram message
    const message = `
Task landshare plume telah selesai
Approve Transaction Hash: https://testnet-explorer.plumenetwork.xyz/tx/${approveTx.hash}
Swap Transaction Hash: https://testnet-explorer.plumenetwork.xyz/tx/${swapTx.hash}
Approve Vault Transaction Hash: https://testnet-explorer.plumenetwork.xyz/tx/${approveVaultTx.hash}
Deposit LAND Transaction Hash: https://testnet-explorer.plumenetwork.xyz/tx/${depositLANDTx.hash}
    `;
    await sendTelegramMessage(message);

    console.log(
      "All transactions completed successfully and message sent to Telegram!"
    );
  } catch (error) {
    console.error("Error executing transactions:", error.message);
  }
}

main();
