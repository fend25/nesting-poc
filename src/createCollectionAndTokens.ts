import { COLLECTION_SCHEMA_NAME } from '@unique-nft/schemas'
import {
  Client,
  CollectionInfoWithSchemaResponse,
  CreateCollectionBody,
  CreateMultipleTokensBody,
  CreateTokenBody,
  TokenByIdResponse,
  TokenId,
  UniqueCollectionSchemaToCreateDto
} from '@unique-nft/sdk'
import { Address } from '@unique-nft/utils/address'
import { program } from 'commander'
import { data } from './data'
import { KNOWN_NETWORKS, SDKFactories, getConfig, getSinger } from './utils'

type CreateCollectionFields = Pick<CreateCollectionBody, 'name' | 'description' | 'tokenPrefix'>

const createCollection = async (
  sdk: Client,
  address: string,
  collectionArgs: CreateCollectionFields
): Promise<CollectionInfoWithSchemaResponse> => {
  const collectionSchema: UniqueCollectionSchemaToCreateDto = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {
      urlTemplate: 'https://gateway.pinata.cloud/ipfs/{infix}',
    },
    //@ts-ignore
    file: {
      urlTemplate: 'https://gateway.pinata.cloud/ipfs/{infix}',
    },
    coverPicture: {
      ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM',
    },
  }

  const {parsed, error} = await sdk.collections.creation.submitWaitResult({
    ...collectionArgs,
    address,
    schema: collectionSchema,
    permissions: {
      nesting: {
        tokenOwner: true,
        collectionAdmin: true,
      },
    },
    tokenPropertyPermissions: [
      {key: 'i.c', permission: {mutable: true, collectionAdmin: true, tokenOwner: false}},
      {key: 'i.u', permission: {mutable: true, collectionAdmin: true, tokenOwner: false}},
      {key: 'i.i', permission: {mutable: true, collectionAdmin: true, tokenOwner: false}},
    ],
  })

  if (parsed?.collectionId) {
    return await sdk.collections.get({collectionId: parsed?.collectionId})
  } else {
    throw error ? error : new Error('Error when creating a collection!')
  }
}

const mintToken = async (sdk: Client, tokenArgs: CreateTokenBody): Promise<TokenByIdResponse> => {
  const {parsed, error} = await sdk.tokens.create.submitWaitResult(tokenArgs)

  if (parsed?.tokenId) {
    return sdk.tokens.get({collectionId: tokenArgs.collectionId, tokenId: parsed.tokenId})
  } else {
    throw error ? error : new Error('Error when minting a token!')
  }
}

const mintBulkTokens = async (
  sdk: Client,
  payload: CreateMultipleTokensBody
): Promise<TokenId[]> => {
  const {parsed, error} = await sdk.tokens.createMultiple.submitWaitResult(payload)

  if (parsed) {
    return parsed
  } else {
    throw error ? error : new Error('Error when minting bulk of tokens!')
  }
}

program
  .option('-n, --network <string>', `network name: ${KNOWN_NETWORKS.join('|')}`)
  .option('-u, --imageUrlBase <string>', 'image url host: like "http://localhost:3000" or "https://workaholic.nft"')
  .option('-o, --owner <string>', 'to which address create collections and mint NFTs')


async function main() {
  program.parse()
  const options = program.opts()
  const {network, imageUrlBase} = program.opts()
  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  const signer = await getSinger(getConfig().mnemonic)
  const sdk = SDKFactories[network as keyof typeof SDKFactories](signer)

  const owner = Address.is.validAddressInAnyForm(options.owner) ? options.owner as string : signer.getAddress()

  //////////////////////////////////////
  // Create parent collections
  //////////////////////////////////////

  const backgroundCollection = await createCollection(sdk, signer.getAddress(), data.backgroundCollection)

  console.log(
    `The background collection was created. Id: ${backgroundCollection.id},` +
    `${sdk.options.baseUrl}/collections?collectionId=${backgroundCollection.id}`
  )

  const bodyCollection = await createCollection(sdk, signer.getAddress(), data.bodyCollection)

  console.log(
    `The body collection was created. Id: ${bodyCollection.id},` +
    `${sdk.options.baseUrl}/collections?collectionId=${bodyCollection.id}`
  )
  //////////////////////////////////////
  // Create child collection
  //////////////////////////////////////

  const childCollection = await createCollection(sdk, signer.getAddress(), data.childCollection)

  console.log(
    `The child collection was created. Id: ${childCollection.id},` +
    `${sdk.options.baseUrl}/collections?collectionId=${childCollection.id}`
  )

  //////////////////////////////////////
  // Mint parent tokens
  //////////////////////////////////////

  let backgroundTokenImageUrl = data.parentToken.image.url
  if (imageUrlBase) {
    const isValidUrl = imageUrlBase.startsWith('http://') || imageUrlBase.startsWith('https://')
    if (isValidUrl) {
      const lastTokenId = (await sdk.collections.lastTokenId({collectionId: backgroundCollection.id})).tokenId
      backgroundTokenImageUrl = `${imageUrlBase}/pirate/${network}/${backgroundCollection.id}/${lastTokenId + 1}`
    }
  }

  let bodyTokenImageUrl = data.mainToken.image.url
  if (imageUrlBase) {
    const isValidUrl = imageUrlBase.startsWith('http://') || imageUrlBase.startsWith('https://')
    if (isValidUrl) {
      const lastTokenId = (await sdk.collections.lastTokenId({collectionId: bodyCollection.id})).tokenId
      bodyTokenImageUrl = `${imageUrlBase}/pirate/${network}/${bodyCollection.id}/${lastTokenId + 1}`
    }
  }

  const backgroundTokenArgs = {
    address: signer.getAddress(),
    collectionId: backgroundCollection.id,
    data: {
      ...data.parentToken,
      image: {
        url: backgroundTokenImageUrl,
      }
    },
  }

  const backgroundToken = await mintToken(sdk, backgroundTokenArgs)
  console.log(
    `The background token was minted. Id: ${backgroundToken.tokenId}, collection id: ${backgroundCollection.id}`,
    `${sdk.options.baseUrl}/tokens?collectionId=${backgroundCollection.id}&tokenId=${backgroundToken.tokenId}`
  )
  const backgroundTokenAddress = Address.nesting.idsToAddress(backgroundCollection.id, backgroundToken.tokenId)

  const bodyTokenArgs = {
    address: signer.getAddress(),
    // owner: backgroundTokenAddress,
    collectionId: bodyCollection.id,
    data: {
      ...data.mainToken,
      image: {
        url: bodyTokenImageUrl,
      }
    },
  }

  const bodyToken = await mintToken(sdk, bodyTokenArgs)
  console.log(
    `The body token was minted. Id: ${bodyToken.tokenId}, collection id: ${bodyCollection.id}`,
    `${sdk.options.baseUrl}/tokens?collectionId=${bodyCollection.id}&tokenId=${bodyToken.tokenId}`
  )
  const bodyTokenAddress = Address.nesting.idsToAddress(bodyCollection.id, bodyToken.tokenId)
  
  
  ///////////////////////////////////////////
  // Mint child tokens and nest them at once
  ///////////////////////////////////////////

  const childTokens = await mintBulkTokens(sdk, {
    address: signer.getAddress(),
    collectionId: childCollection.id,
    tokens: [
      {...data.childToken1, owner: bodyTokenAddress},
      {...data.childToken2, owner: bodyTokenAddress},
      {...data.childToken3, owner: bodyTokenAddress},
    ]
  })

  console.log('The child tokens were minted: \r\n', childTokens)
  childTokens.forEach((token) => {
    console.log(
      `Token id: ${token.tokenId}, collection id: ${childCollection.id}`,
      `${sdk.options.baseUrl}/tokens?collectionId=${childCollection.id}&tokenId=${token.tokenId}`
    )
  })

  ///////////////////////////////////////////
  // Check the owner and transfer collections and tokens if needed 
  ///////////////////////////////////////////

  if (signer.getAddress() !== 'owner') { 
    console.log(`Transferring all collections and the top level token to ${owner}`)
    await sdk.tokens.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: backgroundCollection.id,
      tokenId: backgroundToken.tokenId,
      to: owner,
    })

    await sdk.collections.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: backgroundCollection.id,
      to: owner,
    })

    await sdk.collections.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: bodyCollection.id,
      to: owner,
    })

    await sdk.collections.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: childCollection.id,
      to: owner,
    })
  }
}

main().catch((error) => {
  console.error(error)
})
