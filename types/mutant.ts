// Signature for an token image mutating call
export enum KnownMutator {
  Flipper = 'flipper',
  Brightener = 'brightener',
  Inflator = 'inflator',
}

// Information about a token whose image can be mutated
export interface MutantTokenComponents {
  imageUrl: string,
  mutators: KnownMutator[],
}
