export const data = {
  backgroundCollection: {
    name: 'Background collection',
    description: 'Collection for nesting POC - background',
    tokenPrefix: 'BGR',
  },
  bodyCollection: {
    name: 'Body collection',
    description: 'Collection for nesting POC - body',
    tokenPrefix: 'BOD',
  },
  childCollection: {
    name: 'Items collection',
    description: 'Collection for nesting POC - items',
    tokenPrefix: 'ITM',
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
  mainToken: {
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
  },
  childToken1: {
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
  childToken2: {
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

  childToken3: {
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
}
