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
Yet to implement:

3. The contract creator is able to select m friends to vote for n 

May need to make an array friendslist; then have it so that you can select/deselect people for pols

How would you extend the functionality of the smart contract? The description should appear
as comments in the contract source code. (2 marks)
• List out function definition, variables declaration, and pseudo-code
• Explain why

One idea might be to have a timeout limit or something.

*/

