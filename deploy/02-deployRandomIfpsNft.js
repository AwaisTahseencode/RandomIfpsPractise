const {network,deployments,getNamedAccounts,ethers}=require("hardhat")
const {developmentChains,networkConfig}=require("../helper-hardhat-config")
require("dotenv").config()
const {storeImages,storeMetaData}=require("../utils/uploadToPinata")
const metaDataTemplate={
    name:"",
    image:"",
    description:"",
    attributes:[
        {
            trait_type:"cuteness",
            value:"100"
        },
    ],
}
let tokenUri=[]
const imageLocation="./images/randomIfpsNft"
module.exports=async()=>{
    let vrfCoordinatorV2Address,subscriptionId,vrfCoordinatorV2Mock
    const FUND_FEE="1000000000000000000000"
    const chainId=network.config.chainId
    const {deploy,log}=deployments
    const {deployer}=await getNamedAccounts()
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUri = await handleTokenUris()
        console.log(tokenUri)
    }
    if(developmentChains.includes(network.name) || chainId==31337){
         vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock",deployer)
        vrfCoordinatorV2Address=vrfCoordinatorV2Mock.address
        const txResponse=await vrfCoordinatorV2Mock.createSubscription()
        const txReceipt=await txResponse.wait(1)
        subscriptionId=txReceipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(vrfCoordinatorV2Address,FUND_FEE)
    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]["vrfCoordinatorV2Address"]
        subscriptionId=networkConfig[chainId]["subscriptionId"]
    }
    log("-------------------------------")
    const args=[
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId]["gasLane"],
        networkConfig[chainId]["mintFee"],
        networkConfig[chainId]["callbackGasLimit"],
        tokenUri
    ]
    const randomIfpsNft=await deploy("RandomIfpsNft",{
        from:deployer,
        args:args,
        log:true,
        waitConfirmations:1
    })

}
const handleTokenUris=async()=>{
try {
   const tokenUri=[]
const {responses:imageUploadResponse,files}=await storeImages(imageLocation)
for(fileIndex in files){
    let tokenUriMetaData={...metaDataTemplate}
    tokenUriMetaData.name=files[fileIndex].replace(".png","")
    tokenUriMetaData.description=`A beautiful and adorable art of ${tokenUriMetaData.name} pup !`
    tokenUriMetaData.image=`ifps://${files[fileIndex].IpfsHash}`
    console.log(`Uploading the ${tokenUriMetaData.name}`)
    const response=await storeMetaData(tokenUriMetaData)
    tokenUri.push(`ifps://${response.IpfsHash}`)
}
console.log("Meta Data Uploaded Successfully, Here are your uris")
// console.log(tokenUri)
return tokenUri
} catch (error) {
    console.log(error)
}
}
module.exports.tags=["all","randomifps","mix"]