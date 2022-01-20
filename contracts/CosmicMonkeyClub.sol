// SPDX-License-Identifier: MIT
// Written by LEDK For the Cosmic Monkey CLub
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CosmicMonkeyClub is ERC721Enumerable, Ownable {
    using Strings for uint256;
    bytes32 private root;
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public maxSupply = 10000;
    uint256 public maxPresaleSupply = 10000;
    //Max Mint per wallet in Public Sale
    uint256 public maxPublicSaleMint = 30;
    uint256 public maxMintPerTransaction = 6;
    uint256 public maxPresaleMint = 4;
    uint256 public presalePrice = 0.088 ether;
    uint256 public publicPrice = 0.1 ether;
    bool public isPublicSale = false;
    bool public isPresale = false;
    address public collaborator = 0xF4B29441765b9922953BfAf55160879268637697;
    mapping(address => uint256) public addressMintedBalance;

    //Constructor -> Takes Initial Base URI and Root for MERKL Tree
    constructor(string memory name, string memory symbol,string memory _initBaseURI) ERC721(name, symbol) {
        setBaseURI(_initBaseURI);
    }

///////////////////////////////PUBLIC////////////////////////////////////////////////////
    //Presale Mint

    function mintPresale(uint256 _amount,address account, bytes32[] calldata proof) external payable {
        uint256 supply = totalSupply();
        require(_amount > 0);
        require(_amount  <= maxPresaleMint);
        if (msg.sender != owner()) {
            require(isPresale,"Presale isn't live");
            require(isWhiteListed(account, proof), "Not on the whitelist");
            require(msg.value >= (getPresalePrice() * _amount), "We are not cheap");
            require((addressMintedBalance[msg.sender] + _amount) <= maxPresaleMint, "Cosmic Monkey Club: You can't exceed 4 CMC NFT's in Presale.");        
        }
        for (uint256 i = 1; i <= _amount; i++) {
                _safeMint(msg.sender, supply + i);
                addressMintedBalance[msg.sender]++;
            }
    }

    //Public Mint

     function mintPublicSale(uint256 _amount) public payable {
        uint256 supply = totalSupply();
        require(_amount > 0 );
        require(_amount  <= maxMintPerTransaction);
        require(supply + _amount <= maxSupply,"SOLD OUT");
        if (msg.sender != owner()) {
            require(isPublicSale,"Public Sale isn't live");
            require(msg.value >= (getPublicPrice() * _amount), "We are not cheap");
            require(_amount <= maxPublicSaleMint);    
            require((addressMintedBalance[msg.sender] + _amount) <= maxPublicSaleMint, "Cosmic Monkey Club: You can't exceed 30 CMC NFT's.");
        }
        for (uint256 i = 1; i <= _amount; i++) {
            addressMintedBalance[msg.sender]++;
            _safeMint(msg.sender, supply + i);
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
        
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
            : "";
    }

    function contractURI() public view returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/QmQ1JjUVh3KLHQjQbqFcgWoMy5gM3tqY1ZhRdUnin5DrSF";
    }

    // Getters public
    function getPublicSalePrice() public view returns(uint) {
        return publicPrice;
    }

    function getPresalePrice() public view returns(uint) {
        return presalePrice;
    }

    function getPresaleState() view public returns (bool) {
        return isPresale;
    }

    function getPublicSaleState() view public returns (bool) {
        return isPublicSale;
    }

///////////////////////////////Internal///////////////////////////////////////////////////////

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
    //Checks if minted tokens reached presale max supply and stops presale
    function _checkMaxPresaleSupply() internal{
        uint256 supply = totalSupply();
        if(supply==maxPresaleSupply){ 
            StopPresale();
        }   
    }

///////////////////////////////OnlyOWNER/////////////////////////////////////////////////////////

    function setmaxPublicSaleMint(uint256 _newmaxPublicSaleMint) public onlyOwner {
        maxPublicSaleMint = _newmaxPublicSaleMint;
    }
    
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function getBaseURI() view public onlyOwner returns (string memory) {
        return baseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }
    
    // Withdraw with payment split
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 _50_percent = (balance * 0.50 ether) / 1 ether;
        payable(msg.sender).transfer(_50_percent);
        payable(collaborator).transfer(_50_percent);
    }

    function SetMerkleRoot(bytes32 _merkleRoot) public onlyOwner{
        root = _merkleRoot;
    }

    function giftNftToAddress(address _sendNftsTo, uint256 _amount)
        external
        onlyOwner
    {
        uint256 supply = totalSupply();
        for (uint256 i = 1; i <= _amount; i++)
            _safeMint(_sendNftsTo, supply+i);
    }

    function StartPresale(bytes32 _merkleRoot) public onlyOwner{
        isPresale = true;
        SetMerkleRoot(_merkleRoot);
    }

    function StopPresale() public onlyOwner{
        isPresale = false;     
    }
 
    function StartPublicSale() public onlyOwner{
        isPublicSale = true;
    }

    /*function StopPublicSale() public onlyOwner{
        isPublicSale = false;
    }*/

}