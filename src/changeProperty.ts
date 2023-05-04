import {getConfig, getSigner, KNOWN_NETWORKS, SDKFactories} from './utils'

import {program} from 'commander'
import {Address} from '@unique-nft/utils/address'

program
  .option('-c, --collectionId <number>', 'collection id')
  .option('-t, --tokenId <number>', 'token id')
  .option('-n, --network <string>', `network name: ${KNOWN_NETWORKS.join('|')}`)
  .option('-u, --url <string>', 'image url to set; does not conflict with property setting, but instead is a helpful shortcut')
  .option('-p, --property <string>', 'name of the token property to change')
  .option('-v, --value <string>', 'property value to set -- for example, image url')

const main = async () => {
  program.parse()

  const {network, collectionId, tokenId, url, property, value} = program.opts()
  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  if (Address.is.collectionId(collectionId)) {
    throw new Error(`Invalid collectionId ${collectionId}`)
  }

  if (Address.is.tokenId(tokenId)) {
    throw new Error(`Invalid tokenId ${tokenId}`)
  }

  if (!(url || property && value)) {
    throw new Error('An image URL to replace the token\'s, OR some property key AND value are required!')
  }

  if (url) {
    try {
      new URL(url)
    } catch (e: any) {
      throw new Error(`Invalid url ${url}: ${e.message}`)
    }
  }

  const signer = await getSigner(getConfig().mnemonic)
  const sdk = SDKFactories[network as keyof typeof SDKFactories](signer)
  const address = signer.getAddress()
  console.log(`Performing transaction from ${address}`)

  const result = await sdk.tokens.setProperties.submitWaitResult({
    address: address,
    collectionId,
    tokenId,
    properties: url ? [{key: 'i.u', value: url}] : [] + property ? [{key: property, value}] : []
  })

  console.log(`Token (${collectionId}/${tokenId}) was successfully updated: ${result.parsed}`)
}

main().catch((error) => {
  console.error(error)
})
