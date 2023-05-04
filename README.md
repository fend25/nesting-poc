# Sample project for nesting

The project doubles as an introduction to nesting and a server showcase of an image composer for dynamic nested tokens.

Locally, it allows to connect to one of Unique chains via Unique SDK.
It allows creation of several types of collections. When a collection is created, it mints a few tokens.
The main (parent) token will be in the first collection, all tokens that are going to nest in the first will be in the second collection.

When the tokens are minted, nesting is carried out. We nest all tokens from the second collection into the token in
the first collection (see example below).

![Example](/example.png 'This is how it works!')

For explanation about the image server, see the corresponding section below.

### Create collection and tokens

To create collection and tokens, you need to run the `src/createCollectionAndTokens.ts` script. 

All scripts accept several command-line arguments:

`-n (--network)` - string argument specifies which network will be used. You can use one of the following values that
correspond to our networks - _opal_, _quartz_, _unique_, _rc_, _uniqsu_. Their RPCs can be found in the `utils.ts` file.

`-u (--imageUrlBase)` - string argument that specifies the base url of the image that will be stored on chain (e.g. "http://localhost:3000" for your own server to compose the images, or a link to an IPFS asset for a static image).

`-o (--owner)` - string argument that specifies to which address collections and NFTs will belong to. In the absence of this argument, defaults to the signer, declared in the environment variable.

`-a (--avatar)` - string argument specifying the name of the created image bundle. This name will be used in the URL to access
the result bundle image.

:warning: If the signer that you use in the code is not the same account as specified in the `--owner` argument,
the collections and NFTs will be transferred to the **owner** account anyway. This may make it impossible to access them if you do not have access to the **owner** account.

Here is how you can run this script:

```bash:no-line-numbers
npm install
npx tsx src/createCollectionAndTokens.ts -n 'opal' -u 'http://localhost:3000' -a 'pirate' -o '5H5rJe3ixpPBozVkfGvv2vJtG27m2ovtK7WpQioLw71Bd5mu'

yarn
yarn tsx src/createCollectionAndTokens.ts -n 'opal' -u 'http://localhost:3000' -a 'workaholic' -o '5H5rJe3ixpPBozVkfGvv2vJtG27m2ovtK7WpQioLw71Bd5mu'
```

### Server

The project also provides a simple image-composing server. When it receives a request, the server gets the tokens bundle based on this request, 
and merges all images (parent token image + all child token images). Three levels of nesting are currently supported.

Additionally, the server will apply predetermined mutations to the images if it finds appropriate properties in the token. The mutations are defined in the `imageMutationUtils.ts` file.

Then, after the images are mutated and merged, the server provides the resulting image as output.

The server accepts the requests by this pattern (of course anything can be changed in the source code): 

`<base_url>/:avatar/:network/:collectionId/:tokenId`

So, a real example request for a locally hosted server may be: http://localhost:3000/workaholic/opal/355/1, or http://localhost:3000/pirate/quartz/32/1

When the script mints the tokens, it sets the `file` property of our parent token to see to this URL.

```bash:no-line-numbers
npm install
npx tsx src/server.ts

yarn
yarn tsx src/server.ts
```

### Local image composing

Instead of launching the server, you can replicate the process of creating an image with

```bash:no-line-numbers
npm install
npx tsx src/composeTestImage.ts -n 'opal' -c 753 -t 1

yarn
yarn tsx src/composeTestImage.ts -n 'opal' -c 753 -t 1
```

This would connect to the `opal` network and compose an image of the token #1 in the collection #753. The resulting image will be stored in the `IMAGES_DIR` folder.

### Config

First of all, please copy the `.example.env` file and rename it into `.env`. Paste the seed phrase for your account into the `MNEMONIC` value. The account should have funds on the chain you would like to use, since fees.

Here are some details on other configuration:

`MNEMONIC` - the seed phrase for your account, that will be used to sign transactions.  
`IMAGES_DIR` - the folder on the server where the images will be stored. The folder will be created automatically, if it does not exist. 
`HOST` - the host address (e.g. "http://localhost:3000" or "https://workaholic.nft")
`PORT` - the port where the service will be hosted. 

Also, there is the `data.ts` file that contains data for creating collection and minting tokens. Feel free to modify these data as well.
