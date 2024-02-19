import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Block,
  MolecularPropertyDefinition,
  FilterDescriptor,
} from '../../models';
import { Injectable } from '@angular/core';
import { getSVGViewBox } from '../../utils/SVG';
import { map, tap } from 'rxjs/operators';
import { CWBlockTypeFilterComponent } from './cw-block-type-filter/cw-block-type-filter.component';
import { LambdaMaxRangeForColor } from '../../utils/colors';
import { CWColorFilterComponent } from './cw-color-filter/cw-color-filter.component';
import { getChemicalFormula, getSMILES } from '../../utils/formulas';
import { BlockSet } from '../block-set';

type ColorWheelBlockSetJSON = {
  id: string;
  labelProperty: MolecularPropertyDefinition;
  primaryProperty: MolecularPropertyDefinition;
  firstTierProperties: MolecularPropertyDefinition[];
  secondTierProperties: MolecularPropertyDefinition[];
  blocks: {
    start: Block[];
    middle: Block[];
    end: Block[];
  };
};

const ASSET_URL = 'assets/blocks/10x10x10palette/blocks.json';
const ALL_COLORS = [
  'uva',
  'uvb',
  'uvc',
  'yellow',
  'orange',
  'red',
  'magenta',
  'violet',
  'blue',
  'cyan',
];

@Injectable({
  providedIn: 'root',
})
export class ColorWheelBlockSet extends BlockSet {
  id: string = 'COLOR_WHEEL';

  _json!: ColorWheelBlockSetJSON;

  get labelProperty() {
    return this._json.labelProperty;
  }
  get primaryProperty() {
    return this._json.primaryProperty;
  }

  get firstTierProperties() {
    return this._json.firstTierProperties;
  }
  get secondTierProperties() {
    return this._json.secondTierProperties;
  }

  filterDescriptors: FilterDescriptor[] = [
    {
      type: 'source_categories',
      availableIn: ['structure'],
      Component: CWBlockTypeFilterComponent,
      initialValue: ['start', 'middle', 'end'],
      categories: ['start', 'middle', 'end'],
      mapArgToValue: (block) => {
        if (block.index === 0) return ['start'];
        if (block.index === 2) return ['end'];
        return ['middle'];
      },
    },
    {
      type: 'target_categories',
      availableIn: ['function'],
      Component: CWColorFilterComponent,
      initialValue: ALL_COLORS,
      categories: ALL_COLORS,
      mapArgToValue: (blocks) => {
        const lambdaMax = blocks.reduce(
          (lambdaMax, block) => lambdaMax + block.properties.lambdaMaxShift,
          0,
        );
        const color = ALL_COLORS.find((color) => {
          const { min, max } = LambdaMaxRangeForColor[color]!;
          return lambdaMax >= min && lambdaMax <= max;
        });
        return color ? [color] : [];
      },
    },
  ];

  moleculeSize = 3;

  constructor(private http: HttpClient) {
    super();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    this.http
      .get<ColorWheelBlockSetJSON>(ASSET_URL, httpOptions)
      .subscribe((json) => {
        this._json = json;
        this._json.blocks.start.forEach((block) => {
          block.index = 0;
        });
        this._json.blocks.middle.forEach((block) => {
          block.index = 1;
        });
        this._json.blocks.end.forEach((block) => {
          block.index = 2;
        });
        this.resolveSVGDimensions().subscribe(() => {
          this._finalize();
        });
      });
  }

  getBlocksByPosition(i: number): Block[] {
    return [
      this._json.blocks.start,
      this._json.blocks.middle,
      this._json.blocks.end,
    ][i]!;
  }

  private resolveSVGDimensions(): Observable<any> {
    return forkJoin(
      this.getAllBlocks().map((block) =>
        this.http.get(block.svgUrl, { responseType: 'text' }).pipe(
          map(getSVGViewBox),
          tap(([x, y, width, height]) => {
            block.width = width;
            block.height = height;
          }),
        ),
      ),
    );
  }

  getMolecularPropertyDisplayString(
    blockList: (Block | null)[],
    property: MolecularPropertyDefinition,
  ): string {
    switch (property.key) {
      case 'chemicalFormula':
        return getChemicalFormula(blockList);
      case 'smiles':
        return getSMILES(blockList);
      case 'lambdaMaxShift':
      case 'molecularWeight':
        return String(
          blockList.reduce(
            (total, block) =>
              total + (block ? Number(block.properties[property.key]) : 0),
            0,
          ),
        );
      default:
        return '';
    }
  }
}
