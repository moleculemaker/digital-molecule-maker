import { BehaviorSubject } from 'rxjs';

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

export interface Molecule {
  id: number;
  label: string;
  position: Coordinates;
  blockList: (Block | null)[];
}

export interface User {
  surveyCode: string;
  // later: token(s), etc.
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
