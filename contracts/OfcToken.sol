// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity >=0.8.9 <0.9.0;

import "./ERC721.sol";
import "./ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract OfcToken is ERC721, Ownable {
    using Counters for Counters.Counter;

    address public artist;
    address public developer;

    uint256 public royaltyFee;

    string public baseURI = "ipfs/";

    constructor(
        string memory tokenName,
        string memory symbol,
        address _artist,
        uint256 _royaltyFee
    ) ERC721(tokenName, symbol) {
        artist = _artist;
        royaltyFee = _royaltyFee;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function setBaseUri(string memory baseuri_) public onlyOwner {
        baseURI = baseuri_;
    }

    uint256 public constant MAX_SUPPLY = 11111;
    uint256 public constant MAX_PER_WALLET = 5;

    Counters.Counter private _tokenIds;

    bool public saleActive = false;

    bool private _locked = false; // for re-entrancy guard

    event Sale(address from, address to, uint256 value);

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        Strings.toString(_tokenId),
                        ".json"
                    )
                )
                : "";
    }

    function mintToken() public payable nonReentrant returns (uint256) {
        require(saleActive, "Sales is closed at the moment.");
        require(
            balanceOf(_msgSender()) < MAX_PER_WALLET,
            "Exceeds mint limit."
        );
        require(_tokenIds.current() < MAX_SUPPLY, "All tokens are minted");

        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _safeMint(_msgSender(), id);

        return id;
    }

    function toggleSaleState() public onlyOwner {
        saleActive = !saleActive;
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner or approved"
        );

        if (msg.value > 0) {
            uint256 royalty = (msg.value * royaltyFee) / 10000;
            _payRoyality(royalty);
            (bool success2, ) = payable(from).call{value: msg.value - royalty}(
                ""
            );

            require(success2);

            emit Sale(from, to, msg.value);
        }

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public payable override {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner or approved"
        );

        if (msg.value > 0) {
            uint256 royalty = (msg.value * royaltyFee) / 10000;
            _payRoyality(royalty);

            (bool success2, ) = payable(from).call{value: msg.value - royalty}(
                ""
            );
            require(success2);

            emit Sale(from, to, msg.value);
        }

        _safeTransfer(from, to, tokenId, _data);
    }

    function _payRoyality(uint256 _royalityFee) internal {
        (bool success1, ) = payable(artist).call{
            value: (_royalityFee * 9) / 10
        }("");
        require(success1);

        (bool success2, ) = payable(owner()).call{
            value: (_royalityFee * 1) / 10
        }("");
        require(success2);
    }

    function setRoyaltyFee(uint256 _royaltyFee) public onlyOwner {
        royaltyFee = _royaltyFee;
    }

    function withdraw() external onlyOwner nonReentrant {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed.");
    }

    modifier nonReentrant() {
        require(!_locked, "No re-entrant call.");
        _locked = true;
        _;
        _locked = false;
    }
}
