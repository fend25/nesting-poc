import {createSdk} from './createSdk.mjs'
import {COLLECTION_SCHEMA_NAME, UniqueCollectionSchemaToCreate} from '@unique-nft/schemas'
import config from './config.mjs'

// Creating a sample collection
async function createCollection(sdk, collectionArgs) {
  const collectionSchema: UniqueCollectionSchemaToCreate = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {
      urlTemplate: 'https://gateway.pinata.cloud/ipfs/{infix}',
    },
    video: {
      urlTemplate: 'https://gateway.pinata.cloud/ipfs/{infix}',
    },
    coverPicture: {
      ipfsCid: 'QmNiBHiAhsjBXj5cXShDUc5q1dX23CJYrqGGPBNjQCCSXQ',
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
  })

  if (error) {
    console.log('The error occurred while creating a collection. ', error)
    process.exit()
  }

  const {collectionId} = parsed
  return sdk.collections.get({collectionId})
}

async function mintToken(sdk, tokenArgs) {
  const {parsed, error} = await sdk.tokens.create.submitWaitResult(tokenArgs)

  if (error) {
    console.log('The error occurred while minting a token. ', error)
    process.exit()
  }

  return sdk.tokens.get({collectionId: tokenArgs.collectionId, tokenId: parsed.tokenId})
}

async function mintBulkTokens(sdk, address: string, collectionId: number, tokens: object[]) {
  const {parsed, error} = await sdk.tokens.createMultiple.submitWaitResult({
    address,
    collectionId,
    tokens,
  })

  if (error) {
    console.log('The error occurred while minting a token. ', error)
    process.exit()
  }

  return parsed
}

async function main() {
  const {sdk, signer} = await createSdk()

  // parent collection
  const parentCollArgs = {
    address: signer.getAddress(),
    name: 'Parent collection',
    description: 'Collection for nesting POC - parent',
    tokenPrefix: 'PRT',
  }
  const parentCollection = await createCollection(sdk, parentCollArgs)
  console.log('The parent collection was created. Id: ', parentCollection.id)

  // child collection
  const childCollArgs = {
    address: signer.getAddress(),
    name: 'Child collection',
    description: 'Collection for nesting POC - child',
    tokenPrefix: 'CLD',
  }
  const childCollection = await createCollection(sdk, childCollArgs)
  console.log('The child collection was created. Id: ', childCollection.id)

  // mint parent token
  const parentTokenArgs = {
    address: signer.getAddress(),
    collectionId: parentCollection.id,
    data: config.parentToken,
  }

  const parentToken = await mintToken(sdk, parentTokenArgs)
  console.log(
    `The parent token was minted. Id: ${parentToken.tokenId}, collection id: ${parentCollection.id}`
  )

  // mint child tokens

  const childTokens = await mintBulkTokens(sdk, signer.getAddress(), childCollection.id, [
    config.childToken1,
    config.childToken2,
    config.childToken3,
  ])

  console.log(childTokens)
}

main().catch((error) => {
  console.error(error)
})
