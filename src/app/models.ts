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
  smiles: string;
  otherProperties: { label: string, value: any }[];
}

export interface BlockSet {
  id: string;
  blocks: {
    [BlockType.Start]: Block[];
    [BlockType.Middle]: Block[];
    [BlockType.End]: Block[];
  }
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
  label: string;
  blockList: Block[];
  constructor(position: Coordinates, blockList: Block[]) {
    this.position = position;
    this.blockList = blockList;
    this.label = "NewMolecule"
  }
}

export interface User {
  surveyCode: string;
  // later: token(s), etc.
}

export function getBlockSetScale(blockSet: BlockSet, target: number): number {
  const maxHeightOrWidth = Math.max(
    ...blockSet.blocks[BlockType.Start].map(block => block.height),
    ...blockSet.blocks[BlockType.Middle].map(block => block.height),
    ...blockSet.blocks[BlockType.End].map(block => block.height),
    ...blockSet.blocks[BlockType.Start].map(block => block.width),
    ...blockSet.blocks[BlockType.Middle].map(block => block.width),
    ...blockSet.blocks[BlockType.End].map(block => block.width)
  );
  return target / maxHeightOrWidth;
}

export function getMoleculeFormula(molecule: Molecule): string {
  return molecule.blockList.map(block => block.chemicalFormula).join('');
}

export function getMoleculeWeight(molecule: Molecule): number {
  return molecule.blockList.map(block => block.molecularWeight).reduce((acc, cur) => acc + cur, 0);
}
