import { KeyringAccount, KeyringProvider } from '@unique-nft/accounts/keyring'
import { Client, Sdk, Signer } from '@unique-nft/sdk'
import * as dotenv from 'dotenv'
import { IBundleData } from '../types/bundle'
import { Config } from '../types/config'
import { mutantData, pirateData, workaholicData } from './data'

export const getConfig = (): Config => {
  dotenv.config()

  if (!process.env.IMAGES_DIR) {
    throw new Error('Empty or invalid folder.')
  }
  const port = parseInt(process.env.PORT || '3000', 10)
  return {
    imagesDir: process.env.IMAGES_DIR,
    mnemonic: process.env.MNEMONIC || '',
    host: process.env.HOST || 'localhost',
    port: !isNaN(port) ? port : 3000,
  }
}

export const getSigner = async (mnemonic: string): Promise<KeyringAccount> => {
  const signer = await KeyringProvider.fromMnemonic(mnemonic)
  if (signer) {
    return signer
  } else {
    throw new Error('Error on getting signer from mnemonic')
  }
}

export const getSdk = async (
  baseUrl: string,
  signerOrMnemonic?: KeyringAccount | string
): Promise<Client> => {
  if (!signerOrMnemonic) {
    console.log('Sdk initialized without a signer. Please specify it to sign transactions!')
    return new Sdk({baseUrl})
  }

  if (typeof signerOrMnemonic === 'string') {
    const signer = await getSigner(signerOrMnemonic)
    return new Sdk({baseUrl, signer})
  } else {
    return new Sdk({baseUrl, signer: signerOrMnemonic})
  }
}

export const SDKFactories = <const>{
  opal: (signer?: Signer) => new Sdk({baseUrl: 'https://rest.unique.network/opal/v1', signer}),
  quartz: (signer?: Signer) => new Sdk({baseUrl: 'https://rest.unique.network/quartz/v1', signer}),
  unique: (signer?: Signer) => new Sdk({baseUrl: 'https://rest.unique.network/unique/v1', signer}),
  rc: (signer?: Signer) => new Sdk({baseUrl: 'https://rest.dev.uniquenetwork.dev/v1', signer}),
  uniqsu: (signer?: Signer) => new Sdk({baseUrl: 'https://rest.unq.uniq.su/v1', signer}),
}

export const KNOWN_NETWORKS = Object.keys(SDKFactories)

export enum KnownAvatar {
  Workaholic = 'workaholic', 
  Pirate = 'pirate',
  Mutant = 'mutant',
}

export namespace KnownAvatar {
  export function getMintingData(avatar: string | KnownAvatar): IBundleData {
    switch (avatar as KnownAvatar) {
      case KnownAvatar.Workaholic:
        return workaholicData
      case KnownAvatar.Pirate:
        return pirateData
      case KnownAvatar.Mutant:
        return mutantData
      default:
        throw new Error(`Unsupported avatar. Please use: ${Object.values(KnownAvatar)}`)
    }
  }
}

export { Config }
