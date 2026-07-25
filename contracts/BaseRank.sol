// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BaseRank {
    address public owner;
    uint256 public actionPoints = 10;
    uint256 public referrerBonus = 5;
    uint256 public userBonus = 5;
    uint256 public totalActions;

    mapping(address => uint256) public walletActionCount;
    mapping(address => uint256) public rewardPoints;
    mapping(address => address) public referralOf;
    mapping(address => bool) public isPlayer;
    address[] public players;

    event PointsEarned(address indexed user, address indexed referrer, uint256 points, uint256 totalPoints, uint256 actionCount);
    event PointsUpdated(uint256 actionPoints, uint256 referrerBonus, uint256 userBonus);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function earnPoints(address referrer) external {
        if (!isPlayer[msg.sender]) {
            isPlayer[msg.sender] = true;
            players.push(msg.sender);
        }

        uint256 earned = actionPoints;
        if (referralOf[msg.sender] == address(0) && referrer != address(0)) {
            referralOf[msg.sender] = referrer;
            if (referrer != msg.sender) {
                rewardPoints[referrer] += referrerBonus;
                earned += userBonus;
            }
        }

        totalActions += 1;
        walletActionCount[msg.sender] += 1;
        rewardPoints[msg.sender] += earned;

        emit PointsEarned(msg.sender, referrer, earned, rewardPoints[msg.sender], walletActionCount[msg.sender]);
    }

    function setPoints(uint256 _actionPoints, uint256 _referrerBonus, uint256 _userBonus) external onlyOwner {
        require(_actionPoints > 0, "Action points required");
        actionPoints = _actionPoints;
        referrerBonus = _referrerBonus;
        userBonus = _userBonus;
        emit PointsUpdated(_actionPoints, _referrerBonus, _userBonus);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function getUser(address user) external view returns (uint256 actions, uint256 points, address referrer, bool joined) {
        return (walletActionCount[user], rewardPoints[user], referralOf[user], isPlayer[user]);
    }
}
