// SPDX-License-Identifier: MIT
// Made with ❤ by Rens L & LEDK
// Email: info@renslaros.com
// Twitter: @humanrens 
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract CosmicMonkeyClub is ERC721Enumerable, Ownable, VRFConsumerBase{
    using Strings for uint256;
    using MerkleProof for bytes32[];
    string public baseURI;
    string public contractUrl = "";
    bytes32 private merkleRoot;
    bytes32 internal keyHash;
    uint256 public maxSupply = 10000;
    uint256 public maxPresaleSupply = 10000;
    uint256 public presalePrice = 0.088 ether;
    uint256 public publicPrice = 0.1 ether;
    uint256 internal maxPublicSaleMint = 30;
    uint256 internal maxMintPerTransaction = 6;
    uint256 internal maxPresaleMint = 4;
    uint256 internal fee;
    uint256 public randomResult;
    bool public isPublicSale = false;
    bool public isPresale = false;
    bool public isRevealed = false;
    address[] public ogList;
    mapping(address => uint256) internal addressMintedBalance;
    constructor(string memory name, string memory symbol,string memory _initBaseURI) 
    ERC721(name, symbol) 
    VRFConsumerBase(0x8C7382F9D8f56b33781fE506E897a4F1e2d17255,0x326C977E6efc84E512bB9C30f76E30c160eD06FB) 
    {
        setBaseURI(_initBaseURI);
        // Chainlink VRF keyhash + fee ( different per network )
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 0.1 * 10 ** 18; 
    }
    // Request random number from Chainlink VRF
    function getRandomNumber() public onlyOwner returns (bytes32 requestId) {
        require(randomResult == 0);
        require(LINK.balanceOf(address(this)) >= fee);
        return requestRandomness(keyHash, fee);
    }
    // randomness callback function used by VRF coordinator
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness + 1;
    }
    
    //Presale Mint
    function mintPresale(uint256 _amount,address account, bytes32[] calldata proof) external payable {
        
        require(_amount > 0);
        require(randomResult > 0);
        require(_amount  <= maxPresaleMint);
        if (msg.sender != owner()) {
            require(isPresale,"Presale isn't live");
            require(isWhiteListed(account, proof), "You're not whitelisted");
            require(msg.value >= (presalePrice * _amount), "Amount to low");
            require((addressMintedBalance[msg.sender] + _amount) <= maxPresaleMint, "Max. 4 NFT's in Presale.");     
        }
        for (uint256 i = 1; i <= _amount; i++) {
            //_safeMint(msg.sender, totalSupply() + i);
            _safeMint(msg.sender, ((randomResult + totalSupply()) % maxSupply) );
            addressMintedBalance[msg.sender]++;
            if(addressMintedBalance[msg.sender] == 4){
                ogList.push(msg.sender);
            }
        }
    }

    //Public Mint
     function mintPublicSale(uint256 _amount) external payable {
        require(_amount > 0 );
        require(randomResult > 0);
        require(_amount  <= maxMintPerTransaction, "Exceeding max. mint amount per tx.");
        require(totalSupply() + _amount <= maxSupply,"SOLD OUT");
        if (msg.sender != owner()) {
            require(isPublicSale,"Public Sale isn't live");
            require(msg.value >= (publicPrice * _amount), "We are not cheap");
            require(_amount <= maxPublicSaleMint);    
            require((addressMintedBalance[msg.sender] + _amount) <= maxPublicSaleMint, "Max. 30 NFT's.");
        }
        for (uint256 i = 1; i <= _amount; i++) {
            addressMintedBalance[msg.sender]++;
            //_safeMint(msg.sender, totalSupply() + i);
            _safeMint(msg.sender, ((randomResult + totalSupply()) % maxSupply));
            }
    }

    //Merkle Proof
    function isWhiteListed(address account, bytes32[] calldata proof) internal view returns(bool) {
        return _verify(_leaf(account), proof);
    }

    function _leaf(address account) internal pure returns(bytes32) {
        return keccak256(abi.encodePacked(account));
    }

    function _verify(bytes32 leaf, bytes32[] memory proof) internal view returns(bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }


    // URI's
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
        if (isRevealed) {
            return bytes(_baseURI()).length > 0
                ? string(abi.encodePacked(_baseURI(), tokenId.toString(), ".json"))
                : "";
        }
        return _baseURI();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function contractURI() public view returns (string memory) {
        return contractUrl;
    }

    function setContractUri(string memory _newContractUrl) public onlyOwner {
        contractUrl = _newContractUrl;
    }

    // Sale Controls

    function setPresalePrice(uint256 _amount) external onlyOwner {
        presalePrice = _amount; 
    }

    function setPublicPrice(uint256 _amount) external onlyOwner {
        publicPrice = _amount; 
    }
    function StartPresale(bytes32 _merkleRoot) external onlyOwner{
        merkleRoot = _merkleRoot;
        isPresale = true;
    }

    function StopPresale() external onlyOwner{
        isPresale = false;     
    }
 
    function StartPublicSale() external onlyOwner{
        isPublicSale = true;
    } 

    function setRevealed() external onlyOwner {
        isRevealed = true;
    }

    // Gifting
    function giftNftToAddress(address _sendNftsTo, uint256 _amount)
        external
        onlyOwner
    {
        require(totalSupply() + _amount <= maxSupply);
        require(randomResult > 0); 
        for (uint256 i = 1; i <= _amount; i++){
            _safeMint(_sendNftsTo, ((randomResult + totalSupply()) % maxSupply));
        }
            
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}