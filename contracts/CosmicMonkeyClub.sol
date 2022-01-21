// SPDX-License-Identifier: MIT
// Written by LEDK For the Cosmic Monkey CLub
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract CosmicMonkeyClub is ERC721Enumerable, Ownable, VRFConsumerBase{
    using Strings for uint256;
    bytes32 private root;
    string public baseURI;
    uint256 public maxSupply = 10000;
    uint256 public maxPresaleSupply = 10000;
    uint256 internal maxPublicSaleMint = 30;
    uint256 internal maxMintPerTransaction = 6;
    uint256 internal maxPresaleMint = 4;
    uint256 public presalePrice = 0.088 ether;
    uint256 public publicPrice = 0.1 ether;
    bool public isPublicSale = false;
    bool public isPresale = false;
    address[] public ogList;
    mapping(address => uint256) internal addressMintedBalance;
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 public randomResult;

    constructor(string memory name, string memory symbol,string memory _initBaseURI) ERC721(name, symbol) VRFConsumerBase(
            0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9, // VRF Coordinator
            0xa36085F69e2889c224210F603D836748e7dC0088  // LINK Token
        ) 
        {
        setBaseURI(_initBaseURI);
        keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4;
        fee = 0.1 * 10 ** 18; 
        }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) >= fee);
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }

//PUBLIC
    //Presale Mint

    function mintPresale(uint256 _amount,address account, bytes32[] calldata proof) external payable {
        
        require(_amount > 0);
        require(_amount  <= maxPresaleMint);
        if (msg.sender != owner()) {
            require(isPresale,"Presale isn't live");
            require(isWhiteListed(account, proof), "Not on the whitelist");
            require(msg.value >= (presalePrice * _amount), "We are not cheap");
            require((addressMintedBalance[msg.sender] + _amount) <= maxPresaleMint, "You can't exceed 4 NFT's in Presale.");     
        }
        for (uint256 i = 1; i <= _amount; i++) {
            _safeMint(msg.sender, totalSupply() + i);
            addressMintedBalance[msg.sender]++;
            if(addressMintedBalance[msg.sender] == 4){
                ogList.push(msg.sender);
            }
        }
    }

    //Public Mint

     function mintPublicSale(uint256 _amount) external payable {
        require(_amount > 0 );
        require(_amount  <= maxMintPerTransaction);
        require(totalSupply() + _amount <= maxSupply,"SOLD OUT");
        if (msg.sender != owner()) {
            require(isPublicSale,"Public Sale isn't live");
            require(msg.value >= (publicPrice * _amount), "We are not cheap");
            require(_amount <= maxPublicSaleMint);    
            require((addressMintedBalance[msg.sender] + _amount) <= maxPublicSaleMint, "You can't exceed 30 NFT's.");
        }
        for (uint256 i = 1; i <= _amount; i++) {
            addressMintedBalance[msg.sender]++;
            _safeMint(msg.sender, totalSupply() + i);
            }
    }

    // Token's Uri Format
     function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
        _exists(tokenId),
        "ERC721Metadata: URI query for nonexistent token"
        );
        
        return bytes(_baseURI()).length > 0
            ? string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"))
            : "";
    }

    function contractURI() public pure returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/QmQ1JjUVh3KLHQjQbqFcgWoMy5gM3tqY1ZhRdUnin5DrSF";
    }

   

    //Merkl Proof
    function isWhiteListed(address account, bytes32[] calldata proof) internal view returns(bool) {
        return _verify(_leaf(account), proof);
    }

    function _leaf(address account) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function _verify(bytes32 leaf, bytes32[] memory proof) internal view returns(bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

//OnlyOWNER

    function setBaseURI(string memory _newBaseURI) internal onlyOwner {
        baseURI = _newBaseURI;
    } 

    
    function giftNftToAddress(address _sendNftsTo, uint256 _amount)
        external
        onlyOwner
    { 
        for (uint256 i = 1; i <= _amount; i++)
            _safeMint(_sendNftsTo,totalSupply() + i);
    }

    function StartPresale(bytes32 _merkleRoot) external onlyOwner{
        isPresale = true;
        root = _merkleRoot;
    }

    function StopPresale() external onlyOwner{
        isPresale = false;     
    }
 
    function StartPublicSale() external onlyOwner{
        isPublicSale = true;
    }

}