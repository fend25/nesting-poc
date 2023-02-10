import mergeImg from 'merge-img'
import * as fs from 'node:fs/promises'
import {promisify} from 'node:util'

export const mergeImages = async (
  imgArray: string[],
  offset: number,
  outputFilePath: string
): Promise<string> => {
  const img = await mergeImg(imgArray, {
    align: 'center',
    offset,
  })

  const writeAsync = promisify(img.write.bind(img))

  await writeAsync(outputFilePath)

  console.log(`Images were merged. The output is ${outputFilePath}`)

  return outputFilePath
}
