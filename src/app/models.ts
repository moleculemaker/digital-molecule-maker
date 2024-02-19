import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

export interface EnvVars {
  hostname: string;
}

export interface Block {
  id: string;
  /**
   * index in the `Molecule.blockList` array
   */
  index: number;
  svgUrl: string;
  width: number;
  height: number;
  properties: { [label: string]: any };
}

@Injectable({
  providedIn: 'root',
})
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
  abstract labelProperty: MolecularPropertyDefinition;
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract primaryProperty: MolecularPropertyDefinition;
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract firstTierProperties: MolecularPropertyDefinition[];
  /**
   * Make sure `initialized` is `true` before accessing this property
   */
  abstract secondTierProperties: MolecularPropertyDefinition[];
  /**
   * All filters that are available/visible in the current view mode are applied in the following order:
   * - Apply `target_*` filters to all possible final outcomes of the current active molecule in the
   *   workspace. A block is accepted if it's possible to construct a molecule that passes the target filter after
   *   adding the block to the current active molecule in the workspace.
   * - Apply `source_*` filters to the remaining blocks
   */
  abstract filterDescriptors: FilterDescriptor[];
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
  abstract getBlocksByPosition(index: number): Block[];

  getAllBlocks() {
    const res: Block[] = [];
    for (let i = 0; i < this.moleculeSize; ++i) {
      res.push(...this.getBlocksByPosition(i));
    }
    return res;
  }

  /**
   * This method recursively generates all possible outcomes starting from the provided block list
   * and filters the results based on the specified target filters.
   */
  getAllOutcomes(
    startingFrom: (Block | null)[],
    targetFilters: TargetFilter[],
  ) {
    const res: Block[][] = [];
    const curBlocks = startingFrom.slice();

    const enumerate = (curIndex: number) => {
      if (curIndex === this.moleculeSize) {
        // the molecule is complete
        const blocks = curBlocks.slice() as Block[];
        if (acceptBlockList(blocks, targetFilters)) {
          res.push(blocks);
        }
        return;
      }

      if (startingFrom[curIndex]) {
        // use the already selected block
        enumerate(curIndex + 1);
      } else {
        // enumerate all possibilities
        for (let block of this.getBlocksByPosition(curIndex)) {
          curBlocks[curIndex] = block;
          enumerate(curIndex + 1);
          curBlocks[curIndex] = null;
        }
      }
    };

    enumerate(0);

    return res;
  }

  getAvailableBlocks(
    startingFrom: (Block | null)[],
    filters: Filter[],
  ): Block[] {
    const sourceFilters = filters.filter(
      (f): f is SourceFilter =>
        f.type === 'source_categories' || f.type === 'source_range',
    );
    const targetFilters = filters.filter(
      (f): f is TargetFilter =>
        f.type === 'target_categories' || f.type === 'target_range',
    );

    // accepted by target filters
    let firstPass: Block[] = this.getAllBlocks();

    if (targetFilters.length) {
      // only include blocks from which a valid molecule can be made
      const filteredOutcomes = this.getAllOutcomes(startingFrom, targetFilters);
      const added = new Set<string>();
      firstPass.length = 0;
      for (let blockList of filteredOutcomes) {
        for (let block of blockList) {
          if (!added.has(block.id)) {
            added.add(block.id);
            firstPass.push(block);
          }
        }
      }
    }

    const inUse = new Set<string>();
    for (let block of startingFrom) {
      if (block) {
        inUse.add(block.id);
      }
    }

    // accepted by both target and source filters
    return firstPass.filter(
      (block) => acceptBlock(block, sourceFilters) && !inUse.has(block.id),
    );
  }

  /**
   * Returns a label or a string representation of a chemical property of the provided list of blocks.
   * The string should be an opaque representation whose only use is to be displayed on screen. It might describe:
   *  - either the predicted property value of the (possibly incomplete) list of blocks itself,
   *  - or a summary of the statistical properties of the predicted distribution of all final outcomes.
   *
   * Subclasses of `BlockSet` could implement arbitrary strategies for generating the display strings.
   * Consumers of this method should be agnostic about the semantics of the string.
   */
  abstract getMolecularPropertyDisplayString(
    blockList: (Block | null)[],
    property: MolecularPropertyDefinition,
  ): string;
}

export interface RigJob {
  block_set_id: string;
  block_ids: string[];
  molecule_name: string;
  status?: string;
  user_or_group?: number;
}

export interface MolecularPropertyDefinition {
  key: string;
  label: string;
  displayStrategy: MolecularPropertyDisplayStrategy;
}

export type MolecularPropertyDisplayStrategy = 'default' | 'chemicalFormula';

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
  const maxHeightOrWidth = Math.max(
    ...blockSet.getAllBlocks().flatMap((block) => [block.width, block.height]),
  );
  return target / maxHeightOrWidth;
}

export type ViewMode = 'structure' | 'function';

type FilterDescriptorCommonProps = {
  availableIn: ViewMode[];
  /**
   * The component class that provides UI for the filter. After a `Filter` instance is created based on this descriptor,
   * a corresponding instance of this class will also be created, and its template will be bound to `filter.value$`.
   */
  Component: any;
};

export type CategoricalFilterDescriptorProps = FilterDescriptorCommonProps & {
  /**
   * Initial selected categories
   */
  initialValue: string[];
  /**
   * all possible categories to select from
   */
  categories: string[];
  /**
   * Render textual description of filter state
   */
  renderToText?(value: string[]): string;
};

export type RangeFilterDescriptorProps = FilterDescriptorCommonProps & {
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
   * Render textual description of filter state
   */
  renderToText?(value: [number, number]): string;
};

export type SourceCategoricalFilterDescriptor =
  CategoricalFilterDescriptorProps & {
    type: 'source_categories';
    /**
     * Derive the classifications of a block that will be tested against selected categories.
     * The filter accepts the block if it's classified into any one of the selected categories.
     */
    mapArgToValue(arg: Block): string[];
  };

export type TargetCategoricalFilterDescriptor =
  CategoricalFilterDescriptorProps & {
    type: 'target_categories';
    /**
     * Derive the classifications of a list of blocks that will be tested against selected categories.
     * The filter accepts the list of blocks if it's classified into any one of the selected categories.
     */
    mapArgToValue(arg: Block[]): string[];
  };

export type SourceRangeFilterDescriptor = RangeFilterDescriptorProps & {
  type: 'source_range';
  /**
   * Derive the property value from a block that will be tested against the value range
   */
  mapArgToValue(arg: Block): number;
};

export type TargetRangeFilterDescriptor = RangeFilterDescriptorProps & {
  type: 'target_range';
  /**
   * Derive the property value from a list of blocks that will be tested against the value range
   */
  mapArgToValue(arg: Block[]): number;
};

export type FilterDescriptor =
  | SourceCategoricalFilterDescriptor
  | SourceRangeFilterDescriptor
  | TargetCategoricalFilterDescriptor
  | TargetRangeFilterDescriptor;

export type SourceCategoricalFilter = {
  type: 'source_categories';
  meta: SourceCategoricalFilterDescriptor;
  value$: BehaviorSubject<string[]>;
};

export type SourceRangeFilter = {
  type: 'source_range';
  meta: SourceRangeFilterDescriptor;
  value$: BehaviorSubject<[number, number]>;
};

export type TargetCategoricalFilter = {
  type: 'target_categories';
  meta: TargetCategoricalFilterDescriptor;
  value$: BehaviorSubject<string[]>;
};

export type TargetRangeFilter = {
  type: 'target_range';
  meta: TargetRangeFilterDescriptor;
  value$: BehaviorSubject<[number, number]>;
};

export type SourceFilter = SourceCategoricalFilter | SourceRangeFilter;

export type TargetFilter = TargetCategoricalFilter | TargetRangeFilter;

export type Filter = SourceFilter | TargetFilter;

export function acceptBlock(block: Block, filters: SourceFilter[]) {
  return filters.every((f) => _acceptBlock(block, f));
}

export function acceptBlockList(blocks: Block[], filters: TargetFilter[]) {
  return filters.every((f) => _acceptBlockList(blocks, f));
}

function _acceptBlock(block: Block, filter: SourceFilter) {
  switch (filter.type) {
    case 'source_range': {
      const value = filter.meta.mapArgToValue(block);
      const [min, max] = filter.value$.value;
      return value >= min && value <= max;
    }
    case 'source_categories': {
      const categories = filter.meta.mapArgToValue(block);
      return categories.some((c) => filter.value$.value.includes(c));
    }
  }
}
function _acceptBlockList(blocks: Block[], filter: TargetFilter) {
  switch (filter.type) {
    case 'target_range': {
      const value = filter.meta.mapArgToValue(blocks);
      const [min, max] = filter.value$.value;
      return value >= min && value <= max;
    }
    case 'target_categories': {
      const categories = filter.meta.mapArgToValue(blocks);
      return categories.some((c) => filter.value$.value.includes(c));
    }
  }
}
