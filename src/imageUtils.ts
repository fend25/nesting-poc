import mergeImg from 'merge-img'
import fs from 'node:fs/promises'

export const mergeImages = async (
  imgArray: string[],
  offset: number,
  outputFilePath: string
): Promise<string> => {
  const img = await mergeImg(imgArray, {
    align: 'center',
    offset,
  })

  // Save image as file
  console.log(img.writeAsync)

  await img.writeAsync(outputFilePath) 

  console.log(`Images were merged. The output is ${outputFilePath}`)

  return outputFilePath
}
