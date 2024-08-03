const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

// Baca konfigurasi dari file config.json
const config = JSON.parse(fs.readFileSync("config.json"));

// Ambil private key dari variabel lingkungan
const privateKey = process.env.PRIVATE_KEY;

// Baca ABI dari file abi.json
const abi = JSON.parse(fs.readFileSync("abi/abiMINT.json"));

// Inisialisasi provider dan wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const contractAddress = "0x5d4133c3B940FC42622482E8baA8B556062F5C2b";

async function main() {
  // Buat instance kontrak dengan wallet
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  try {
    // Panggil fungsi checkIn
    const tx = await contract.mintAICK();
    console.log("Transaksi berhasil dipanggil, menunggu konfirmasi...");

    // Tunggu hingga transaksi selesai
    const receipt = await tx.wait();
    console.log(
      `Task Mint Plume hari ini sudah dilakukan\nTxHash: https://testnet-explorer.plumenetwork.xyz/tx/${tx.hash}`
    );
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}

main();
