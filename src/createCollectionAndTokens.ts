import {COLLECTION_SCHEMA_NAME} from '@unique-nft/schemas'
import {
  Client,
  CollectionInfoWithSchemaResponse,
  CreateCollectionBody,
  CreateMultipleTokensBody,
  CreateTokenBody,
  NestTokenBody,
  TokenByIdResponse,
  TokenId,
  UniqueCollectionSchemaToCreateDto,
} from '@unique-nft/sdk'
import {data} from './data'
import {getConfig, getSdk, getSinger} from './utils'

const createCollection = async (
  sdk: Client,
  collectionArgs: CreateCollectionBody
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

const nestTokens = async (sdk: Client, payload: NestTokenBody): Promise<void> => {
  const {parsed, error} = await sdk.tokens.nest.submitWaitResult(payload)

  if (parsed) {
    console.log(
      `Token ${parsed.tokenId} from collection ${parsed.collectionId} was successfully nested`
    )
  } else {
    throw error ? error : new Error('Error when nesting tokens!')
  }
}

async function main() {
  const config = getConfig()
  const signer = await getSinger(config.mnemonic)
  const sdk = await getSdk(config.baseUrl, signer)

  //////////////////////////////////////
  // Create parent collection
  //////////////////////////////////////

  const parentCollArgs = {
    address: signer.getAddress(),
    ...data.parentCollection,
  }
  const parentCollection = await createCollection(sdk, parentCollArgs)

  console.log(
    'The parent collection was created. Id: ',
    parentCollection.id,
    `${config.baseUrl}/collections?collectionId=${parentCollection.id}`
  )

  //////////////////////////////////////
  // Create child collection
  //////////////////////////////////////

  const childCollArgs = {
    address: signer.getAddress(),
    ...data.childCollection,
  }

  const childCollection = await createCollection(sdk, childCollArgs)

  console.log(
    'The child collection was created. Id: ',
    childCollection.id,
    `${config.baseUrl}/collections?collectionId=${childCollection.id}`
  )

  //////////////////////////////////////
  // Mint parent token
  //////////////////////////////////////

  const parentTokenArgs = {
    address: signer.getAddress(),
    collectionId: parentCollection.id,
    data: data.parentToken,
  }

  const parentToken = await mintToken(sdk, parentTokenArgs)
  console.log(
    `The parent token was minted. Id: ${parentToken.tokenId}, collection id: ${parentCollection.id}`,
    `${config.baseUrl}/tokens?collectionId=${parentCollection.id}&tokenId=${parentToken.tokenId}`
  )

  //////////////////////////////////////
  // Mint child tokens
  //////////////////////////////////////

  const childTokens = await mintBulkTokens(sdk, {
    address: signer.getAddress(),
    collectionId: childCollection.id,
    tokens: [data.childToken1, data.childToken2, data.childToken3],
  })

  console.log('The child tokens were minted: \r\n', childTokens)
  childTokens.forEach((token) => {
    console.log(
      `Token id: ${token.tokenId}, collection id: ${childCollection.id}`,
      `${config.baseUrl}/tokens?collectionId=${childCollection.id}&tokenId=${token.tokenId}`
    )
  })

  //////////////////////////////////////
  // Nest tokens
  //////////////////////////////////////

  for (const token of childTokens) {
    await nestTokens(sdk, {
      address: signer.getAddress(),
      parent: parentToken,
      nested: token,
    })
  }
}

main().catch((error) => {
  console.error(error)
})
