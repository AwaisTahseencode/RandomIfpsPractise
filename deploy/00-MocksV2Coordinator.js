const {network, getNamedAccounts,deployments, ethers}= require("hardhat")
const {developmentChains}=require("../helper-hardhat-config")
module.exports=async()=>{
    const BASE_FEE=ethers.utils.parseEther("0.25")
    const GAS_PRICE_LINK=1e9
    const name=network.name
    const chainId=network.config.chainId
    const {deployer}=await getNamedAccounts()
    const {deploy,log}=deployments
    if(developmentChains.includes(name) || chainId==31337){
        await deploy("VRFCoordinatorV2Mock",{
            from:deployer,
            log:true,
            waitConfirmations:1,
            args:[BASE_FEE,GAS_PRICE_LINK]
        })
    }
}
module.exports.tags=["all","mock","mix"]