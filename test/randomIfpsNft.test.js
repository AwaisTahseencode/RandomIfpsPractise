const {assert,expect}=require("chai")
const { network, deployments, ethers } = require("hardhat")
const {developmentChains,networkConfig}=require("../helper-hardhat-config")
!developmentChains.includes(network.name)?describe.skip:
describe("Random Ifps Test",()=>{
    let randomIfpsContract, vrfCoordinatorMock
    beforeEach(async()=>{
        const accounts=await ethers.getSigners()
        const deployer=await accounts[0]
        await deployments.fixture(["all"])
        randomIfpsContract=await ethers.getContract("RandomIfpsNft",deployer)
        vrfCoordinatorMock=await ethers.getContract("VRFCoordinatorV2Mock",deployer)
    })
    //checking for contructor
    it("Constructor",async()=>{
        const dogUri=await randomIfpsContract.getTokenURI(0)
        const initializedStatus=await randomIfpsContract.initializedStatus()
        assert(dogUri.includes("ifps://"))
        assert.equal(initializedStatus,"true")
    })
})