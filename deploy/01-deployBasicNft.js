const {network,deployments,getNamedAccounts}=require("hardhat")
const {developmentChains}=require("../helper-hardhat-config")
module.exports=async()=>{
    const {deploy,log}=deployments
    const {deployer}=await getNamedAccounts()
    log("----------------------------------")
    const args=[]
    log("Deploying-------------------------")
    const basicNft=await deploy("BasicNft",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmations:1
    })
    log(`Deployed Successfully at ${basicNft.address}`)
}
module.exports.tags=["basicNft"]