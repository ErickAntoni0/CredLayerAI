// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title CredLayerCore - Registro de pagos y sistema de reputación (Trust Layer)
contract CredLayerCore is Ownable {
    using SafeERC20 for IERC20;

    address public immutable stable; // USDC u otra stablecoin

    // ==========================
    // 1) Registro de Pagos
    // ==========================
    struct PaymentRecord {
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        string proofHash; // Hash IPFS o identificador off-chain del recibo
    }
    
    uint256 private _nextPaymentId = 1;
    mapping(uint256 => PaymentRecord) public paymentRecords;
    
    // Mapeo para buscar pagos por usuario (opcional, ayuda al frontend)
    mapping(address => uint256[]) public userPayments;

    event PaymentRegistered(
        uint256 indexed id,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        string proofHash,
        uint256 timestamp
    );

    constructor(address _stable, address _owner) Ownable(_owner) {
        require(_stable != address(0), "stable=0");
        stable = _stable;
    }

    /// @notice Registra un pago transfiriendo USDC directamente y guardando la prueba
    function registerPayment(
        address recipient,
        uint256 amount,
        string calldata proofHash
    ) external returns (uint256 id) {
        require(recipient != address(0), "recipient=0");
        require(amount > 0, "amount=0");

        // Transferir los fondos (el sender debe haber aprobado al contrato previamente)
        IERC20(stable).safeTransferFrom(msg.sender, recipient, amount);

        id = _nextPaymentId++;
        
        paymentRecords[id] = PaymentRecord({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            timestamp: block.timestamp,
            proofHash: proofHash
        });

        // Registrar para ambos usuarios
        userPayments[msg.sender].push(id);
        userPayments[recipient].push(id);

        emit PaymentRegistered(id, msg.sender, recipient, amount, proofHash, block.timestamp);
    }
    
    function getUserPayments(address user) external view returns (uint256[] memory) {
        return userPayments[user];
    }

    // ==========================
    // 2) Reputación (Trust Score)
    // ==========================
    mapping(address => uint256) private _trustScore;
    
    event TrustScoreUpdated(address indexed user, uint256 newScore);

    /// @notice Establece el score exacto (solo owner/backend)
    function setTrustScore(address user, uint256 score) external onlyOwner {
        _trustScore[user] = score;
        emit TrustScoreUpdated(user, score);
    }

    /// @notice Incrementa el score actual (solo owner/backend)
    function bumpTrustScore(address user, uint256 delta) external onlyOwner {
        _trustScore[user] += delta;
        emit TrustScoreUpdated(user, _trustScore[user]);
    }

    /// @notice Reduce el score actual (solo owner/backend)
    function decreaseTrustScore(address user, uint256 delta) external onlyOwner {
        if (_trustScore[user] >= delta) {
            _trustScore[user] -= delta;
        } else {
            _trustScore[user] = 0;
        }
        emit TrustScoreUpdated(user, _trustScore[user]);
    }

    function getTrustScore(address user) external view returns (uint256) {
        return _trustScore[user];
    }
}
