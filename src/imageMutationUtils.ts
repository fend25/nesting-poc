import Jimp from 'jimp';
import { KnownMutator } from '../types/mutant';

// Brightens or darkens the picture depending on the seconds in the current minute.
const brightenerMutation = (image: Jimp) => {
	const seconds = (Date.now() / 1000) % 60
	// range between -33 and 67
	const value = (seconds / 60 - 0.33) * 100

	console.log('Applying lightness', value)
	image.color([
		{ apply: "lighten", params: [value] }
	])
}

// Shrinks or enlarges the picture depending on the seconds in the current minute, oscillating back and forth
const shrinkMutation = (image: Jimp): [number, number] => {
	const seconds = (Date.now() / 1000)
	// range between 0.75 and 1.25
	const value = Math.sin(seconds) * 0.25 + 1
	const offset: [number, number] = [image.getWidth() * ((1 - value) / 2), image.getHeight() * ((1 - value) / 2)]

	console.log('Applying growth', value)
	image.scale(value)

	return offset
}

// Wouldn't you like to have a duck?
const flipperMutation = async (image: Jimp): Promise<void> => {
	// absolutely random duck (but not gif)
	let value = ''
	do {
		const response = await fetch('https://random-d.uk/api/v2/quack', {
			method: 'GET'
		})
		value = (await response.json()).url
	} while (value.includes('.gif'))
	console.log('Applying duck', value)

	// read duck
	const newImage = await Jimp.read(value)
	// fit duck to 40% of the token image
	newImage.scaleToFit(image.getWidth() * 0.4, image.getHeight() * 0.4)
	// apply duck to the bottom-right corner of the image
	image.composite(newImage, image.getWidth() * 0.6, image.getHeight() * 0.6)
}

const mutateImageOnce = async (image: Jimp, mutator: KnownMutator): Promise<[number, number]> => {
	let offset: [number, number] = [0, 0]
  switch (mutator) {
    case KnownMutator.Brightener:
			brightenerMutation(image);
      break;
		// case KnownMutator.Wonderland:
    case KnownMutator.Inflator:
			offset = shrinkMutation(image)
      break;
		case KnownMutator.Flipper:
			await flipperMutation(image);
			break;
		// don't panic if this is not a known mutator
  }
  return offset
}

export const mutateImage = async (image: Jimp, mutators: KnownMutator[]): Promise<[number, number]> => {
	let imageOffset: [number, number] = [0, 0]
  for (const mutator of mutators) {
    let newImageOffset = await mutateImageOnce(image, mutator)
		imageOffset[0] += newImageOffset[0]
		imageOffset[1] += newImageOffset[1]
  }
  return imageOffset
}
