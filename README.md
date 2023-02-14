# Sample project for nesting

### Create collection and tokens

The project allows creating two collections for nesting demo. Then, it mints several tokens in these collections.
The main token will be in the first collection, all tokens that we are going to nest will be in the second collection.

When the tokens are minted, we carry out nesting. We will nest all tokens from the second collection into the token in
the first collection (see example below).

To do this, you can run the following commands:

```bash:no-line-numbers
npm install
npx tsx src/createCollectionAndTokens.ts
yarn
yarn tsx src/createCollectionAndTokens.ts
```

### Merge token images

After the tokens are minted (or if they already existed), we can run the `index.ts` file to get the token images and then merge them.
Please take a look at the screenshot below to learn how this should work:

![Example](/images/example.png 'This is how it works!')

```bash:no-line-numbers
npm install
npx tsx src/index.ts
yarn
yarn tsx src/index.ts
```

### Server

The project provides the simple server. When it receives a request, the server gets the bundle defines in the config and merge
the images. Then, the server provides the result image as output.

```bash:no-line-numbers
npm install
npx tsx src/server.ts
yarn
yarn tsx src/server.ts
```

### Config

First of all, please rename the `.example.env` file to the `.env` file. And, paste the seed phrase for your account to the `MNEMONIC` value.

Here are some details on other configuration:

`BASE_URL` - the URL of the network with we are working. It could be changed to Unique or Quartz in future.  
`PARENT_COLLECTION` and `PARENT_TOKEN` - parent collection id and parent token id.
If you use the minting, then fill this value before running `index.ts`.
`IMAGES_DIR` and `OUTPUT_FILENAME` - the file path and the file name. Their combination (`IMAGES_DIR`/`OUTPUT_FILENAME` ) will
define where the result image will be saved.  
`OFFSET` - offset value for image merging. You may need to adjust this value for best results.

Also, there is the `data.ts` file that contains data for creating collection and minting tokens. You can modify this data, as well.
