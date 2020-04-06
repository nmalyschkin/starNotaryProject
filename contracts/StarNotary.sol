pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";


// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {
    // Star data
    struct Star {
        string name;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'

    string public name;
    string public symbol;

    constructor() public ERC721() {
        name = "Star Notary Token";
        symbol = "SNT";
    }

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;
    // mapping the Star with the Owner Address
    mapping(uint256 => mapping(uint256 => bool)) public exchangeStarsMap;

    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public {
        // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You can't sale the Star you don't owned"
        );
        starsForSale[_tokenId] = _price;
    }

    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        _transferFrom(ownerAddress, msg.sender, _tokenId);
        // We need to make this conversion to be able to use transfer() function to transfer ethers
        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint256 _tokenId)
        public
        view
        returns (string memory)
    {
        return this.tokenIdToStarInfo(_tokenId);
        //1. You should return the Star saved in tokenIdToStarInfo mapping
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        require(
            _isApprovedOrOwner(msg.sender, _tokenId1),
            "first token needs to be approved to sender"
        );
        if (exchangeStarsMap[_tokenId2][_tokenId1]) {
            delete exchangeStarsMap[_tokenId2][_tokenId1];

            address par1 = msg.sender;
            address par2 = ownerOf(_tokenId2);

            _transferFrom(par1, par2, _tokenId1);
            _transferFrom(par2, par1, _tokenId2);
        } else {
            exchangeStarsMap[_tokenId1][_tokenId2] = true;
        }
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        transferFrom(msg.sender, _to1, _tokenId);
    }
}
