import { ethers, Wallet } from "ethers";

export const getBalance = async function (wallet: Wallet) {
  const balance = await wallet.provider!.getBalance(wallet.address);

  return ethers.formatEther(balance);
};
