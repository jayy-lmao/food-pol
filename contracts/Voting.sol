pragma solidity ^0.4.18;

contract Poll {

    uint public q;
    address public creator;
    uint topChoiceIndex;
    mapping(address => bool) public voters;
    mapping(address => bool) hasVoted;
    uint numVoted;
    uint numChoices;
    bool private tie;
    bytes32[64] public choiceNames;
    uint[64] public choiceVotes;

    function Poll(uint quorum) public {
        creator = msg.sender;
        q = quorum;
    }
    
    function setQuorum(uint quorum) public restricted {
        q = quorum;
    }

    function addFriend(address friendAddress) public restricted {
        voters[friendAddress] = true;
    }

    function vote(uint choiceIndex) public {
        require(numVoted < q && !hasVoted[msg.sender] && voters[msg.sender]);
        hasVoted[msg.sender] = true;
        choiceVotes[choiceIndex]++;
        numVoted++;
        if (choiceVotes[choiceIndex] > choiceVotes[topChoiceIndex]){
            if (choiceVotes[choiceIndex] == choiceVotes[topChoiceIndex]){
                tie = true;
            } else { 
                topChoiceIndex = choiceIndex;
                tie = false; 
            }
        }
    }


    function addChoice(bytes32 description) public restricted {
        choiceNames[numChoices]=description;
        numChoices++;
    }

    function listChoices() public view returns (bytes32[64]){
        return choiceNames;
    }

    function getResult() public view returns (bytes32) {
        require(q == numVoted);
        return tie ? bytes32(0x57696e6e65727320686176652074696564) : choiceNames[topChoiceIndex];
        /* This string of bytes32 is an error message associated with tie-ing.*/
    }

    function destroy() public restricted {
        selfdestruct(creator);
    }


    modifier restricted() {
        require(msg.sender==creator);
        _;
    }

}


/*
================================================================================================================
How would you extend the functionality of the smart contract? The description should appear
as comments in the contract source code. (2 marks)
• List out function definition, variables declaration, and pseudo-code
• Explain why
================================================================================================================

How I would extend the smart contract:

I would like to add a time-out so that if friends were unreliable, and only some voted, a winner would still be chosen.

The check if the contract had timed-out would have to be performed in the `getResult` function. 
To do this, change the `require(q == numVoted)` in the `getResult` function to also check timestamp and compare it to a new timeout variable, set by the creator. 
The timeout variable would be set by the creator with a new `setTimeout` function, callable by only the creator (Using the restricted modifier). 
This might not be a good fit for every blockchain voting DAPP, but in the case of something time-sensitive like lunch it is essential.
Below I do not describe the exact conversion required, nor do I consider gas costs (it's to be considered solidity-flavored pseudocode)

Variabes:
```
  uint public createdTimestamp;
  uint public timeout;
```

New Function:
```
function setTimeout(uint newTimeout) public restricted {
    tiemout = newTimeout;
}
```

Changes to existing functions:

```
    function Poll(uint quorum) public {
        ...
        timeout = *a very large number, days worth even*
        createdTimestamp = block.timestamp;
        ...
    }
```

```
function getResult() public view returns (bytes32) {
    ...
    require(q == numVoted &&  createdTimestamp - now < timeout);
    ...
}
```

*/

