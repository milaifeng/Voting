// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Poll {
        uint id;
        address creator;
        string title;
        string description;
        string[] options;
        uint deadline;
        uint totalVotes;
        bool active;
    }

    struct Vote {
        uint pollId;
        uint optionIndex;
        address voter;
    }

    Poll[] public polls;
    mapping(uint => mapping(uint => uint)) public votes; // pollId => optionIndex => count
    mapping(uint => mapping(address => bool)) public hasVoted;
    mapping(address => uint[]) private _userVotes;

    modifier onlyCreator(uint _pollId) {
        require(polls[_pollId].creator == msg.sender, "Not creator");
        _;
    }

    function userVotes(address user) external view returns (uint[] memory) {
        return _userVotes[user];
    }

    event PollCreated(uint id, string title, uint deadline);
    event Voted(uint pollId, address voter, uint optionIndex);

    // 创建选票池
    function createPoll(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint _durationInMinutes
    ) external {
        require(_options.length >= 2, "At least 2 options");
        uint deadline = block.timestamp + _durationInMinutes * 1 minutes;

        Poll memory newPoll = Poll({
            id: polls.length,
            creator: msg.sender,
            title: _title,
            description: _description,
            options: _options,
            deadline: deadline,
            totalVotes: 0,
            active: true
        });

        polls.push(newPoll);
        emit PollCreated(polls.length - 1, _title, deadline);
    }

    // 投票
    function vote(uint _pollId, uint _optionIndex) external {
        Poll storage poll = polls[_pollId];
        require(block.timestamp < poll.deadline, "Poll ended");
        require(!hasVoted[_pollId][msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option");

        votes[_pollId][_optionIndex]++;
        poll.totalVotes++;
        hasVoted[_pollId][msg.sender] = true;
        _userVotes[msg.sender].push(_pollId);

        emit Voted(_pollId, msg.sender, _optionIndex);
    }

    // 根据ID获取选票池
    function getPoll(uint _id) external view returns (Poll memory) {
        return polls[_id];
    }

    // 获取所有的选票池
    function getAllPolls() external view returns (Poll[] memory) {
        return polls;
    }

    // 结束选票
    function endPoll(uint _pollId) external onlyCreator(_pollId) {
        polls[_pollId].active = false;
    }

    // 返回选项票数数组
    function getOptionVotes(
        uint _pollId
    ) external view returns (uint[] memory) {
        Poll memory poll = polls[_pollId];
        uint[] memory optionVotes = new uint[](poll.options.length);
        for (uint i = 0; i < poll.options.length; i++) {
            optionVotes[i] = votes[_pollId][i];
        }
        return optionVotes;
    }
}
