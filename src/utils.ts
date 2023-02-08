import {KeyringAccount, KeyringProvider} from '@unique-nft/accounts/keyring'
import {Client, Sdk} from '@unique-nft/sdk'
import dotenv from 'dotenv'

export const getConfig = (): NodeJS.ProcessEnv => {
  dotenv.config()
  return process.env
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
