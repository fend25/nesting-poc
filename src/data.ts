import { IBundleData } from '../types/bundle'

export const workaholicData: IBundleData = {
  parentCollection: {
    name: 'Face collection',
    description: 'Collection for nesting POC - face',
    tokenPrefix: 'FAC',
    coverPictureIpfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx',
  },
  childCollection: {
    name: 'Features collection',
    description: 'Collection for nesting POC - features',
    tokenPrefix: 'FTR',
    coverPictureIpfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx',
  },
  parentToken: {
    image: {
      url: 'https://gateway.pinata.cloud/ipfs/QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/golova.png',
    },
    file: {
      ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/golova.png',
    },
    name: {
      _: 'Head',
    },
    description: {
      _: 'Head token for nesting',
    },
  },
  childTokens: [
    {
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
    {
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
    {
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
  ],
}

export const pirateData: IBundleData = {
  parentCollection: {
    name: 'Background collection',
    description: 'Collection for nesting POC - background',
    tokenPrefix: 'BGR',
    coverPictureIpfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM',
  },
  secondParentCollection: {
    name: 'Body collection',
    description: 'Collection for nesting POC - body',
    tokenPrefix: 'BOD',
    coverPictureIpfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM',
  },
  childCollection: {
    name: 'Items collection',
    description: 'Collection for nesting POC - items',
    tokenPrefix: 'ITM',
    coverPictureIpfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM',
  },
  parentToken: {
    image: {
      url: 'https://gateway.pinata.cloud/ipfs/QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_bg.png',
    },
    file: {
      ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_bg.png',
    },
    name: {
      _: 'Background',
    },
    description: {
      _: 'Head token for nesting',
    },
  },
  /* secondParentToken: {
    image: {
      url: 'https://gateway.pinata.cloud/ipfs/QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_body.png',
    },
    file: {
      ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_body.png',
    },
    name: {
      _: 'Body',
    },
    description: {
      _: 'Body token for pirate',
    },
  }, */
  childTokens: [
    {
      data: {
        image: {
          ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_hat.png',
        },
        name: {
          _: 'Hat',
        },
        description: {
          _: 'Hat token for pirate',
        },
      },
    },
    {
      data: {
        image: {
          ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/pirate_suit.png',
        },
        name: {
          _: 'Suit',
        },
        description: {
          _: 'Suit token for pirate',
        },
      },
    },
    {
      data: {
        image: {
          ipfsCid: 'QmcuAd3P1vaTC3xCdARMzwEy1hJBwjcn6ArmwcNJgjyXFM/hook.png',
        },
        name: {
          _: 'Hook',
        },
        description: {
          _: 'Hook token for pirate',
        },
      },
    },
  ],
}

export const mutantData: IBundleData = {
  parentCollection: {
    name: 'Mutant collection',
    description: 'Collection for dynamic nesting POC - face',
    tokenPrefix: 'MUT',
    coverPictureIpfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx',
  },
  childCollection: {
    name: 'Mutant features collection',
    description: 'Collection for dynamic nesting POC - features',
    tokenPrefix: 'MFT',
    coverPictureIpfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx',
  },
  parentToken: {
    image: {
      url: 'https://gateway.pinata.cloud/ipfs/QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/golova.png',
    },
    file: {
      ipfsCid: 'QmdrDwzEYhTMZ5xCksaTaDQdzVewT9YxxpvaMWLtQgvTvx/golova.png',
    },
    name: {
      _: 'Head',
    },
    description: {
      _: 'Head token for nesting',
    },
  },
  childTokens: [
    {
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
    {
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
    {
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
  ],
}
