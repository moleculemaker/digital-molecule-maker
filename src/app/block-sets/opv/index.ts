import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Block,
  MolecularPropertyDefinition,
  FilterDescriptor,
} from 'app/models';
import { Injectable } from '@angular/core';
import { getSVGViewBox } from 'app/utils/SVG';
import { map, mergeMap, tap } from 'rxjs/operators';
import { getChemicalFormula, getSMILES } from 'app/utils/formulas';
import { BlockSet } from 'app/block-set';
import { OPVSidebarBlockSOComponent } from './opv-sidebar-block-so/opv-sidebar-block-so.component';
import { OPVWorkspaceBlockSOComponent } from './opv-workspace-block-so/opv-workspace-block-so.component';
import { OpvSoSliderComponent } from './opv-so-slider/opv-so-slider.component';
import { CWBlockTypeFilterComponent } from '../color-wheel/cw-block-type-filter/cw-block-type-filter.component';

type OPVBlockSetJSON = {
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

type OPVBlockSetDFT = {
  DBA_Name: string;
  Predicted_SO: number;
  Predicted_T80: number;
}[];

const ASSET_URL = 'assets/blocks/opv/blocks.json';
const DFT_DATA_URL = 'assets/blocks/opv/dft.json';

@Injectable({
  providedIn: 'root',
})
export class OPVBlockSet extends BlockSet {
  SidebarBlockSVGFunctionModeContentComponent = OPVSidebarBlockSOComponent;
  WorkspaceBlockSVGFunctionModeContentComponent = OPVWorkspaceBlockSOComponent;

  id: string = 'COLOR_WHEEL';

  _json!: OPVBlockSetJSON;
  _dft!: OPVBlockSetDFT;

  get labelProperty() {
    return this._json.labelProperty;
  }
  get primaryProperty(): MolecularPropertyDefinition {
    return {
      key: 'Predicted_SO',
      label: 'Predicted SO',
      displayStrategy: 'default',
    };
    // return this._json.primaryProperty;
  }

  get firstTierProperties(): MolecularPropertyDefinition[] {
    return [
      {
        key: 'Predicted_SO',
        label: 'Predicted SO',
        displayStrategy: 'default',
      },
      {
        key: 'Predicted_T80',
        label: 'Predicted T80',
        displayStrategy: 'default',
      },
    ];
    // return this._json.firstTierProperties;
  }
  get secondTierProperties() {
    return this._json.secondTierProperties;
  }

  filterDescriptors: FilterDescriptor[] = [
    {
      type: 'source_categories',
      availableIn: ['structure', 'function'],
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
      type: 'target_range',
      availableIn: ['function'],
      Component: OpvSoSliderComponent,
      initialValue: [0, 1],
      min: 0,
      max: 1,
      mapArgToValue: (blocks) => {
        return this.predictChemicalProperty(blocks, {
          key: 'Predicted_SO',
          label: 'Predicted SO',
          displayStrategy: 'default',
        });
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

    const loadJSON$ = this.http
      .get<OPVBlockSetJSON>(ASSET_URL, httpOptions)
      .pipe(
        mergeMap((json) => {
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

          // TODO: this is just for testing, NOT the actual logic
          for (let block of this.getAllBlocks()) {
            block.properties['Predicted_SO'] = Math.random();
            block.properties['Predicted_T80'] = Math.random() * 100;
          }

          return this.resolveSVGDimensions();
        }),
      );

    const loadDFT$ = this.http.get<OPVBlockSetDFT>(DFT_DATA_URL).pipe(
      tap((json) => {
        this._dft = json;
      }),
    );

    forkJoin([loadJSON$, loadDFT$]).subscribe(() => {
      this._finalize();
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

  getBlockPropertyDisplayString(
    block: Block,
    property: MolecularPropertyDefinition,
  ): string {
    switch (property.key) {
      case 'Predicted_SO':
        return (
          (this.getBlockChemicalProperty(block, property) * 100).toFixed(2) +
          '%'
        );
      case 'Predicted_T80':
        return this.getBlockChemicalProperty(block, property).toFixed(2) + 's';
      default:
        return String(block.properties[property.key]);
    }
  }

  getBlockChemicalProperty(
    block: Block,
    property: MolecularPropertyDefinition,
  ): number {
    return Number(block.properties[property.key]);
  }

  getMoleculePropertyDisplayString(
    blockList: (Block | null)[],
    property: MolecularPropertyDefinition,
  ): string {
    switch (property.key) {
      case 'chemicalFormula':
        return getChemicalFormula(blockList);
      case 'smiles':
        return getSMILES(blockList);
      case 'molecularWeight':
        return String(
          blockList.reduce(
            (total, block) =>
              total + (block ? Number(block.properties[property.key]) : 0),
            0,
          ),
        );
      case 'Predicted_SO':
        return (
          (this.predictChemicalProperty(blockList, property) * 100).toFixed(2) +
          '%'
        );
      case 'Predicted_T80':
        return (
          this.predictChemicalProperty(blockList, property).toFixed(2) + 's'
        );
      default:
        return '';
    }
  }

  predictChemicalProperty(
    blockList: (Block | null)[],
    property: MolecularPropertyDefinition,
  ): number {
    switch (property.key) {
      case 'Predicted_SO': {
        // TODO: this is NOT the actual logic, just to produce a consistent value for testing
        let index = 0;
        const allOutComes = this.getAllOutcomes(blockList, []);

        for (let blockList of allOutComes) {
          for (let block of blockList) {
            index += (Number(block?.id) || 0) ** 5;
          }
        }
        return this._dft[index % this._dft.length]!.Predicted_SO;
      }

      case 'Predicted_T80':
        // TODO: this is NOT the actual logic, just to produce a consistent value for testing
        let index = 0;
        const allOutComes = this.getAllOutcomes(blockList, []);

        for (let blockList of allOutComes) {
          for (let block of blockList) {
            index += Number(block?.id) || 0;
          }
        }
        return this._dft[index % this._dft.length]!.Predicted_T80;

      case 'molecularWeight':
        return blockList.reduce(
          (total, block) =>
            total + (block ? Number(block.properties[property.key]) : 0),
          0,
        );

      default:
        return NaN;
    }
  }
}
