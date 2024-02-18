import { BehaviorSubject } from 'rxjs';

export interface EnvVars {
  hostname: string;
}

export interface Block {
  id: number;
  /**
   * index in the `Molecule.blockList` array
   */
  index: number;
  svgUrl: string;
  width: number;
  height: number;
  properties: { [label: string]: any };
}

export abstract class BlockSet {
  protected _initialized$ = new BehaviorSubject(false);

  protected _finalize() {
    this._initialized$.next(true);
  }

  /**
   * Some fields might be populated asynchronously.
   * Subscribe to wait for initialization to complete.
   */
  get initialized$() {
    return this._initialized$.asObservable();
  }

  /**
   * Some fields might be populated asynchronously.
   * Read this value to check for current initialization state.
   */
  get initialized(): boolean {
    return this._initialized$.value;
  }

  abstract id: string;
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract labelProperty: BlockPropertyDefinition;
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract primaryProperty: BlockPropertyDefinition;
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract firstTierProperties: BlockPropertyDefinition[];
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract secondTierProperties: BlockPropertyDefinition[];
  /**
   * Number of blocks in a complete molecule.
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract moleculeSize: number;
  /**
   * Get all blocks that can be placed at index `i`.
   * `i` must be smaller than `moleculeSize`.
   * Make sure `initialized` is `true` before calling this method
   */
  abstract getBlocksByPosition(i: number): Block[];
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
  label: string = '';
  constructor(
    public position: Coordinates,
    public blockList: (Block | null)[],
  ) {
    this.label = 'NewMolecule';
  }
}

export interface User {
  surveyCode: string;
  // later: token(s), etc.
}

export function getBlockSetScale(blockSet: BlockSet, target: number): number {
  let maxHeightOrWidth = 0;
  for (let i = 0; i < blockSet.moleculeSize; ++i) {
    maxHeightOrWidth = Math.max(
      maxHeightOrWidth,
      ...blockSet
        .getBlocksByPosition(i)
        .flatMap((block) => [block.width, block.height]),
    );
  }
  return target / maxHeightOrWidth;
}

export type ViewMode = 'structure' | 'function';

/**
 * Defines a filter than can be applied to a block or list of blocks
 */
export type FilterDescriptor<BlockOrBlockListT> = {
  availableIn: ViewMode[];
} & (
  | {
      type: 'categories';
      /**
       * Initial selected categories
       */
      initialValue: string[];
      /**
       * all possible categories to select from
       */
      categories: string[];
      /**
       * Derive the classifications of a block or list of blocks that will be tested against selected categories.
       * The filter accepts the block or list of blocks if it's classified into any one of the selected categories.
       */
      mapArgToValue(arg: BlockOrBlockListT): string[];
    }
  | {
      type: 'range';
      /**
       * Initial lower bound and upper bound that the filtered property will be tested against
       */
      initialValue: [number, number];
      /**
       * Lowest possible lower bound
       */
      min: number;
      /**
       * Highest possible upper bound
       */
      max: number;
      /**
       * Derive the property value from a block or list of blocks that will be tested against the value range
       */
      mapArgToValue(arg: BlockOrBlockListT): number;
    }
);

/**
 * A stateful filter instance created from a `FilterDescriptor`
 */
export type Filter<BlockOrBlockListT> =
  | {
      descriptor: FilterDescriptor<BlockOrBlockListT> & { type: 'categories' };
      value$: BehaviorSubject<string[]>;
    }
  | {
      descriptor: FilterDescriptor<BlockOrBlockListT> & { type: 'range' };
      value$: BehaviorSubject<[number, number]>;
    };

export function aggregateProperty(
  molecule: Molecule,
  property: BlockPropertyDefinition,
): any {
  if (property.aggregationStrategy === 'sum') {
    return molecule.blockList
      .filter((x): x is Block => !!x)
      .map((block) => block.properties[property.key])
      .reduce((acc, cur) => acc + cur, 0);
  } else if (property.aggregationStrategy === 'chemicalFormula') {
    let returnVal = '';
    const concatenatedFormula = molecule.blockList
      .filter((x): x is Block => !!x)
      .map((block) => block.properties[property.key])
      .join('');
    if (concatenatedFormula.length > 0) {
      const atomCounts = new Map<string, number>();
      const processSubstring = (substring: string) => {
        const match = substring.match(/([A-Za-z]+)(\d*)/);
        if (match) {
          const atom = match[1]!;
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
      .filter((x): x is Block => !!x)
      .map((block) => block.properties[property.key])
      .join('-');
  }
  return 'unrecognized aggregation strategy';
}
