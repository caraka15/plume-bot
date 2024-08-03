// const ethers = require("ethers");
const { ethers } = require("ethers");
require("dotenv").config();
const fs = require("fs");

// Ambil konfigurasi dari file .env
const privateKey = process.env.PRIVATE_KEY;
const adminAddress = "0x28b8A9aC47E3E43e3A0872028476ef898055871C";
const config = JSON.parse(fs.readFileSync("config.json"));
const contractAddress = "0x075e2D02EBcea5dbcE6b7C9F3D203613c0D5B33B";

// Baca ABI dari file abi.json
const abi = JSON.parse(fs.readFileSync("abi/abiFaucet.json"));

// Setup provider dan wallet
const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, provider);
const contractWithSigner = contract.connect(wallet);

async function getToken(token) {
  if (token !== "ETH" && token !== "GOON") {
    throw new Error("Invalid token. Only ETH or GOON are supported.");
  }

  // Membuat salt acak
  const number = 12345;
  const salt = "0x" + number.toString(16);

  // Membuat pesan yang akan ditandatangani
  const message = ethers.utils.getToken(
    ["token", "salt", "signature"],
    [token, salt, signature]
  );

  // Menandatangani pesan
  const signedMessage = await wallet.signMessage(
    ethers.utils.arrayify(message)
  );

  // Memanggil fungsi getToken
  try {
    console.log(
      `Memanggil getToken dengan token: ${token}, salt: ${salt}, signature: ${signedMessage}`
    );
    const tx = await contractWithSigner.getToken(token, salt, signedMessage);
    console.log(`Transaction Hash: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction confirmed!");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Contoh penggunaan
getToken("ETH"); // Ganti 'ETH' dengan 'GOON' untuk token GOON
