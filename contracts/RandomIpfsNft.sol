//SPDX-License-Identifier:MIT
pragma solidity 0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//Errors
error RandomIpfsNft__requestNftErrorNoEth();
error RandomIpfsNft__rangeOutOfBound();
error RandomIpfsNft__onlyOwnerCanWithdraw();
error RandomIpfsNft__alreadyinitialized();
contract RandomIpfsNft is VRFConsumerBaseV2,ERC721URIStorage,Ownable {
    //
    event RequestNFT(uint256 indexed requestId,address requester);
    event NFTMinted(Breed dogBreed,address minter);
    // defining my own data type
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    //ChainLink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS=3;
    uint32 private constant NUM_WORDS=1;
    bool private immutable initialized;
    //VRF Helpers
    mapping(uint256=>address) public s_requestIdToSender;
    //NFT Variables 
    uint256 internal i_mintFee;
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE=100;
    string[] internal s_dogTokenURIs;
    //constructor 
    constructor (
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(
      vrfCoordinatorV2
    ) ERC721("Random Dog Nft","RDN"){
        i_vrfCoordinator=VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId=subscriptionId;
        i_gasLane=gasLane;
        i_callbackGasLimit=callbackGasLimit;
        s_dogTokenURIs=dogUris;
        i_mintFee=mintFee;
        initialized=true;
    }  
    //Functions
    function requestNft() public payable returns(uint256 requestId){
        if(msg.value<i_mintFee)
        {
            revert RandomIpfsNft__requestNftErrorNoEth();
        }
        requestId=i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit RequestNFT(requestId,msg.sender);
    }
    function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords) internal override {
        address dogOwner=s_requestIdToSender[requestId];
        uint256 newToken=s_tokenCounter;
        uint256 moddedRng=randomWords[0] % MAX_CHANCE_VALUE;
        Breed dogBreed=getBreed(moddedRng);
        _safeMint(dogOwner,newToken);
        _setTokenURI(newToken,s_dogTokenURIs[uint256(dogBreed)]);
        emit NFTMinted(dogBreed,dogOwner);

    }
    //getting Breed
    function getBreed(uint moddedRng) public pure returns(Breed){
        uint cumulativeSum=0;
        uint256[3] memory chanceArray=getChanceArray();
        for(uint256 i=0;i<chanceArray.length;i++){
            if(moddedRng >=cumulativeSum && moddedRng<cumulativeSum+chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum+=chanceArray[i];
        }
        revert RandomIpfsNft__rangeOutOfBound();
    }   
    function getChanceArray() public pure returns(uint256[3] memory)
    {
        return [10,30,MAX_CHANCE_VALUE];
    }
    function withdraw() public onlyOwner {
        uint256 amount=address(this).balance;
        (bool success,)=payable(msg.sender).call{value:amount}("");
        if(!success){
        revert RandomIpfsNft__onlyOwnerCanWithdraw();
        }
    }
    function getMintFee() public view returns (uint256){
        return i_mintFee;
    }
    function getTokenURI(uint256 index) public view returns (string memory){
        return s_dogTokenURIs[index];
    } 
    function getTokenCounter() public view returns(uint256) {
        return s_tokenCounter;
    }
    function initializedStatus() public view returns(bool){
        return initialized;
    }
}