import config from './config.mjs'
import {KeyringProvider} from '@unique-nft/accounts/keyring'
import {Sdk} from '@unique-nft/sdk'

export async function createSdk() {
  try {
    const signer = await KeyringProvider.fromMnemonic(config.mnemonic)

    const clientOptions = {
      baseUrl: config.baseUrl,
      signer,
    }
    return {
      sdk: new Sdk(clientOptions),
      signer,
    }
  } catch (e) {
    throw new Error(`Error when initializing SDK: ${e}`)
  }
}
