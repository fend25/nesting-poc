# Sample project for nesting

The project allows creating two collections for nesting demo. Then, it mints several tokens in these collections.
The main token will be in the first collection, all tokens that we are going to nest will be in the second collection.

When the tokens are minted, we carry out nesting. We will nest all tokens from the second collection into the token in
the first collection (see example below).

![Example](/example.png 'This is how it works!')

### Create collection and tokens

To create collection and tokes, you need to run the `src/createCollectionAndTokens.ts` script. 

The scripts accepts several command-line arguments:

`-n (--network)` - string argument specifies which network will be used. You can use one of the following values that
correspond to our networks - _opal_, _quartz_, _unique_, _rc_, _uniqsu_. Their RPCs can be found in the `utils.ts` file.

`-u (--imageUrlBase)` - string argument that specifies the base url of the image (e.g. "http://localhost:3000").

`-o (--owner)` - string argument that specifies to which address collections and NFTs will belong to.

`-a (--avatar)` - string argument specifying the name of the created image bundle. This name will be used in the URL to access
the result bundle image.  

:warning: If the signer that you will use in the code is not the same account as specified in the `--owner` argument,
the collections and NFTs will be transferred to the **owner** account anyway.

Here are how you can run this script:

```bash:no-line-numbers
npm install
npx tsx src/createCollectionAndTokens.ts -n 'opal' -u 'http://localhost:3000' -a 'pirate' -o '5H5rJe3ixpPBozVkfGvv2vJtG27m2ovtK7WpQioLw71Bd5mu'

yarn
yarn tsx src/createCollectionAndTokens.ts -n 'opal' -u 'http://localhost:3000' -a 'workaholic' -o '5H5rJe3ixpPBozVkfGvv2vJtG27m2ovtK7WpQioLw71Bd5mu'
```

### Server

The project provides the simple server. When it receives a request, the server gets the tokens bundle based on this request, 
and merge all images (parent token image + all child token images). Three levels of nesting are currently supported.
Then, the server provides the result image as output.

The server accepts the requests by this pattern (of course anything can be changed in the source code): 

`<base_url>/:avatar/:network/:collectionId/:tokenId`

So, the real request example may be this: http://localhost:3000/workaholic/opal/355/1, or http://localhost:3000/pirate/quartz/32/1

When the script mints the tokens, it sets the `file` property of our parent token to see to this URL.

```bash:no-line-numbers
npm install
npx tsx src/server.ts

yarn
yarn tsx src/server.ts
```

### Config

First of all, please rename the `.example.env` file to the `.env` file. And, paste the seed phrase for your account to the `MNEMONIC` value.

Here are some details on other configuration:

`MNEMONIC` - the seed phrase for your account, that will be used to sign transactions.  
`IMAGES_DIR` - the folder on the server where the images will be stored. The folder will be created automatically, if it does not exist. 
`HOST` - the host address (e.g. "http://localhost:3000" or "https://workaholic.nft")
`PORT` - the port where the service will be hosted. 

Also, there is the `data.ts` file that contains data for creating collection and minting tokens. You can modify this data, as well.
