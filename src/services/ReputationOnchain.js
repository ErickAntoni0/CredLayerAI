import { ethers } from 'ethers'
import Abi from '../abis/ReputationENS.json'

export class ReputationOnchainService {
  constructor(address) {
    this.address = address
    this.contract = null
  }

  async initWithSigner() {
    if (!window.ethereum) throw new Error('Wallet no detectada')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    this.contract = new ethers.Contract(this.address, Abi, signer)
    return this.contract
  }

  async getScore(user) {
    if (!this.contract) await this.initWithSigner()
    return await this.contract.getReputation(user)
  }

  async bump(user, delta = 5) {
    if (!this.contract) await this.initWithSigner()
    const tx = await this.contract.bumpReputation(user, delta)
    await tx.wait()
    return true
  }
}


