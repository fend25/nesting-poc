import { KeyringAccount } from '@unique-nft/accounts/keyring'
import { COLLECTION_SCHEMA_NAME } from '@unique-nft/schemas'
import {
  Client,
  CollectionInfoWithSchemaResponse,
  CreateCollectionBody,
  CreateMultipleTokensBody,
  CreateTokenBody,
  TokenByIdResponse,
  TokenId,
  UniqueCollectionSchemaToCreateDto,
} from '@unique-nft/sdk'
import { Address } from '@unique-nft/utils/address'
import { OptionValues, program } from 'commander'
import { IBundleData } from '../types/bundle'
import { pirateData, workaholicData } from './data'
import { KNOWN_AVATARS, KNOWN_NETWORKS, SDKFactories, getConfig, getSinger } from './utils'

type CreateCollectionFields = Pick<CreateCollectionBody, 'name' | 'description' | 'tokenPrefix'>

const createCollection = async (
  sdk: Client,
  address: string,
  collectionArgs: CreateCollectionFields,
  coverPictureIpfsCid: string
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
      ipfsCid: coverPictureIpfsCid,
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
  console.log('start bulk mint')
  console.log(payload.tokens.length)
  console.dir(payload.tokens)
  const {parsed, error} = await sdk.tokens.createMultiple.submitWaitResult(payload)
  console.log('bulk mint passed')
  if (parsed) {
    return parsed
  } else {
    throw error ? error : new Error('Error when minting bulk of tokens!')
  }
}

const mintBundle = async (sdk: Client, signer: KeyringAccount, data: IBundleData, options: OptionValues): Promise<void> => {
  const owner = Address.is.validAddressInAnyForm(options.owner)
    ? (options.owner as string)
    : signer.getAddress()
  
  //////////////////////////////////////
  // Create parent collection
  //////////////////////////////////////

  const parentCollection = await createCollection(
    sdk,
    signer.getAddress(),
    data.parentCollection,
    data.parentCollection.coverPictureIpfsCid
  )

  console.log(
    `The parent collection was created. Id: ${parentCollection.id},` +
      `${sdk.options.baseUrl}/collections?collectionId=${parentCollection.id}`
  )

  // If we have the second level parent collection, then create it. 
  // If there is no such collection, just skip 
  let secondParentCollection = null
  if (data.secondParentCollection) {
    secondParentCollection = await createCollection(
      sdk,
      signer.getAddress(),
      data.secondParentCollection,
      data.secondParentCollection.coverPictureIpfsCid
    )
  
    console.log(
      `The second layer parent collection was created. Id: ${secondParentCollection.id},` +
        `${sdk.options.baseUrl}/collections?collectionId=${secondParentCollection.id}`
    )
  }
  //////////////////////////////////////
  // Create child collection
  //////////////////////////////////////

  const childCollection = await createCollection(
    sdk,
    signer.getAddress(),
    data.childCollection,
    data.childCollection.coverPictureIpfsCid
  )

  console.log(
    `The child collection was created. Id: ${childCollection.id},` +
      `${sdk.options.baseUrl}/collections?collectionId=${childCollection.id}`
  )

  //////////////////////////////////////
  // Mint parent token
  //////////////////////////////////////

  let parentTokenImageUrl = data.parentToken.image.url
  parentTokenImageUrl = await isValidImageURL(sdk, options, parentCollection, parentTokenImageUrl)

  const parentTokenArgs = {
    address: signer.getAddress(),
    collectionId: parentCollection.id,
    data: {
      ...data.parentToken,
      image: {
        url: parentTokenImageUrl,
      },
    },
  }

  const parentToken = await mintToken(sdk, parentTokenArgs)
  const parentTokenAddress = Address.nesting.idsToAddress(parentCollection.id, parentToken.tokenId)
  console.log(
    `The parent token was minted. Id: ${parentToken.tokenId}, collection id: ${parentCollection.id}`,
    `${sdk.options.baseUrl}/tokens?collectionId=${parentCollection.id}&tokenId=${parentToken.tokenId}`
  )

  // If we have second layer parent collection, then mint tokens in it
  let secondParentTokenAddress = ''
  if (data.secondParentCollection && data.secondParentToken && secondParentCollection) {

    let secondParentTokenImageUrl = data.secondParentToken.image.url
    secondParentTokenImageUrl = await isValidImageURL(sdk, options, secondParentCollection, secondParentTokenImageUrl)

    const secondParentTokenArgs = {
      address: signer.getAddress(),
      owner: parentTokenAddress,
      collectionId: secondParentCollection.id,
      data: {
        ...data.secondParentToken,
        image: {
          url: secondParentTokenImageUrl,
        },
      },
    }
  
    const secondParentToken = await mintToken(sdk, secondParentTokenArgs)
    secondParentTokenAddress = Address.nesting.idsToAddress(secondParentCollection.id, secondParentToken.tokenId)
    console.log(
      `The second layer parent token was minted. Id: ${secondParentToken.tokenId}, collection id: ${secondParentCollection.id}`,
      `${sdk.options.baseUrl}/tokens?collectionId=${secondParentCollection.id}&tokenId=${secondParentToken.tokenId}`
    )
  }

  ///////////////////////////////////////////
  // Mint child tokens and nest them at once
  ///////////////////////////////////////////

  const currentParentAddress = secondParentTokenAddress ? secondParentTokenAddress : parentTokenAddress
  const childTokensData = data.childTokens.map(token => 
    ({...token, owner: currentParentAddress })
  ) 

  console.log(childTokensData)

  const childTokens = await mintBulkTokens(sdk, {
    address: signer.getAddress(),
    collectionId: childCollection.id,
    tokens: childTokensData,
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

  secondParentCollection ? 
  await transferCollections(sdk, signer, owner, parentToken, parentCollection, childCollection, secondParentCollection) :
  await transferCollections(sdk, signer, owner, parentToken, parentCollection, childCollection)
}

async function isValidImageURL(sdk: Client, options: OptionValues, parentCollection: CollectionInfoWithSchemaResponse, parentTokenImageUrl: string) {
  if (options.imageUrlBase) {
    const isValidUrl = options.imageUrlBase.startsWith('http://') || options.imageUrlBase.startsWith('https://')
    if (isValidUrl) {
      const lastTokenId = (await sdk.collections.lastTokenId({ collectionId: parentCollection.id }))
        .tokenId
      parentTokenImageUrl = `${options.imageUrlBase}/${options.avatar}/${options.network}/${ 
        parentCollection.id}/${lastTokenId + 1}`
    }
  }
  return parentTokenImageUrl
}

async function transferCollections(sdk: Client, signer: KeyringAccount, owner: string, parentToken: TokenByIdResponse, parentCollection: CollectionInfoWithSchemaResponse, childCollection: CollectionInfoWithSchemaResponse, secondParentCollection?: CollectionInfoWithSchemaResponse,) {
  if (signer.getAddress() !== owner) {
    console.log(`Transferring all collections and the top level token to ${owner}`)
    await sdk.tokens.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: parentCollection.id,
      tokenId: parentToken.tokenId,
      to: owner,
    })

    await sdk.collections.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: parentCollection.id,
      to: owner,
    })

    if (secondParentCollection) {
      await sdk.collections.transfer.submitWaitResult({
        address: signer.getAddress(),
        collectionId: secondParentCollection.id,
        to: owner,
      })
    }

    await sdk.collections.transfer.submitWaitResult({
      address: signer.getAddress(),
      collectionId: childCollection.id,
      to: owner,
    })
  }
}

program
  .option('-n, --network <string>', `network name: ${KNOWN_NETWORKS.join('|')}`)
  .option(
    '-u, --imageUrlBase <string>',
    'image url host: like "http://localhost:3000" or "https://workaholic.nft"'
  )
  .option('-o, --owner <string>', 'to which address create collections and mint NFTs')
  .option('-a, --avatar <string>', `which avatar will be minted: ${Object.values(KNOWN_AVATARS)}`)

async function main() {
  program.parse()
  const options = program.opts()
  const {network, avatar} = program.opts()
  if (!KNOWN_NETWORKS.includes(network)) {
    throw new Error(`Unknown network ${network}. Please use one of ${KNOWN_NETWORKS.join(', ')}`)
  }

  const signer = await getSinger(getConfig().mnemonic)
  const sdk = SDKFactories[network as keyof typeof SDKFactories](signer)

  if (avatar == 'workaholic') {
    mintBundle(sdk, signer, workaholicData , options)
  } else if (avatar == 'pirate') {
    mintBundle(sdk, signer, pirateData ,options)
  } else {
    console.error('Unsupported avatar. Please use: ', Object.values(KNOWN_AVATARS))
  }
}

main().catch((error) => {
  console.error(error)
})
