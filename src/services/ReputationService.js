import { ethers } from 'ethers';
import axios from 'axios';

export class ReputationService {
  constructor() {
    this.provider = null;
    this.microPayContract = null;
    this.culturaChainContract = null;
    const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
    this.apiBaseUrl = ENV.VITE_API_URL || 'http://localhost:3001/api';
  }

  async initialize() {
    try {
      // Configurar provider
      const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
      const rpcUrl = ENV.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Configurar contratos
      const microPayAddress = ENV.VITE_MICROPAY_CONTRACT_ADDRESS;
      const culturaChainAddress = ENV.VITE_CULTURACHAIN_CONTRACT_ADDRESS;

      if (microPayAddress) {
        const microPayABI = [
          'function getENSProfile(address user) external view returns (string memory ensName, string memory subdomain, uint256 reputationScore, uint256 registrationTime, uint256 lastActivity, bool isActive)',
          'function registerENSProfile(string memory ensName, string memory subdomain) external',
          'function updateReputation(address user, int256 scoreChange, string memory reason) external',
          'function getUser(address user) external view returns (tuple(string ensName, bool isRegistered, uint256 totalSent, uint256 totalReceived, uint256 reputationScore, uint256 registrationTime))'
        ];
        this.microPayContract = new ethers.Contract(microPayAddress, microPayABI, this.provider);
      }

      if (culturaChainAddress) {
        const culturaChainABI = [
          'function getCreatorProfile(address creator) external view returns (string memory category, string memory description, uint256 subscriberCount, uint256 totalEarnings, uint256 reputationScore, bool isActive)',
          'function registerCreator(string memory category, string memory description) external',
          'function updateCreatorReputation(address creator, int256 scoreChange, string memory reason) external',
          'function getCreatorStats(address creator) external view returns (uint256 totalContent, uint256 totalSubscribers, uint256 totalEarnings)'
        ];
        this.culturaChainContract = new ethers.Contract(culturaChainAddress, culturaChainABI, this.provider);
      }

      console.info('ReputationService inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando ReputationService:', error);
      throw error;
    }
  }

  // Obtener perfil ENS de CredLayer AI
  async getENSProfile(address) {
    try {
      if (!this.microPayContract) {
        throw new Error('Contrato MicroPay no configurado');
      }

      const profile = await this.microPayContract.getENSProfile(address);
      
      return {
        address,
        ensName: profile.ensName,
        subdomain: profile.subdomain,
        reputationScore: profile.reputationScore.toNumber(),
        registrationTime: profile.registrationTime.toNumber(),
        lastActivity: profile.lastActivity.toNumber(),
        isActive: profile.isActive,
        platform: 'micropay'
      };
    } catch (error) {
      console.error('Error obteniendo perfil ENS:', error);
      return null;
    }
  }

  // Obtener perfil de CulturaChain MX
  async getCulturaChainProfile(address) {
    try {
      if (!this.culturaChainContract) {
        throw new Error('Contrato CulturaChain no configurado');
      }

      const profile = await this.culturaChainContract.getCreatorProfile(address);
      
      return {
        address,
        category: profile.category,
        description: profile.description,
        subscriberCount: profile.subscriberCount.toNumber(),
        totalEarnings: profile.totalEarnings.toNumber(),
        reputationScore: profile.reputationScore.toNumber(),
        isActive: profile.isActive,
        platform: 'culturachain'
      };
    } catch (error) {
      console.error('Error obteniendo perfil CulturaChain:', error);
      return null;
    }
  }

  // Registrar usuario en CredLayer AI
  async registerMicroPayUser(address, ensName, subdomain, signer) {
    try {
      if (!this.microPayContract) {
        throw new Error('Contrato MicroPay no configurado');
      }

      const contractWithSigner = this.microPayContract.connect(signer);
      const tx = await contractWithSigner.registerENSProfile(ensName, subdomain);
      
      await tx.wait();
      
      // Notificar al backend
      await this.notifyBackendRegistration(address, 'micropay', {
        ensName,
        subdomain
      });

      return tx.hash;
    } catch (error) {
      console.error('Error registrando usuario MicroPay:', error);
      throw error;
    }
  }

  // Registrar usuario en CulturaChain MX
  async registerCulturaChainUser(address, category, description, signer) {
    try {
      if (!this.culturaChainContract) {
        throw new Error('Contrato CulturaChain no configurado');
      }

      const contractWithSigner = this.culturaChainContract.connect(signer);
      const tx = await contractWithSigner.registerCreator(category, description);
      
      await tx.wait();
      
      // Notificar al backend
      await this.notifyBackendRegistration(address, 'culturachain', {
        category,
        description
      });

      return tx.hash;
    } catch (error) {
      console.error('Error registrando usuario CulturaChain:', error);
      throw error;
    }
  }

  // Actualizar reputación en plataforma específica
  async updateReputation(address, platform, points, reason, signer) {
    try {
      let tx;
      
      if (platform === 'micropay' && this.microPayContract) {
        const contractWithSigner = this.microPayContract.connect(signer);
        tx = await contractWithSigner.updateReputation(address, points, reason);
      } else if (platform === 'culturachain' && this.culturaChainContract) {
        const contractWithSigner = this.culturaChainContract.connect(signer);
        tx = await contractWithSigner.updateCreatorReputation(address, points, reason);
      } else {
        throw new Error('Plataforma no soportada');
      }

      await tx.wait();
      
      // Notificar al backend
      await this.notifyBackendReputationUpdate(address, platform, points, reason);

      return tx.hash;
    } catch (error) {
      console.error('Error actualizando reputación:', error);
      throw error;
    }
  }

  // Sincronizar reputación entre plataformas
  async syncReputationAcrossPlatforms(address) {
    try {
      // Obtener reputación de ambas plataformas
      const microPayProfile = await this.getENSProfile(address);
      const culturaProfile = await this.getCulturaChainProfile(address);

      if (!microPayProfile && !culturaProfile) {
        throw new Error('Usuario no registrado en ninguna plataforma');
      }

      // Calcular reputación promedio ponderada
      let totalReputation = 0;
      let platformCount = 0;

      if (microPayProfile) {
        totalReputation += microPayProfile.reputationScore;
        platformCount++;
      }

      if (culturaProfile) {
        totalReputation += culturaProfile.reputationScore;
        platformCount++;
      }

      const averageReputation = Math.floor(totalReputation / platformCount);

      // Sincronizar con el backend
      await axios.post(`${this.apiBaseUrl}/reputation/sync`, {
        address,
        microPayReputation: microPayProfile?.reputationScore || 0,
        culturaChainReputation: culturaProfile?.reputationScore || 0,
        averageReputation,
        lastSync: Date.now()
      });

      return {
        microPayReputation: microPayProfile?.reputationScore || 0,
        culturaChainReputation: culturaProfile?.reputationScore || 0,
        averageReputation,
        platformCount
      };
    } catch (error) {
      console.error('Error sincronizando reputación:', error);
      throw error;
    }
  }

  // Obtener estadísticas cruzadas
  async getCrossPlatformStats(address) {
    try {
      const microPayProfile = await this.getENSProfile(address);
      const culturaProfile = await this.getCulturaChainProfile(address);

      const stats = {
        totalReputation: 0,
        platformCount: 0,
        microPay: microPayProfile,
        culturaChain: culturaProfile,
        combinedScore: 0
      };

      if (microPayProfile) {
        stats.totalReputation += microPayProfile.reputationScore;
        stats.platformCount++;
      }

      if (culturaProfile) {
        stats.totalReputation += culturaProfile.reputationScore;
        stats.platformCount++;
      }

      if (stats.platformCount > 0) {
        stats.combinedScore = Math.floor(stats.totalReputation / stats.platformCount);
      }

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas cruzadas:', error);
      throw error;
    }
  }

  // Notificar registro al backend
  async notifyBackendRegistration(address, platform, data) {
    try {
      await axios.post(`${this.apiBaseUrl}/users/register`, {
        address,
        platform,
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error notificando registro al backend:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  // Notificar actualización de reputación al backend
  async notifyBackendReputationUpdate(address, platform, points, reason) {
    try {
      await axios.post(`${this.apiBaseUrl}/reputation/update`, {
        address,
        platform,
        points,
        reason,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error notificando actualización al backend:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  // Obtener historial de reputación cruzada
  async getCrossPlatformHistory(address) {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/reputation/history/${address}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo historial cruzado:', error);
      return [];
    }
  }

  // Calcular nivel de reputación
  calculateReputationLevel(score) {
    if (score >= 900) return { level: 'Experto', color: 'green', multiplier: 1.5 };
    if (score >= 750) return { level: 'Avanzado', color: 'blue', multiplier: 1.3 };
    if (score >= 600) return { level: 'Intermedio', color: 'yellow', multiplier: 1.1 };
    if (score >= 400) return { level: 'Principiante', color: 'orange', multiplier: 1.0 };
    return { level: 'Novato', color: 'red', multiplier: 0.8 };
  }

  // Obtener beneficios por nivel de reputación
  getReputationBenefits(level) {
    const benefits = {
      'Experto': {
        microPay: ['Tasas de interés reducidas', 'Límites de préstamo altos', 'Acceso prioritario'],
        culturaChain: ['Royalties premium', 'NFTs exclusivos', 'Sponsorships']
      },
      'Avanzado': {
        microPay: ['Tasas moderadas', 'Límites medios', 'Soporte prioritario'],
        culturaChain: ['Royalties estándar', 'NFTs limitados', 'Networking']
      },
      'Intermedio': {
        microPay: ['Tasas estándar', 'Límites básicos', 'Soporte estándar'],
        culturaChain: ['Royalties básicos', 'NFTs básicos', 'Comunidad']
      },
      'Principiante': {
        microPay: ['Tasas altas', 'Límites bajos', 'Soporte básico'],
        culturaChain: ['Royalties mínimos', 'Sin NFTs', 'Aprendizaje']
      },
      'Novato': {
        microPay: ['Tasas máximas', 'Sin préstamos', 'Solo pagos'],
        culturaChain: ['Sin royalties', 'Solo visualización', 'Onboarding']
      }
    };

    return benefits[level] || benefits['Novato'];
  }
}
