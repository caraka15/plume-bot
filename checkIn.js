const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

// Baca konfigurasi dari file config.json
const config = JSON.parse(fs.readFileSync("config.json"));

// Ambil private key dari variabel lingkungan
const privateKey = process.env.PRIVATE_KEY;

// Baca ABI dari file abi.json
const abi = JSON.parse(fs.readFileSync("abi/abi.json"));

// Inisialisasi provider dan wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x8Dc5b3f1CcC75604710d9F464e3C5D2dfCAb60d8";

// Fungsi untuk mengirim pesan Telegram
async function sendTelegramMessage(message) {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_USER_ID;
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error.message);
  }
}

async function main() {
  // Buat instance kontrak dengan wallet
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    // Panggil fungsi checkIn
    const tx = await contract.checkIn();
    console.log("Transaksi berhasil dipanggil, menunggu konfirmasi...");

    // Tunggu hingga transaksi selesai
    const receipt = await tx.wait();
    console.log("Fungsi checkIn berhasil dipanggil!");

    // Kirim pesan ke Telegram
    const message = `Task Checkin Plume hari ini sudah dilakukan\nTxHash: https://testnet-explorer.plumenetwork.xyz/tx/${tx.hash}`;
    await sendTelegramMessage(message);
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);

    // Jika error terkait dengan faucet yang telah diambil
    // if (error.message.includes("execution reverted (unknown custom error)")) {
    //   const message = "Faucet telah diambil hari ini";
    //   await sendTelegramMessage(message);
    // }
  }
}

main();
