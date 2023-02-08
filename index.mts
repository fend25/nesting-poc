import {KeyringProvider} from '@unique-nft/accounts/keyring'
import {Sdk} from '@unique-nft/sdk'
import {COLLECTION_SCHEMA_NAME, UniqueCollectionSchemaToCreate} from '@unique-nft/schemas'
import JSON5 from 'json5'
import {readFile} from 'fs/promises'
import mergeImg from 'merge-img'

const json5 = await readFile('./config.json5', 'utf8')
const config = JSON5.parse(json5)

async function createSdk() {
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

async function nestTokens(sdk, signer, parent, nested) {
  const {parsed, error} = await sdk.tokens.nest.submitWaitResult({
    address: signer.getAddress(),
    parent,
    nested,
  })

  if (error) {
    console.log('The error occurred while nesting a token. ', error)
    process.exit()
  }

  console.log(`Token ${parsed.tokenId} from collection ${parsed.collectionId} successfully nested`)
}

async function main() {
  const {sdk, signer} = await createSdk()

  //////////////////////////////////////
  // Create parent collection
  //////////////////////////////////////
  const parentCollArgs = {
    address: signer.getAddress(),
    name: 'Parent collection',
    description: 'Collection for nesting POC - parent',
    tokenPrefix: 'PRT',
  }
  const parentCollection = await createCollection(sdk, parentCollArgs)
  console.log('The parent collection was created. Id: ', parentCollection.id)


  //////////////////////////////////////
  // Create child collection
  //////////////////////////////////////
  const childCollArgs = {
    address: signer.getAddress(),
    name: 'Child collection',
    description: 'Collection for nesting POC - child',
    tokenPrefix: 'CLD',
  }
  const childCollection = await createCollection(sdk, childCollArgs)
  console.log('The child collection was created. Id: ', childCollection.id)


  //////////////////////////////////////
  // Mint parent token
  //////////////////////////////////////
  const parentTokenArgs = {
    address: signer.getAddress(),
    collectionId: parentCollection.id,
    data: config.parentToken,
  }


  const parentToken = await mintToken(sdk, parentTokenArgs)
  console.log(
    `The parent token was minted. Id: ${parentToken.tokenId}, collection id: ${parentCollection.id}`
  )


  //////////////////////////////////////
  // Mint child tokens
  //////////////////////////////////////
  const childTokens = await mintBulkTokens(sdk, signer.getAddress(), childCollection.id, [
    config.childToken1,
    config.childToken2,
    config.childToken3,
  ])

  console.log(childTokens)


  //////////////////////////////////////
  // Nest tokens
  //////////////////////////////////////

  for (const token of childTokens) {
    await nestTokens(sdk, signer, parentToken, token)
  }


  //////////////////////////////////////
  // Get images and merge them 
  //////////////////////////////////////
  const imgArray: string[] = []

  const token = await sdk.tokens.get(parentToken)
  if (token.image.fullUrl) imgArray.push(token.image.fullUrl)

  const bundle = await sdk.tokens.getBundle(parentToken)
  bundle.nestingChildTokens.forEach((token) => {
    imgArray.push(token.image.fullUrl)
  })

  mergeImg(imgArray, {
    align: 'center',
    offset: -850,
  }).then((img) => {
    // Save image as file
    img.write('output.png', () => console.log('Images were merged. The output is output.png'))
  })
}

main().catch((error) => {
  console.error(error)
})
