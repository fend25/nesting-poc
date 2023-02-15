import {getConfig, getSinger, KNOWN_NETWORKS, SDKFactories} from './utils'

import {program} from 'commander'
import {Address} from '@unique-nft/utils/address'

program
  .option('-c, --collectionId', 'collection id')
  .option('-t, --tokenId', 'token id')
  .option('-n, --network', `network name: ${KNOWN_NETWORKS.join('|')}`)
  .option('-u, --url', 'image url to set')

const main = async () => {
  program.parse()

  const {network, collectionId, tokenId, url} = program.opts()
  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  if (Address.is.collectionId(collectionId)) {
    throw new Error(`Invalid collectionId ${collectionId}`)
  }

  if (Address.is.tokenId(tokenId)) {
    throw new Error(`Invalid tokenId ${tokenId}`)
  }

  try {
    new URL(url)
  } catch (e: any) {
    throw new Error(`Invalid url ${url}: ${e.message}`)
  }

  const config = getConfig()
  const signer = await getSinger(config.mnemonic)
  const sdk = SDKFactories[network as keyof typeof SDKFactories](signer)
  const address = signer.getAddress()
  console.log(`Performing transaction from ${address}`)

  const result = await sdk.tokens.setProperties.submitWaitResult({
    address: address,
    collectionId: config.parentCollection,
    tokenId: config.parentToken,
    properties: [{key: 'i.u', value: url}]
  })

  console.log(`Token (${collectionId}/${tokenId}) was successfully updated: ${result.parsed}`)
}

main().catch((error) => {
  console.error(error)
})
