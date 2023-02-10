import {KeyringAccount, KeyringProvider} from '@unique-nft/accounts/keyring'
import {Client, Sdk} from '@unique-nft/sdk'
import * as dotenv from 'dotenv'

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
  if (!process.env.OUTPUT_FILENAME) {
    throw new Error('Empty or invalid file name.')
  }
  if (!process.env.IMAGES_DIR) {
    throw new Error('Empty or invalid folder.')
  }
  if (!process.env.BASE_URL) {
    throw new Error('Empty or invalid base url.')
  }
  const port = parseInt(process.env.PORT || '3000', 10)
  return {
    baseUrl: process.env.BASE_URL,
    fileName: process.env.OUTPUT_FILENAME,
    imagesDir: process.env.IMAGES_DIR,
    parentCollection,
    parentToken,
    offset,
    mnemonic: process.env.MNEMONIC,
    host: process.env.HOST || '127.0.0.1',
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
