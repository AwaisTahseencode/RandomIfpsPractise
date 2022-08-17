// SPDX-License-Identifier: MIT
pragma solidity 0.8.8;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
contract BasicNft is ERC721{
    // we have to initialize the constructor of the ERC721 tokken which takes 2 args name and the symbol 
    uint256 private s_tokenId;
    string public constant TOKEN_URI="ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    constructor() ERC721("Dogie","Pug"){
        s_tokenId=0;
    }
    function mintNft() public returns(uint256){
        _safeMint(msg.sender, s_tokenId);
        s_tokenId++;
        return s_tokenId;
    }
    //0x512F7469BcC83089497506b5df64c6E246B39925
    function tokenURI(uint256 tokenId) public view override returns (string memory){
        return TOKEN_URI;
    }
    function getTokenCounter() public view returns (uint256){
        return s_tokenId;
    }
}