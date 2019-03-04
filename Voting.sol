pragma solidity ^0.4.17;

contract Poll {

    struct Choice {
        string description;
        uint voteCount;
    }

    uint quorum;
    address creator;
    Choice[] public choices;
    uint topChoiceIndex;
    uint mostVotes;
    uint result;
    mapping(address => bool) voters;
    mapping(address => bool) hasVoted;
    uint numVoted;

    function Poll(uint quorum) public {
        mostVotes = 0;
        topChoiceIndex = 0;
        quorum = quorum;
    }

    function addFriend(address friendAddress) public restricted {
        voters[friendAddress] = true;
    }

    function vote(uint choiceIndex) public {
        Choice storage selectedChoice = choices[choiceIndex];
        require(voters[msg.sender]); // User has been added to voters by Creator
        require(!hasVoted[msg.sender]); // User has not yet voted for this particular vote

        hasVoted[msg.sender] = true;
        selectedChoice.voteCount++;
        numVoted++;
        if (selectedChoice.voteCount > mostVotes) {
            mostVotes = selectedChoice.voteCount;
            topChoiceIndex = choiceIndex;
        }
        if (numVoted >= quorum) {
            result = topChoiceIndex;
        }
    }

    function addChoice(string description) public restricted {
        // 1. The contract creator is able to add n choices
        // 5. Contract creator shall set q quorum.
        Choice memory newChoice = Choice({
            description: description,
            voteCount: 0
        });
        choices.push(newChoice);
    }

    function listChoices() public view returns (Choice[]){
        return choices;
    }

    function getResult() public view returns (Choice) {
        return choices[topChoiceIndex];
    }

    modifier restricted() {
        // 2. Only the contract creator is able to add n choices via deployed contract
        require(msg.sender==creator);
        _;
    }

}


/*
Yet to implement:

3. The contract creator is able to select m friends to vote for n 

May need to make an array friendslist; then have it so that you can select/deselect people for pols

*/
