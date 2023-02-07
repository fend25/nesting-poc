export default {
  baseUrl: 'https://rest.unique.network/opal/v1', 
  // sample account for demo purposes
  mnemonic: 'bonus rubber price teach initial finger robust century scorpion pioneer require blade',
  parentToken: {
    image: {
      ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/golova.png',
    },
    name: {
      _: 'Head',
    },
    description: {
      _: 'Head token for nesting',
    },
  },
  childToken1: {
    data: {
      image: {
        ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/brovki.png',
      },
      name: {
        _: 'Eyebrows',
      },
      description: {
        _: 'Eyebrows token for nesting',
      },
    },
  },

  childToken2: {
    data: {
      image: {
        ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/pricheska.png',
      },
      name: {
        _: 'Hair',
      },
      description: {
        _: 'Hair token for nesting',
      },
    },
  },

  childToken3: {
    data: {
      image: {
        ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/boroda.png',
      },
      name: {
        _: 'Beard',
      },
      description: {
        _: 'Beard token for nesting',
      },
    },
  },
  parent: {
    collectionId: 351,
    tokenId: 1,
  },
  nestedEyebrows: {
    collectionId: 352,
    tokenId: 1,
  },
  nestedHair: {
    collectionId: 352,
    tokenId: 2,
  },
  nestedBeard: {
    collectionId: 352,
    tokenId: 3,
  },
}
