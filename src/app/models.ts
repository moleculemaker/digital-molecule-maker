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

export const toMoleculeDTO =
  (blockSet: BlockSet) =>
  (molecule: Molecule): MoleculeDTO => {
    return {
      id: molecule.id,
      name: molecule.label,
      block_set_id: blockSet.id,
      block_ids: molecule.blockList
        .sort((a, b) => a.index - b.index)
        .map((mol) => mol.id),
    };
  };

export const fromMoleculeDTO =
  (blockSet: BlockSet) =>
  (moleculeDTO: MoleculeDTO): Molecule => {
    return new Molecule(
      new Coordinates(100, 100),
      moleculeDTO.block_ids.map(
        (id, index) => blockSet.blocks[index]![id - 1]!,
      ),
      moleculeDTO.name,
      moleculeDTO.id,
    );
  };

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
  constructor(
    public position: Coordinates,
    public blockList: Block[],
    public label = 'NewMolecule',
    public id: number = -1,
  ) {}
}

export interface MoleculeDTO {
  id: number;
  name: string;
  block_set_id: string;
  block_ids: number[];
}

export interface User {
  name: string;
  username: string;
  access_token: string;
  surveyCode?: string;
  // later: token(s), etc.
}

export interface UserGroup {
  id: number;
  name: string;
  join_code: {
    code: string;
  };
  block_set_id: BlockSetId;
  creator: {
    id: number;
    name: string;
  };
  members: Array<{
    id: number;
    name: string;
  }>;
}

export function getBlockSetScale(blockSet: BlockSet, target: number): number {
  const maxHeightOrWidth = Math.max(
    ...blockSet.blocks.flat().flatMap((block) => [block.height, block.width]),
  );
  return target / maxHeightOrWidth;
}
