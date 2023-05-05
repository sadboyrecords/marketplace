import { MintCounter } from "@metaplex-foundation/mpl-candy-guard";
import { deserialize } from "borsh";

export class MintCounterBorsh implements MintCounter {
  count: number;
  constructor(args: MintCounter) {
    Object.assign(this, args);
    this.count = args.count;
  }
  static schema = new Map([
    [
      MintCounterBorsh,
      {
        kind: "struct",
        fields: [
        //   ["accountDiscriminator", "Uint8Array"],
          ["count", "u16"],
        ],
      },
    ],
  ]) as any;
  static fromBuffer(buffer: Buffer) {
    return deserialize(MintCounterBorsh.schema, MintCounterBorsh, buffer);
  }
}
