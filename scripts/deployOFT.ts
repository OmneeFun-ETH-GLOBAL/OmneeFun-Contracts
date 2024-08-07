import { BigNumber, ethers } from "ethers";
import dotenv from "dotenv";
import { Options } from '@layerzerolabs/lz-v2-utilities';

dotenv.config();

const main = async () => {

  const universalFactoryABI = require("../artifacts/contracts/UniversalFactory.sol/UniversalFactory.json").abi;
  const oftFactoryABI = require("../artifacts/contracts/OFTFactory.sol/OFTFactory.json").abi;
  const bondingCurveABI = require("../artifacts/contracts/BondingCurve.sol/BondingCurve.json").abi;
  const omneeRouterABI = require("../artifacts/contracts/OmneeRouter.sol/OmneeRouter.json").abi;

  const baseProvider = new ethers.providers.JsonRpcProvider("https://sepolia.base.org", 84532);
  const scrollProvider = new ethers.providers.JsonRpcProvider("https://sepolia-rpc.scroll.io", 534351);
  const arbProvider = new ethers.providers.JsonRpcProvider("https://sepolia-rollup.arbitrum.io/rpc", 421614);
  const opProvider = new ethers.providers.JsonRpcProvider("https://sepolia.optimism.io", 11155420);
  const zircuitProvider = new ethers.providers.JsonRpcProvider("https://zircuit1.p2pify.com/", 48899);

  const walletBASE = new ethers.Wallet(process.env.PRIVATE_KEY as string, baseProvider);
  const walletSCROLL = new ethers.Wallet(process.env.PRIVATE_KEY as string, scrollProvider);
  const walletARB = new ethers.Wallet(process.env.PRIVATE_KEY as string, arbProvider);
  const walletOP = new ethers.Wallet(process.env.PRIVATE_KEY as string, opProvider);
  const walletZIRCUIT = new ethers.Wallet(process.env.PRIVATE_KEY as string, zircuitProvider);

  const universalFactorySC = new ethers.Contract("0xf46ac01917B5CbE6125aF8EA2aC9E85de0e365aA", universalFactoryABI, walletBASE);
  const bondingCurveBASE = new ethers.Contract("0x7b7e9603b68ca1c0C975eD4594dF1Da29e603b6e", bondingCurveABI, walletBASE);

  const oftFactorySCROLL = new ethers.Contract("0xe62f0C6Eb658a56ebdf3D2A700d204A5473e0252", oftFactoryABI, walletSCROLL);
  const oftFactoryARB = new ethers.Contract("0xe62f0C6Eb658a56ebdf3D2A700d204A5473e0252", oftFactoryABI, walletARB);
  const oftFactoryOP = new ethers.Contract("0xe62f0C6Eb658a56ebdf3D2A700d204A5473e0252", oftFactoryABI, walletOP);
  const oftFactoryBASE = new ethers.Contract("0xe62f0C6Eb658a56ebdf3D2A700d204A5473e0252", oftFactoryABI, walletBASE);
  const oftFactoryZIRCUIT = new ethers.Contract("0xe62f0C6Eb658a56ebdf3D2A700d204A5473e0252", oftFactoryABI, walletZIRCUIT);

  const routerARB = new ethers.Contract("0x17c8C3f095E3b51EB5867972E5a3bC9630a8d48D", omneeRouterABI, walletARB);
  const routerOP = new ethers.Contract("0x17c8C3f095E3b51EB5867972E5a3bC9630a8d48D", omneeRouterABI, walletOP);
  const routerScroll = new ethers.Contract("0x17c8C3f095E3b51EB5867972E5a3bC9630a8d48D", omneeRouterABI, walletSCROLL);
  const routerZircuit = new ethers.Contract("0x17c8C3f095E3b51EB5867972E5a3bC9630a8d48D", omneeRouterABI, walletZIRCUIT);

  const EID_BASE = "40245";
  const EID_SCROLL = "40170";
  const EID_ARB = "40231";
  const EID_OP = "40232";
  const EID_ZIRCUIT = "40275";

    
  const options = Options.newOptions().addExecutorLzReceiveOption(500000000, 0).toHex().toString();
    
  console.log("Options =>", options);
    
  const nativeFee = await universalFactorySC.quoteDeployOFT("WIF", "WIF", [EID_ARB, EID_OP, EID_SCROLL, EID_ZIRCUIT], options);
    
  console.log("Deployment Fee =>", ethers.utils.formatEther(nativeFee.toString()), "ETH");
    
  let tx = await universalFactorySC.deployOFT("WIF", "WIF", [EID_ARB, EID_OP, EID_SCROLL, EID_ZIRCUIT], options, { value: nativeFee });
    
  console.log("Transaction Hash =>", tx.hash);

  /*

  let txx = await universalFactorySC.setBaseFactory(oftFactoryBASE.address);
  await txx.wait();

  txx = await universalFactorySC.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await oftFactoryARB.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await oftFactoryOP.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await oftFactoryBASE.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await oftFactorySCROLL.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await oftFactoryZIRCUIT.setBondingCurve(bondingCurveBASE.address);
  await txx.wait();

  txx = await routerARB.setBondingCurve(ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerOP.setBondingCurve(ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerScroll.setBondingCurve(ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerZircuit.setBondingCurve(ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  console.log("Contracts set up");

  txx = await universalFactorySC.setPeer(EID_ARB, ethers.utils.zeroPad(oftFactoryARB.address, 32));
  await txx.wait();

  txx = await universalFactorySC.setPeer(EID_OP, ethers.utils.zeroPad(oftFactoryOP.address, 32));
  await txx.wait();

  txx = await universalFactorySC.setPeer(EID_SCROLL, ethers.utils.zeroPad(oftFactorySCROLL.address, 32));
  await txx.wait();

  txx = await universalFactorySC.setPeer(EID_ZIRCUIT, ethers.utils.zeroPad(oftFactoryZIRCUIT.address, 32));
  await txx.wait();

  txx = await oftFactoryARB.setPeer(EID_BASE, ethers.utils.zeroPad(universalFactorySC.address, 32));
  await txx.wait();

  txx = await oftFactoryOP.setPeer(EID_BASE, ethers.utils.zeroPad(universalFactorySC.address, 32));
  await txx.wait();

  txx = await oftFactorySCROLL.setPeer(EID_BASE, ethers.utils.zeroPad(universalFactorySC.address, 32));
  await txx.wait();

  txx = await oftFactoryZIRCUIT.setPeer(EID_BASE, ethers.utils.zeroPad(universalFactorySC.address, 32));
  await txx.wait();

  console.log("Main Peers set");

  txx = await routerARB.setPeer(EID_BASE, ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerOP.setPeer(EID_BASE, ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerScroll.setPeer(EID_BASE, ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await routerZircuit.setPeer(EID_BASE, ethers.utils.zeroPad(bondingCurveBASE.address, 32));
  await txx.wait();

  txx = await bondingCurveBASE.setPeer(EID_ARB, ethers.utils.zeroPad(routerARB.address, 32));
  await txx.wait();

  txx = await bondingCurveBASE.setPeer(EID_OP, ethers.utils.zeroPad(routerOP.address, 32));
  await txx.wait();

  txx = await bondingCurveBASE.setPeer(EID_SCROLL, ethers.utils.zeroPad(routerScroll.address, 32));
  await txx.wait();

  txx = await bondingCurveBASE.setPeer(EID_ZIRCUIT, ethers.utils.zeroPad(routerZircuit.address, 32));
  await txx.wait();

  console.log("Router Peers set");



  
  
  const options = Options.newOptions().addExecutorLzReceiveOption(500000, "10000000000000000").toHex().toString();

  const fees = await routerARB.quote("", options, "10000000000000000");
  
  console.log("Fees =>", ethers.utils.formatEther(fees.toString()), "ETH");


  ------


  */

}

main();