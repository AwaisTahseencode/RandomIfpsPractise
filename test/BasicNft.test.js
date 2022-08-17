const { assert, expect } = require("chai");
const {network,deployments,getNamedAccounts, ethers}=require("hardhat")
const {developmentChains}=require("../helper-hardhat-config")
describe("Basic Nft tests ",()=>{   
    let basicNft
    const {log}=deployments
    beforeEach(async()=>{
        const accounts=await ethers.getSigners()
        const deployer=await accounts[0]
        log("Deploting, Please Wait ....")
       await deployments.fixture(["basicNft"])
       basicNft=await ethers.getContract("BasicNft")
    //    await basicNft.wait(1)
       log("Successfully Deployed !")
    })
    it("it checks for the intial value of the tokken",async()=>{
        const intialValue=await basicNft.getTokenCounter()
        // console.log(intialValue)
        assert(intialValue.toString()==="0")
    })
    it("checks for the tokenURI and increment of tokenId",async()=>{
        await basicNft.mintNft()
        const afterTokenURI=await basicNft.tokenURI(0)
        // const beforeTokenURI=await basicNft.TOKEN_URI
        const tokenCounter=await basicNft.getTokenCounter()
        assert.equal(afterTokenURI,"ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json")
        assert.equal(tokenCounter.toString(),"1")


    })
})