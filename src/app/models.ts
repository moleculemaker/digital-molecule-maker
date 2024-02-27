import { BlockSetId } from './services/block.service';

export interface EnvVars {
  hostname: string;
}

export interface Block {
  index: number;
  id: number;
  svgUrl: string;
  width: number;
  height: number;
}

export interface LookupTableEntry {
  key: string;
  [property: string]: number | string;
}

export interface FunctionalPropertyDefinition
  extends ChemicalPropertyDefinition {
  min: number;
  max: number;
}

export interface BlockSet {
  id: BlockSetId;
  moleculeSize: number;
  labelProperty: ChemicalPropertyDefinition;
  primaryProperty: ChemicalPropertyDefinition;
  functionalProperties: FunctionalPropertyDefinition[];
  firstTierProperties: ChemicalPropertyDefinition[];
  secondTierProperties: ChemicalPropertyDefinition[];
  blocks: Block[][];
  table: Record<string, LookupTableEntry>;
}

export interface RigJob {
  block_set_id: string;
  block_ids: number[];
  molecule_name: string;
  status?: string;
  user_or_group?: number;
}

export interface ChemicalPropertyDefinition {
  key: string;
  label: string;
  displayStrategy: ChemicalPropertyDisplayStrategy;
}

export type ChemicalPropertyDisplayStrategy = 'default' | 'chemicalFormula';

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
    this.label = 'NewMolecule';
  }
}

export interface User {
  surveyCode: string;
  // later: token(s), etc.
}

export function getBlockSetScale(blockSet: BlockSet, target: number): number {
  const maxHeightOrWidth = Math.max(
    ...blockSet.blocks.flat().flatMap((block) => [block.height, block.width]),
  );
  return target / maxHeightOrWidth;
}
