import { KeyringAccount, KeyringProvider } from '@unique-nft/accounts/keyring'
import { Client, Sdk, Signer } from '@unique-nft/sdk'
import * as dotenv from 'dotenv'

export const getConfig = () => {
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

export const getSinger = async (mnemonic: string): Promise<KeyringAccount> => {
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
    const signer = await getSinger(signerOrMnemonic)
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

export enum KNOWN_AVATARS {
  Workaholic = 'workaholic', 
  Pirate = 'pirate',
}