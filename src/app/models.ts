export enum BlockType {
    Start = 'start',
    Middle = 'middle',
    End = 'end'
}

export interface Block {
    type: BlockType;
    id: string;
    label: string;
    svgUrl: string;
    width: number;
    height: number;
    chemicalFormula: string;
    molecularWeight: number;
    HBondDonors: number;
    IUPACName: string;
}

export interface BlockSet {
    [BlockType.Start]: Block[];
    [BlockType.Middle]: Block[];
    [BlockType.End]: Block[];
}

export class Coordinates {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Molecule {
  position: Coordinates;
  blockList: Block[];
  constructor(position: Coordinates, blockList: Block[]) {
    this.position = position;
    this.blockList = blockList;
  }
}
