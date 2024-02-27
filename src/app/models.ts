export interface EnvVars {
  hostname: string;
}

export interface Block {
  index: number;
  id: number;
  svgUrl: string;
  width: number;
  height: number;
  properties: { [label: string]: any };
}

export interface BlockSet {
  id: string;
  moleculeSize: number;
  labelProperty: BlockPropertyDefinition;
  primaryProperty: BlockPropertyDefinition;
  firstTierProperties: BlockPropertyDefinition[];
  secondTierProperties: BlockPropertyDefinition[];
  blocks: Block[];
}

export interface RigJob {
  block_set_id: string;
  block_ids: number[];
  molecule_name: string;
  status?: string;
  user_or_group?: number;
}

export interface BlockPropertyDefinition {
  key: string;
  label: string;
  displayStrategy: ChemicalPropertyDisplayStrategy;
  aggregationStrategy: ChemicalPropertyAggregationStrategy;
}

export type ChemicalPropertyDisplayStrategy = 'default' | 'chemicalFormula';
export type ChemicalPropertyAggregationStrategy =
  | 'sum'
  | 'chemicalFormula'
  | 'smiles';

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
    ...blockSet.blocks.flatMap((block) => [block.height, block.width]),
  );
  return target / maxHeightOrWidth;
}

export function aggregateProperty(
  molecule: Molecule,
  property: BlockPropertyDefinition,
): any {
  if (property.aggregationStrategy === 'sum') {
    return molecule.blockList
      .map((block) => block.properties[property.key])
      .reduce((acc, cur) => acc + cur, 0);
  } else if (property.aggregationStrategy === 'chemicalFormula') {
    let returnVal = '';
    const concatenatedFormula = molecule.blockList
      .map((block) => block.properties[property.key])
      .join('');
    if (concatenatedFormula.length > 0) {
      const atomCounts = new Map<string, number>();
      const processSubstring = (substring: string) => {
        const match = substring.match(/([A-Za-z]+)(\d*)/);
        if (match) {
          const atom = match[1];
          const count = parseInt(match[2] || '1', 10);
          if (atomCounts.has(atom)) {
            atomCounts.set(atom, atomCounts.get(atom)! + count);
          } else {
            atomCounts.set(atom, count);
          }
        }
      };
      let seen = concatenatedFormula.charAt(0);
      for (let index = 1; index < concatenatedFormula.length; index++) {
        let next = concatenatedFormula.charAt(index);
        // if it's an upper-case letter, process seen and start anew
        if (/[A-Z]/.test(next)) {
          processSubstring(seen);
          seen = next;
        } else {
          seen += next;
        }
      }
      processSubstring(seen);
      const appendOneAtom = (atom: string) => {
        if (atomCounts.has(atom)) {
          const count = atomCounts.get(atom)!;
          returnVal += atom;
          if (count > 1) {
            returnVal += count;
          }
        }
      };
      ['C', 'H', 'F', 'N', 'O', 'S'].forEach((atom) => {
        appendOneAtom(atom);
        atomCounts.delete(atom);
      });
      // if there's anything left, add it to the end
      atomCounts.forEach((count, atom) => {
        appendOneAtom(atom);
      });
    }
    return returnVal;
  } else if (property.aggregationStrategy === 'smiles') {
    return molecule.blockList
      .map((block) => block.properties[property.key])
      .join('-');
  }
  return 'unrecognized aggregation strategy';
}
