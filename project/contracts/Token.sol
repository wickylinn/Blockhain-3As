// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        
        console.log("Token deployed:");
        console.log("Name:", _name);
        console.log("Symbol:", _symbol);
        console.log("Initial Supply:", _initialSupply);
        console.log("Deployer balance:", _initialSupply);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool) {
        console.log("Transfer called:");
        console.log("From:", uint256(uint160(msg.sender)));
        console.log("To:", uint256(uint160(_to)));
        console.log("Value:", _value);
        console.log("Sender balance before:", balanceOf[msg.sender]);
        console.log("Recipient balance before:", balanceOf[_to]);
        
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        console.log("Sender balance after:", balanceOf[msg.sender]);
        console.log("Recipient balance after:", balanceOf[_to]);
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool) {
        console.log("Approve called:");
        console.log("Owner:", uint256(uint160(msg.sender)));
        console.log("Spender:", uint256(uint160(_spender)));
        console.log("Value:", _value);
        console.log("Current allowance:", allowance[msg.sender][_spender]);
        
        allowance[msg.sender][_spender] = _value;
        
        console.log("New allowance:", allowance[msg.sender][_spender]);
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        console.log("TransferFrom called:");
        console.log("From:", uint256(uint160(_from)));
        console.log("To:", uint256(uint160(_to)));
        console.log("Spender:", uint256(uint160(msg.sender)));
        console.log("Value:", _value);
        
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        console.log("From balance before:", balanceOf[_from]);
        console.log("To balance before:", balanceOf[_to]);
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        console.log("From balance after:", balanceOf[_from]);
        console.log("To balance after:", balanceOf[_to]);
        console.log("Allowance after:", allowance[_from][msg.sender]);
        
        emit Transfer(_from, _to, _value);
        return true;
    }
}
