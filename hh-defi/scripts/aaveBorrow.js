
//aave(?? Patrick doesn't say aave, but implies it) protocol treats everything as an ERC20 token
//but the native blockchain (example: ETH) isn't an ERC20 token.
//Think of it something like OOP Polymorphism and the ERC20 token is an abstract or base class. 
//If the abstract or base class is used as an parameter or variable declaration, then any inherited class can be used as an arguement and a var can be initialized as a derived class. 

const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth.js");
//yarn hardhat run scripts/aaveBorrow.js - when we run this script, we are forking mainnet blockchain to local machine/hardhat and working with "real" blockchain.
async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();
    //need aave abi and address
    //https://docs.aave.com/developers/v/2.0/deployed-contracts/deployed-contracts
    //Aave Lending Pool Address Provider: goerli testnet 0x5E52dEc931FFb32f609681B8438A51c675cc232d
    //                                      mainnet 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    const lendingPool = await getLendingPool(deployer);
    console.log(`LendingPool address ${lendingPool.address}`);

    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //https://goerli.etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!!!... At this point, we have deposited our collateral. Exchanged our currency for a WETH TOKEN, and added it to the Weth contract.");

    //how much have we barrowed, how much collateral, how much we can borrow in ETH
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);

    const daiPrice = await getDaiPrice();
    console.log(`The DAI to ETH price is ${daiPrice.toString()}`);
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1/daiPrice.toNumber()); //using 95% of our borrowable amount, not 95% of deposited collateral to buy DAI??
    console.log(`Can borrow ${amountDaiToBorrow} DAI based on our ${AMOUNT} collateral that was converted to a Weth Token`);
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
    console.log(`Borrowed DAI converted back to Wei ${amountDaiToBorrowWei}`);
    //DAI Token Address 0x6B175474E89094C44Da98b954EedeAC495271d0F SEE: https://etherscan.io/token/0x6b175474e89094c44da98b954eedeac495271d0f
    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer);
    await getBorrowUserData(lendingPool, deployer);
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
    console.log(`We repayed the initial amount borrowed, and repayed the principle, but still owe any intrest occured on the borrow. SEE console print out below saying 'You have {amount} worth of ETH borrowed'`);
    await getBorrowUserData(lendingPool, deployer);
}

async function repay(amount, daiAddress, lendingPool, account){
    await approveErc20(daiAddress, lendingPool.address, amount, account);
    //https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool#repay to see the aave lendingPool contract repay() function
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
    await repayTx.wait(1);
    console.log("Repayed borrowed DAI");
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account){
    //SEE: https://docs.aave.com/developers/v/2.0/the-core-protocol/lendingpool for borrow() params
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account);
    await borrowTx.wait(1);
    console.log(`You've borrowed`)
}


async function getDaiPrice() {
    //https://docs.chain.link/docs/data-feeds/price-feeds/addresses/ DAI/ETH contact address 0x773616E4d11A78F511299002da57A0a94577F1f4
    //We are reading form this address, not sending to. So we don't need a deployer/sender address
    const daiPriceFeed = await ethers.getContractAt("AggregatorV3Interface", "0x773616E4d11A78F511299002da57A0a94577F1f4");
    const price = (await daiPriceFeed.latestRoundData())[1]; //the [1] is the return from the interface functions return data (uint80 roundId,int256 answer,uint256 startedAt,uint256 updatedAt,uint80 answeredInRound) 
    return price;
}

async function getBorrowUserData(lendingPool, account){
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
    console.log(`You can borrow  ${availableBorrowsETH} worth of ETH given the amount of collateral depositted`);
    return { totalDebtETH, availableBorrowsETH}
}

async function getLendingPool(account){
    const lendingPoolAddressesProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", account);
    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool;
}

async function approveErc20(erc20Address, spenderAddress, amountToSpend, account){
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account);
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");
}

main()
.then(() => process.exit(0))
.catch((e) => { console.log(e) });