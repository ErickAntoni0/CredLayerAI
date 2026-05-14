import { ethers } from 'ethers';

export class ENSService {
  constructor() {
    this.provider = null;
    this.ensRegistry = null;
    this.ensResolver = null;
    const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
    this.baseDomain = ENV.VITE_BASE_DOMAIN || 'micro.eth';
  }

  async initialize() {
    try {
      // Configurar provider
      const ENV = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}
      const rpcUrl = ENV.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc';
      this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Configurar contratos ENS
      const ensRegistryAddress = ENV.VITE_ENS_REGISTRY_ADDRESS || '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      const ensResolverAddress = ENV.VITE_ENS_RESOLVER_ADDRESS || '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41';

      const ensRegistryABI = [
        'function owner(bytes32 node) external view returns (address)',
        'function resolver(bytes32 node) external view returns (address)',
        'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external',
        'function setResolver(bytes32 node, address resolver) external'
      ];

      const ensResolverABI = [
        'function setText(bytes32 node, string calldata key, string calldata value) external',
        'function text(bytes32 node, string calldata key) external view returns (string memory)',
        'function addr(bytes32 node) external view returns (address)',
        'function setAddr(bytes32 node, address a) external'
      ];

      this.ensRegistry = new ethers.Contract(ensRegistryAddress, ensRegistryABI, this.provider);
      this.ensResolver = new ethers.Contract(ensResolverAddress, ensResolverABI, this.provider);

      console.info('ENSService inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando ENSService:', error);
      throw error;
    }
  }

  // Verificar si una dirección posee un nombre ENS
  async verifyOwnership(address, ensName) {
    try {
      if (!this.ensRegistry) {
        await this.initialize();
      }

      const node = ethers.utils.namehash(ensName);
      const owner = await this.ensRegistry.owner(node);
      
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verificando propiedad ENS:', error);
      return false;
    }
  }

  // Obtener la dirección asociada a un nombre ENS
  async getAddress(ensName) {
    try {
      if (!this.ensResolver) {
        await this.initialize();
      }

      const node = ethers.utils.namehash(ensName);
      const address = await this.ensResolver.addr(node);
      
      return address;
    } catch (error) {
      console.error('Error obteniendo dirección ENS:', error);
      return null;
    }
  }

  // Obtener el nombre ENS asociado a una dirección
  async getName(address) {
    try {
      if (!this.provider) {
        await this.initialize();
      }

      const name = await this.provider.lookupAddress(address);
      return name;
    } catch (error) {
      console.error('Error obteniendo nombre ENS:', error);
      return null;
    }
  }

  // Crear subdominio para CredLayer AI
  async createSubdomain(ensName, subdomain, ownerAddress, signer) {
    try {
      if (!this.ensRegistry) {
        await this.initialize();
      }

      const registryWithSigner = this.ensRegistry.connect(signer);
      const parentNode = ethers.utils.namehash(ensName);
      const label = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(subdomain));
      // Crear el subdominio
      const tx = await registryWithSigner.setSubnodeRecord(
        parentNode,
        label,
        ownerAddress,
        this.ensResolver.address,
        0 // TTL
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error creando subdominio:', error);
      throw error;
    }
  }

  // Configurar texto en el resolver ENS
  async setText(ensName, key, value, signer) {
    try {
      if (!this.ensResolver) {
        await this.initialize();
      }

      const resolverWithSigner = this.ensResolver.connect(signer);
      const node = ethers.utils.namehash(ensName);

      const tx = await resolverWithSigner.setText(node, key, value);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error configurando texto ENS:', error);
      throw error;
    }
  }

  // Obtener texto del resolver ENS
  async getText(ensName, key) {
    try {
      if (!this.ensResolver) {
        await this.initialize();
      }

      const node = ethers.utils.namehash(ensName);
      const text = await this.ensResolver.text(node, key);
      
      return text;
    } catch (error) {
      console.error('Error obteniendo texto ENS:', error);
      return '';
    }
  }

  // Configurar dirección en el resolver ENS
  async setAddress(ensName, address, signer) {
    try {
      if (!this.ensResolver) {
        await this.initialize();
      }

      const resolverWithSigner = this.ensResolver.connect(signer);
      const node = ethers.utils.namehash(ensName);

      const tx = await resolverWithSigner.setAddr(node, address);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      console.error('Error configurando dirección ENS:', error);
      throw error;
    }
  }

  // Verificar si un subdominio está disponible
  async isSubdomainAvailable(ensName, subdomain) {
    try {
      if (!this.ensRegistry) {
        await this.initialize();
      }

      const subdomainName = `${subdomain}.${ensName}`;
      const node = ethers.utils.namehash(subdomainName);
      const owner = await this.ensRegistry.owner(node);
      
      return owner === '0x0000000000000000000000000000000000000000';
    } catch (error) {
      console.error('Error verificando disponibilidad de subdominio:', error);
      return false;
    }
  }

  // Obtener información completa de un ENS
  async getENSInfo(ensName) {
    try {
      if (!this.ensRegistry || !this.ensResolver) {
        await this.initialize();
      }

      const node = ethers.utils.namehash(ensName);
      const [owner, resolver, address] = await Promise.all([
        this.ensRegistry.owner(node),
        this.ensRegistry.resolver(node),
        this.ensResolver.addr(node).catch(() => null)
      ]);

      // Obtener metadatos adicionales
      const [description, avatar, url] = await Promise.all([
        this.getText(ensName, 'description').catch(() => ''),
        this.getText(ensName, 'avatar').catch(() => ''),
        this.getText(ensName, 'url').catch(() => '')
      ]);

      return {
        name: ensName,
        owner,
        resolver,
        address,
        description,
        avatar,
        url,
        isActive: owner !== '0x0000000000000000000000000000000000000000'
      };
    } catch (error) {
      console.error('Error obteniendo información ENS:', error);
      return null;
    }
  }

  // Buscar nombres ENS disponibles
  async searchAvailableNames(query, limit = 10) {
    try {
      // Esta función requeriría integración con APIs externas como ENS GraphQL
      // Por ahora, simulamos algunos nombres disponibles
      const suggestions = [
        `${query}.${this.baseDomain}`,
        `${query}1.${this.baseDomain}`,
        `${query}2.${this.baseDomain}`,
        `${query}3.${this.baseDomain}`,
        `${query}4.${this.baseDomain}`
      ];

      const availableNames = [];
      for (const name of suggestions.slice(0, limit)) {
        const isAvailable = await this.isSubdomainAvailable(this.baseDomain, name.split('.')[0]);
        if (isAvailable) {
          availableNames.push(name);
        }
      }

      return availableNames;
    } catch (error) {
      console.error('Error buscando nombres disponibles:', error);
      return [];
    }
  }

  // Validar formato de nombre ENS
  validateENSName(name) {
    try {
      // Verificar que el nombre sea válido según las reglas ENS
      const regex = /^[a-z0-9-]+\.eth$/i;
      if (!regex.test(name)) {
        return false;
      }

      // Verificar longitud
      if (name.length < 7 || name.length > 63) {
        return false;
      }

      // Verificar que no empiece o termine con guión
      if (name.startsWith('-') || name.endsWith('-')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validando nombre ENS:', error);
      return false;
    }
  }

  // Obtener precio de registro ENS
  async getRegistrationPrice(name, duration = 365) {
    try {
      // Esta función requeriría integración con el contrato ENS Registrar
      // Por ahora, simulamos precios basados en la longitud del nombre
      const basePrice = ethers.utils.parseEther('0.01'); // 0.01 ETH base
      const lengthMultiplier = Math.max(1, 10 - name.length);
      const price = basePrice.mul(lengthMultiplier);
      
      return {
        price: price.toString(),
        duration: duration,
        formatted: ethers.utils.formatEther(price)
      };
    } catch (error) {
      console.error('Error obteniendo precio de registro:', error);
      return null;
    }
  }

  // Configurar perfil completo de CredLayer AI
  async setupMicroPayProfile(ensName, subdomain, profileData, signer) {
    try {
      const subdomainName = `${subdomain}.${ensName}`;
      
      // Crear subdominio
      await this.createSubdomain(ensName, subdomain, signer.getAddress(), signer);
      
      // Configurar metadatos
      const textPromises = [
        this.setText(subdomainName, 'description', profileData.description || '', signer),
        this.setText(subdomainName, 'url', profileData.website || '', signer),
        this.setText(subdomainName, 'avatar', profileData.avatar || '', signer),
        this.setText(subdomainName, 'com.twitter', profileData.twitter || '', signer),
        this.setText(subdomainName, 'com.github', profileData.github || '', signer)
      ];

      await Promise.all(textPromises);
      
      return {
        subdomain: subdomainName,
        success: true
      };
    } catch (error) {
      console.error('Error configurando perfil MicroPay:', error);
      throw error;
    }
  }
}
