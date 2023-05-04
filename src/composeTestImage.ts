import {getConfig, KnownAvatar, KNOWN_NETWORKS, SDKFactories} from './utils'

import {program} from 'commander'
import {Address} from '@unique-nft/utils/address'
import { composeImage, createImagePath, getTokenComponents } from './imageUtils'

program
  .option('-c, --collectionId <number>', 'collection id')
  .option('-t, --tokenId <number>', 'token id')
  .option('-n, --network <string>', `network name: ${KNOWN_NETWORKS.join('|')}`)
  .option('-a, --avatar <string>', `avatar type: ${Object.values(KnownAvatar).join('|')}`)

const main = async () => {
  program.parse()

  const {network, collectionId, tokenId} = program.opts()
	let {avatar} = program.opts()

  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  if (Address.is.collectionId(collectionId)) {
    throw new Error(`Invalid collectionId ${collectionId}`)
  }

  if (Address.is.tokenId(tokenId)) {
    throw new Error(`Invalid tokenId ${tokenId}`)
  }

	if (!avatar) {
		avatar = KnownAvatar.Workaholic;
	}

  const sdk = SDKFactories[network as keyof typeof SDKFactories]()
  const tokenArray = await getTokenComponents(sdk, {collectionId, tokenId})
  const imagePath = createImagePath(getConfig(), 'testImage.png')
  await composeImage(tokenArray, avatar as KnownAvatar, imagePath)
}

main().catch((error) => {
  console.error(error)
})
