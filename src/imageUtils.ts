import type { Client, TokenIdQuery, TokenByIdResponse, DecodedAttributeDto } from '@unique-nft/sdk'
import Jimp from 'jimp';
import fs from 'fs';
import { Config, KnownAvatar } from './utils';
import { mutateImage } from './imageMutationUtils';
import { MutantTokenComponents, MutantWithLayer } from '../types/mutant';

// Compose and create a path to which images should be stored
export const createImagePath = (
  config: Config,
  fileName: string,
) => {
  const path = `${config.imagesDir}/${fileName}`
  
  if (!fs.existsSync(config.imagesDir)) {
    fs.mkdirSync(config.imagesDir)
  }

  return path;
}

// Find a token's image if it exists in one of the usual places permitted by the schema
const getTokenImageUrl = (token: any | TokenByIdResponse, searchImageOutsideOfSchema: boolean): string | null => {
  if (token.file && token.file.fullUrl) {
    return token.file.fullUrl
  }
  
  if (token.image.fullUrl) {
    return token.image.fullUrl
  }
  
  if (searchImageOutsideOfSchema) {
    // Searching for an image directly in properties
    for (const prop of token.properties) {
      if (prop.key == 'i.u') {
        return prop.value
      }
    }
  }

  console.warn(`Couldn't find an image for token ${token.collectionId}/${token.tokenId}!`)
  return null
}

const getTokenImageLayer = (token: any): number | undefined => {
  try {
    const attributes = token.attributes
      ? Array.isArray(token.attributes)
        ? token.attributes : Object.values(token.attributes)
      : [];

    const layerAttribute = Object.values(attributes).find((a) => a.name?._ === 'Layer');

    const layer = parseInt(layerAttribute?.value?._?.toString(), 10);

    return Number.isNaN(layer) ? undefined : layer;
  } catch (e) {
    return undefined;
  }
}

const mergeLayers = (tokens: MutantWithLayer[]): MutantTokenComponents[] => {
  const sorted = tokens.sort((a, b) => (a.layer || 1000) - (b.layer || 1000));
  const uniqueLayers = sorted.reduce((acc, token) => {
    const existingIndex = acc.findIndex((x) => x.layer && x.layer === token.layer);

    if (existingIndex !== -1) {
      const existing = acc[existingIndex];
      console.warn(`Images  ${existing.imageUrl} and ${token.imageUrl} have the same layer ${token.layer}. Replacing...`);
      acc[existingIndex] = token;

      return acc;
    }

    return [...acc, token];
  }, [] as MutantWithLayer[]);

  return uniqueLayers.map(({layer, ...rest}) => (rest));
}

// Get everything that is necessary to complete an image from a token:
// its own image URL, its children's image URLs, and their mutators if present
export const getTokenComponents = async (
  sdk: Client,
  parentToken: TokenIdQuery
): Promise<MutantTokenComponents[]> => {
  const tokenArray: MutantWithLayer[] = []

  // Find and note a token's image if it exists in one of the usual places permitted by the schema
  const findAndAddImageUrl = (token: any, searchImageOutsideOfSchema: boolean) => {
    const imageUrl = getTokenImageUrl(token, searchImageOutsideOfSchema)
    if (imageUrl) {
      // find a 'mutator' property and get known mutators from it, separated by commas
      const mutators = token.properties.find((x: {key: string, value: string}) => x.key == 'mutator')?.value.split(/\s*,\s*/)

      const layer = getTokenImageLayer(token)

      tokenArray.push({
        imageUrl,
        mutators: mutators ?? [],
        layer,
      })
    }
  }

  console.log(`Getting parent token (${parentToken.collectionId}/${parentToken.tokenId}) image`)
  const token = await sdk.tokens.get(parentToken)
  findAndAddImageUrl(token, false)

  console.log(
    `Getting image URLs of tokens nested in ${parentToken.collectionId}/${parentToken.tokenId}`
  )
  // Get the images of the tokens nested in the parent token, if there are any
  const bundle = await sdk.tokens.getBundle(parentToken).catch((error) => {
    console.log(`No tokens are nested in ${parentToken.collectionId}/${parentToken.tokenId}`)

    return { nestingChildTokens: [] }
  })

  bundle.nestingChildTokens.forEach(async (token) => {
    findAndAddImageUrl(token, true)
  
    // Just one step deeper, if there is another layer of nesting
    const childBundle = await sdk.tokens.getBundle(token)
    childBundle.nestingChildTokens.forEach((childToken) => {
      findAndAddImageUrl(childToken, true)
    })
  })

  return mergeLayers(tokenArray);
}

// Compose a complete image from those of all given tokens, according to the image type (avatar)
// and store it in the output file path.
export const composeImage = async (
  tokenArray: MutantTokenComponents[],
  avatar: KnownAvatar,
  outputFilePath: string
): Promise<string> => {
  console.log(
    'Found images to merge:',
    avatar == KnownAvatar.Mutant ? tokenArray : tokenArray.map(x => x.imageUrl),
  );

  let mergeImages = async (imageArray: MutantTokenComponents[]): Promise<Jimp> => {
    const image = await Jimp.read(imageArray[0].imageUrl);
    for (const {imageUrl, mutators} of imageArray.slice(1)) {
      const childImage = await Jimp.read(imageUrl);

      // mutate images of nested tokens
      const offset = await mutateImage(childImage, mutators)

      // merge the current image with this one
      image.composite(childImage, offset[0], offset[1]);
    }
    
    // Mutate the complete image if there are any mutators on the parent token
    await mutateImage(image, imageArray[0].mutators)
    return image;
  }

  return new Promise<string>((resolve, reject) => {
    mergeImages(tokenArray).then((image) => {
      if (!image) throw new Error('Image could not be created.')
      image.write(outputFilePath)

      console.log(`Images were merged. The output is ${outputFilePath}`)
      resolve(outputFilePath)
    }).catch((err) => {
      reject(err)
    })
  })
}
