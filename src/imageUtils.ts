import mergeImg from 'merge-img'

export const mergeImages = (imgArray: string[], offset: number, filePath: string): void => {
  mergeImg(imgArray, {
    align: 'center',
    offset,
  }).then((img) => {
    // Save image as file
    img.write(filePath, () => console.log(`Images were merged. The output is ${filePath}`))
  })
}
