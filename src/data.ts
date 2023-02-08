export const data = {
  parentCollection: {
    name: 'Parent collection',
    description: 'Collection for nesting POC - parent',
    tokenPrefix: 'PRT',
  },
  childCollection: {
    name: 'Child collection',
    description: 'Collection for nesting POC - child',
    tokenPrefix: 'CLD',
  },
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
}
