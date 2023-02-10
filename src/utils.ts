import {KeyringAccount, KeyringProvider} from '@unique-nft/accounts/keyring'
import {Client, Sdk} from '@unique-nft/sdk'
import dotenv from 'dotenv'

export const getConfig = () => {
  dotenv.config()
  
  const parentCollection = parseInt(process.env.PARENT_COLLECTION || '', 10)
  if (isNaN(parentCollection)) {
    throw new Error('Empty or invalid parent collection number.')
  }
  const parentToken = parseInt(process.env.PARENT_TOKEN || '', 10)
  if (isNaN(parentToken)) {
    throw new Error('Empty or invalid parent token number.')
  }
  const offset = parseInt(process.env.OFFSET || '', 10)
  if (isNaN(offset)) {
    throw new Error('Empty or invalid offset.')
  }
  if (!process.env.MNEMONIC) {
    throw new Error('Empty or invalid file path.')
  }
  if (!process.env.FILE_PATH) {
    throw new Error('Empty or invalid file path.')
  }
  if (!process.env.BASE_URL) {
    throw new Error('Empty or invalid base url.')
  }
  return {
    baseUrl: process.env.BASE_URL,
    filePath: process.env.FILE_PATH,
    parentCollection,
    parentToken,
    offset,
    mnemonic: process.env.MNEMONIC,
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
