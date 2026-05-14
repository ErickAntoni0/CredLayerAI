import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import toast from 'react-hot-toast';

export const useWalletConnection = () => {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, error, isLoading } = useConnect();
  const { disconnect } = useDisconnect();
  
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [ensName, setEnsName] = useState('');
  const [reputationScore, setReputationScore] = useState(0);

  // Servicios simplificados (sin dependencias externas)
  const ensService = useMemo(() => ({
    verifyOwnership: async () => {
      // Simulación - en producción usaría el servicio real
      return true;
    }
  }), []);
  
  const reputationService = useMemo(() => ({
    getENSProfile: async (walletAddress) => {
      if (!walletAddress) return null;
      return {
        address: walletAddress,
        ensName: `user${walletAddress.slice(2, 6)}.micro.eth`,
        subdomain: `user${walletAddress.slice(2, 6)}`,
        reputationScore: Math.floor(Math.random() * 500) + 200,
        registrationTime: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        lastActivity: Date.now(),
        isActive: true,
        platform: 'micropay'
      };
    },
    getCulturaChainProfile: async (walletAddress) => {
      if (!walletAddress) return null;
      return {
        address: walletAddress,
        category: 'Músico',
        description: 'Creador de contenido musical',
        subscriberCount: Math.floor(Math.random() * 100) + 10,
        totalEarnings: Math.floor(Math.random() * 1000) + 100,
        reputationScore: Math.floor(Math.random() * 300) + 100,
        isActive: true,
        platform: 'culturachain'
      };
    },
    registerMicroPayUser: async () => {
      return '0x' + Math.random().toString(16).substr(2, 64);
    },
    registerCulturaChainUser: async () => {
      return '0x' + Math.random().toString(16).substr(2, 64);
    },
    updateReputation: async () => {
      return '0x' + Math.random().toString(16).substr(2, 64);
    },
    syncReputationAcrossPlatforms: async () => {
      return {
        microPayReputation: Math.floor(Math.random() * 500) + 200,
        culturaChainReputation: Math.floor(Math.random() * 300) + 100,
        averageReputation: Math.floor(Math.random() * 400) + 150,
        platformCount: 2
      };
    }
  }), []);

  // Conectar wallet
  const connectWallet = useCallback(async (connectorId) => {
    try {
      const selectedConnector = connectors.find(c => c.id === connectorId);
      if (!selectedConnector) {
        throw new Error('Connector no encontrado');
      }

      await connect({ connector: selectedConnector });
      toast.success('Wallet conectada exitosamente');
    } catch (error) {
      console.error('Error conectando wallet:', error);
      toast.error(`Error conectando wallet: ${error.message}`);
    }
  }, [connect, connectors]);

  // Desconectar wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setUserProfile(null);
      setEnsName('');
      setReputationScore(0);
      toast.success('Wallet desconectada');
    } catch (error) {
      console.error('Error desconectando wallet:', error);
      toast.error('Error desconectando wallet');
    }
  }, [disconnect]);

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async (userAddress) => {
    if (!userAddress) return;

    setIsLoadingProfile(true);
    try {
      // 1. Verificar si el usuario está registrado en MicroPay MX
      const microPayProfile = await reputationService.getENSProfile(userAddress);
      
      if (microPayProfile) {
        // Usuario registrado en MicroPay MX
        setUserProfile({
          ...microPayProfile,
          platform: 'micropay',
          isRegistered: true
        });
        setEnsName(microPayProfile.subdomain);
        setReputationScore(microPayProfile.reputationScore);
        
        // 2. Verificar si también está en CulturaChain
        const culturaProfile = await reputationService.getCulturaChainProfile(userAddress);
        if (culturaProfile) {
          setUserProfile(prev => ({
            ...prev,
            culturaChain: culturaProfile,
            platform: 'both'
          }));
        }
      } else {
        // Usuario no registrado - mostrar opciones de registro
        setUserProfile({
          address: userAddress,
          platform: 'none',
          isRegistered: false
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      toast.error('Error cargando perfil del usuario');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [reputationService]);

  // Registrar usuario en MicroPay MX
  const registerMicroPayUser = useCallback(async (ensName, subdomain) => {
    if (!address) return;

    try {
      setIsLoadingProfile(true);
      
      // 1. Verificar propiedad del ENS
      const ownsENS = await ensService.verifyOwnership(address, ensName);
      if (!ownsENS) {
        throw new Error('No posees este nombre ENS');
      }

      // 2. Registrar en MicroPay MX
      const registrationTx = await reputationService.registerMicroPayUser(
        address,
        ensName,
        subdomain
      );

      toast.success('Usuario registrado en MicroPay MX');
      
      // 3. Recargar perfil
      await loadUserProfile(address);
      
      return registrationTx;
    } catch (error) {
      console.error('Error registrando usuario:', error);
      toast.error(`Error registrando usuario: ${error.message}`);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [address, ensService, reputationService, loadUserProfile]);

  // Registrar usuario en CulturaChain MX
  const registerCulturaChainUser = useCallback(async (creatorCategory, description) => {
    if (!address || !userProfile?.isRegistered) {
      throw new Error('Debes estar registrado en MicroPay MX primero');
    }

    try {
      setIsLoadingProfile(true);
      
      const registrationTx = await reputationService.registerCulturaChainUser(
        address,
        creatorCategory,
        description
      );

      toast.success('Usuario registrado en CulturaChain MX');
      
      // Recargar perfil
      await loadUserProfile(address);
      
      return registrationTx;
    } catch (error) {
      console.error('Error registrando en CulturaChain:', error);
      toast.error(`Error registrando en CulturaChain: ${error.message}`);
      throw error;
    } finally {
      setIsLoadingProfile(false);
    }
  }, [address, userProfile, reputationService, loadUserProfile]);

  // Actualizar reputación cruzada
  const updateCrossPlatformReputation = useCallback(async (platform, points, reason) => {
    if (!address) return;

    try {
      // Actualizar reputación en la plataforma específica
      await reputationService.updateReputation(address, platform, points, reason);
      
      // Sincronizar reputación entre plataformas
      await reputationService.syncReputationAcrossPlatforms(address);
      
      // Recargar perfil
      await loadUserProfile(address);
      
      toast.success(`Reputación actualizada en ${platform}`);
    } catch (error) {
      console.error('Error actualizando reputación:', error);
      toast.error('Error actualizando reputación');
    }
  }, [address, reputationService, loadUserProfile]);

  // Efecto para cargar perfil cuando se conecta la wallet
  useEffect(() => {
    if (isConnected && address) {
      loadUserProfile(address);
    }
  }, [isConnected, address, loadUserProfile]);

  return {
    // Estado
    address,
    isConnected,
    connector,
    userProfile,
    isLoadingProfile,
    ensName,
    reputationScore,
    isLoading,
    error,
    
    // Acciones
    connectWallet,
    disconnectWallet,
    registerMicroPayUser,
    registerCulturaChainUser,
    updateCrossPlatformReputation,
    loadUserProfile,
    updateScore: (points) => setReputationScore(prev => prev + points),
    chain,
    switchNetwork,
    
    // Utilidades
    connectors: connectors.map(conn => ({
      id: conn.id,
      name: conn.name,
      icon: conn.icon,
      ready: conn.ready
    }))
  };
};
