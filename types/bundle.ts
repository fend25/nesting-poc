interface ICollection {
  name: string
  description: string
  tokenPrefix: string
  coverPictureIpfsCid: string
}

interface IParentToken {
  image: {
    url: string
  }
  file: {
    ipfsCid: string
  }
  name: {
    _: string
  }
  description: {
    _: string
  }
}

interface IChildToken {
  data: {
    image: {
      ipfsCid: string
    }
    name: {
      _: string
    }
    description: {
      _: string
    }
  }
}

export interface IBundleData {
  parentCollection: ICollection
  secondParentCollection?: ICollection
  childCollection: ICollection
  parentToken: IParentToken
  secondParentToken?: IParentToken
  childTokens: IChildToken[]
}
