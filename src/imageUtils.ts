import mergeImg from 'merge-img'

export const mergeImages = async (
  imgArray: string[],
  offset: number,
  outputFilePath: string
): Promise<string> => {
  const img = await mergeImg(imgArray, {
    align: 'center',
    offset,
  })

  return new Promise<string>((resolve, reject) => {
    img.write(outputFilePath, (err) => {
      if (err) {
        reject(err)
      } else {
        console.log(`Images were merged. The output is ${outputFilePath}`)
        resolve(outputFilePath)
      }
    })
  })
}
