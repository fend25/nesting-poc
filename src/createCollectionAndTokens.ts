import {COLLECTION_SCHEMA_NAME} from '@unique-nft/schemas'
import {
  Client,
  CollectionInfoWithSchemaResponse,
  CreateCollectionBody,
  CreateMultipleTokensBody,
  CreateTokenBody,
  NestTokenBody,
  Signer,
  TokenByIdResponse,
  TokenId,
  UniqueCollectionSchemaToCreateDto,
} from '@unique-nft/sdk'
import {data} from './data'
import {getConfig, getSinger, KNOWN_NETWORKS, SDKFactories} from './utils'
import {program} from 'commander'
import {Address} from '@unique-nft/utils/address'

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
      ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx',
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


async function main() {
  program.parse()
  const {network, imageUrlBase} = program.opts()
  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  const signer = await getSinger(getConfig().mnemonic)
  const sdk = SDKFactories[network as keyof typeof SDKFactories](signer)

  //////////////////////////////////////
  // Create parent collection
  //////////////////////////////////////

  const parentCollection = await createCollection(sdk, signer.getAddress(), {
    name: 'Parent collection',
    description: 'Collection for nesting POC - parent',
    tokenPrefix: 'PRNT',
  })

  console.log(
    `The parent collection was created. Id: ${parentCollection.id},` +
    `${sdk.options.baseUrl}/collections?collectionId=${parentCollection.id}`
  )

  //////////////////////////////////////
  // Create child collection
  //////////////////////////////////////

  const childCollection = await createCollection(sdk, signer.getAddress(), {
    name: 'Child collection',
    description: 'Collection for nesting POC - child',
    tokenPrefix: 'CHLD',
  })

  console.log(
    `The child collection was created. Id: ${childCollection.id},` +
    `${sdk.options.baseUrl}/collections?collectionId=${childCollection.id}`
  )

  //////////////////////////////////////
  // Mint parent token
  //////////////////////////////////////

  let parentTokenImageUrl = data.parentToken.image.url
  if (imageUrlBase) {
    const isValidUrl = imageUrlBase.startsWith('http://') || imageUrlBase.startsWith('https://')
    if (isValidUrl) {
      const lastTokenId = (await sdk.collections.lastTokenId({collectionId: parentCollection.id})).tokenId
      parentTokenImageUrl = `${imageUrlBase}/workaholic/${network}/${parentCollection.id}/${lastTokenId + 1}`
    }
  }

  const parentTokenArgs = {
    address: signer.getAddress(),
    collectionId: parentCollection.id,
    data: {
      ...data.parentToken,
      image: {
        url: parentTokenImageUrl,
      }
    },
  }

  const parentToken = await mintToken(sdk, parentTokenArgs)
  console.log(
    `The parent token was minted. Id: ${parentToken.tokenId}, collection id: ${parentCollection.id}`,
    `${sdk.options.baseUrl}/tokens?collectionId=${parentCollection.id}&tokenId=${parentToken.tokenId}`
  )
  const parentTokenAddress = Address.nesting.idsToAddress(parentCollection.id, parentToken.tokenId)

  ///////////////////////////////////////////
  // Mint child tokens and nest them at once
  ///////////////////////////////////////////

  const childTokens = await mintBulkTokens(sdk, {
    address: signer.getAddress(),
    collectionId: childCollection.id,
    tokens: [
      {...data.childToken1, owner: parentTokenAddress},
      {...data.childToken2, owner: parentTokenAddress},
      {...data.childToken3, owner: parentTokenAddress},
    ]
  })

  console.log('The child tokens were minted: \r\n', childTokens)
  childTokens.forEach((token) => {
    console.log(
      `Token id: ${token.tokenId}, collection id: ${childCollection.id}`,
      `${sdk.options.baseUrl}/tokens?collectionId=${childCollection.id}&tokenId=${token.tokenId}`
    )
  })
}

main().catch((error) => {
  console.error(error)
})
