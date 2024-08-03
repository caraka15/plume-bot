const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");

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
    const receipt = await tx.wait();
    return receipt.transactionHash; // Mengembalikan hash transaksi jika berhasil
  } catch (error) {
    if (error.message.includes("Wait for cooldown")) {
      console.log("Pair sudah digunakan, mencoba transaksi lain...");
      return null; // Menandakan transaksi gagal
    }
    console.error("Terjadi kesalahan:", error.message);
    return null; // Menandakan transaksi gagal
  }
}

async function main() {
  // Buat instance kontrak dengan wallet
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  let successfulTransactions = 0;
  let transactionCount = 0;

  while (successfulTransactions < 1) {
    const pairIndex = getRandomInt(1, 10); // Nilai acak antara 1 dan 10
    const isLong = getRandomBool(); // Nilai acak true atau false

    console.log(
      `Mencoba transaksi ${
        transactionCount + 1
      } dengan pairIndex ${pairIndex}, isLong ${isLong}`
    );
    const txHash = await sendTransaction(contract, pairIndex, isLong);

    if (txHash) {
      successfulTransactions++;
      console.log(`Transaksi ${successfulTransactions} berhasil: ${txHash}`);
    }

    transactionCount++;
  }
}

main();
