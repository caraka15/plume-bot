const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

// Baca konfigurasi dari file config.json
const config = JSON.parse(fs.readFileSync("config.json"));

// Ambil private key dari variabel lingkungan
const privateKey = process.env.PRIVATE_KEY;

// Baca ABI dari file abi.json
const abi = JSON.parse(fs.readFileSync("abi/abiMovement.json"));

// Inisialisasi provider dan wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x032139f44650481f4d6000c078820B8E734bF253";

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBool() {
  return Math.random() < 0.5;
}

async function sendTransaction(contract, pairIndex, isLong) {
  try {
    // Panggil fungsi predictPriceMovement
    const tx = await contract.predictPriceMovement(pairIndex, isLong);
    console.log(
      `Menunggu konfirmasi untuk pairIndex ${pairIndex}, isLong ${isLong}...`
    );

    // Tunggu hingga transaksi selesai
    await tx.wait();
    console.log("Transaksi berhasil!");
    console.log("Transaction Hash:", tx.hash);
    return tx.hash; // Return transaction hash
  } catch (error) {
    if (error.message.includes("Wait for cooldown")) {
      console.log("Pair sudah digunakan, mencoba transaksi lain...");
    } else {
      console.error("Terjadi kesalahan:", error.message);
    }
    return null; // Transaksi gagal, coba lagi
  }
}

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

async function main() {
  // Buat instance kontrak dengan wallet
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const transactionHashes = [];
  for (let i = 0; i < 10; i++) {
    const pairIndex = getRandomInt(1, 10); // Nilai acak antara 1 dan 10
    const isLong = getRandomBool(); // Nilai acak true atau false

    console.log(
      `Mencoba transaksi ${
        i + 1
      } dengan pairIndex ${pairIndex}, isLong ${isLong}`
    );
    const txHash = await sendTransaction(contract, pairIndex, isLong);

    if (txHash) {
      transactionHashes.push(txHash);
    }
  }

  // Kirim pesan ke Telegram
  if (transactionHashes.length > 0) {
    const message = `
Task movement telah berhasil
${transactionHashes
  .map(
    (hash, index) =>
      `tx ${index + 1} = https://testnet-explorer.plumenetwork.xyz/tx/${hash}`
  )
  .join("\n")}
`;

    await sendTelegramMessage(message);
  } else {
    const message =
      "Task movement Gagal : Tidak ada transaksi yang berhasil dalam batch ini.";
    await sendTelegramMessage(message);
  }
}

main();
