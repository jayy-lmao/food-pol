pragma solidity ^0.4.18;

contract Poll {

    struct Choice {
        string description;
        uint voteCount;
    }

    uint public q;
    address public creator;
    Choice[] public choices;
    uint topChoiceIndex;
    uint mostVotes;
    mapping(address => bool) voters;
    mapping(address => bool) hasVoted;
    uint numVoted;
    bytes choiceNames;
    string sepStr;

    function Poll(uint quorum) public {
        creator = msg.sender;
        mostVotes = 0;
        topChoiceIndex = 0;
        q = quorum;
        sepStr = ", ";
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
    }

    function addChoice(string description) public restricted {
        // 1. The contract creator is able to add n choices
        // 5. Contract creator shall set q quorum.
        Choice memory newChoice = Choice({
            description: description,
            voteCount: 0
        });
        choices.push(newChoice);
        if (choices.length > 1) {
            for (uint j=0; j < bytes(sepStr).length; j++) {
                choiceNames.push(bytes(sepStr)[j]);
            }
        }
        for (uint i=0; i < bytes(description).length; i++) {
            choiceNames.push(bytes(description)[i]);
        }
    }

    function listChoices() public view returns (string){

        return string(choiceNames);
    }

    function getResult() public view returns (string) {
        require(q <= numVoted);
        Choice memory result = choices[topChoiceIndex];
        return result.description;
    }

    function destroy() public restricted {
        require(msg.sender == creator);
        selfdestruct(creator);
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
