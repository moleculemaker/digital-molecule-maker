import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { HttpClient } from '@angular/common/http';
import { UserGroup } from '../models';
import { EnvironmentService } from '../services/environment.service';

@Component({
  selector: 'dmm-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent {
  smiles1Options = [
    '',
    'Bc1cccs1',
    'Bc2ccc(c1cccs1)s2',
    'Bc3cc2c(OC(CC)CCCC)c1sccc1c(OC(CC)CCCC)c2s3',
  ];

  smiles2Options = [
    '',
    'Bc1ccc(Br)s1',
    'Bc1ccc(Br)[se]1',
    'Bc2cc1sc(Br)cc1s2',
    'Bc2ccc(c1ccc(Br)s1)s2',
    'Bc1cccc(Br)c1',
    'Bc1ccc(Br)cc1',
    'Bc2cc1cc(Br)ccc1o2',
  ];

  smiles3Options = [
    '',
    'CC(C)COc1cc(N)c([N+](=O)[O-])cc1Br',
    'O=C(O)c1cc([N+](=O)[O-])cc([N+](=O)[O-])c1Br',
    'Brc1ccc2c(c1)C1(c3ccccc3Oc3ccccc31)c1ccccc1-2',
    'S=c1[nH]c(-c2ccc(Br)cc2)cs1',
    'Brc1cc(OCc2ccccc2)cc(OCc2ccccc2)c1',
    'O=c1[nH]cnc2cc(I)ccc12',
    'COC(=O)c1ccc(OC)c(I)c1',
    'CCOC(=O)Cn1ccc2cc(Br)ccc21',
    'Cc1cc(C)c(Br)cc1C',
    'Nc1c(S(=O)(=O)O)cc(Br)c2c1C(=O)c1ccccc1C2=O',
    'CC(C)(C)OC(=O)CN1C(=O)CCc2cc(Br)ccc21',
    'O=S(=O)(c1ccc(Br)s1)N1CCNCC1',
    'CCCCCCCCCCCCc1ccsc1Br',
    'O=C(NC1CCCCC1)c1ccc(Br)c([N+](=O)[O-])c1',
    'COc1cc2c(Nc3ccc(Br)cc3F)ncnc2cc1OCC1CCN(C)CC1',
    'COc1ccc(CNc2ccc([N+](=O)[O-])cc2Br)cc1',
    'CCOC(=O)c1[nH]c2ccccc2c1Br',
    'O=C(Nc1ccccc1)c1cc(F)ccc1Br',
    'COc1ccc(-c2csc(C)n2)cc1Br',
    'O=[N+]([O-])c1cccc(-c2nc(-c3ccc(Br)cc3)no2)c1',
    'Brc1c2ccccc2c(-c2cccc3ccccc23)c2ccccc12',
    'Cc1cc(Br)c2c(c1N)C(=O)c1ccccc1C2=O',
    'Cc1ccc(I)s1',
    'CCCNC(=O)c1cc(F)ccc1Br',
    'Brc1ccccc1OCCOCc1ccccc1',
    'Brc1cn(C(c2ccccc2)(c2ccccc2)c2ccccc2)cn1',
    'Nc1ccc2cccc(Br)c2n1',
    'CC(C)(C)OC(=O)NC(Cc1ccc(I)cc1)C(=O)O',
    'Brc1c2ccccc2c(-c2ccccc2)c2ccccc12',
    'O=S(=O)(c1ccccc1)c1ccc(Br)cc1',
    'CCN(CC)S(=O)(=O)c1ccc(OC(F)(F)F)cc1Br',
    'O=C(O)COc1cc(F)ccc1Br',
    'COc1ccc2c(c1)c(Br)cn2C(=O)OC(C)(C)C',
    'N#Cc1ccc(Br)c(F)c1N',
    'Fc1cccc(I)c1',
    'Ic1ccc2ccccc2c1',
    'COC(=O)c1nc(Br)cnc1N',
    'O=[N+]([O-])c1ccc(N2CCCC2)c(Br)c1',
    'CNC(=S)Nc1ccccc1Br',
    'Cc1cc(Br)c2nnnn2c1',
    'Brc1ccc2cc3ccccc3cc2c1',
    'Brc1cccc([Si](c2ccccc2)(c2ccccc2)c2ccccc2)c1',
    'Brc1ccco1',
    'Nc1cnc(Br)cc1N',
    'CN1CCN(S(=O)(=O)c2ccc(Br)cc2)CC1',
    'CN(C)S(=O)(=O)n1cnc(I)c1',
    'Cc1nc(N)ncc1Br',
    'Fc1cc(Br)ccc1OC(F)(F)F',
    'Oc1c(Br)ccc(OCc2ccccc2)c1F',
    'O=S(=O)(c1cccc(Br)c1)N1CCC1',
    'NCc1nc(Cc2ccccc2Br)no1',
    'N#Cc1ccc(C(F)(F)F)cc1Br',
    'N#Cc1cc(N)ccc1Br',
    'O=[N+]([O-])c1cc(I)cc(C(F)(F)F)c1',
    'O=[N+]([O-])c1ccc(Br)c2cccnc12',
    'CCCS(=O)(=O)c1cccc(Br)c1',
    'O=[N+]([O-])c1ccc(Oc2ccccc2Br)cc1',
    'Fc1nc(F)c(F)c(Br)c1F',
    'COC(=O)c1cc(Br)cc(N)c1N',
    'CC(C)(C)OC(=O)N(C(=O)OC(C)(C)C)c1ncc(Br)cn1',
    'Fc1ccccc1-c1cc2cc(Br)ccc2[nH]1',
    'Oc1ccc(Br)cc1C12CC3CC(CC(C3)C1)C2',
    'Brc1ccc(Oc2cccnc2)nc1',
    'O=C(O)C=Cc1ccc(Br)c(F)c1',
    'CCCCNS(=O)(=O)c1cc(C)cc(Br)c1',
    'O=[N+]([O-])c1cc(C(F)(F)F)ccc1Oc1ccc(Br)cc1',
    'N#Cc1csc(Br)n1',
    'Cc1cc(N2CCN(C)CC2)ncc1Br',
    'CC(NC(=O)OC(C)(C)C)c1ccc(Br)cc1',
    'CC(C)(C)OC(=O)n1ccc2ccc(Br)cc21',
    'O=C(O)c1csc(Cc2ccccc2Br)n1',
    'CCCCCCCCc1ccsc1Br',
    'CC(C)(C)OC(=O)N1CCC2(CC1)CC(=O)c1cc(Br)ccc1O2',
    'CCNS(=O)(=O)c1cc(Br)ccc1OC',
    'CCCCSCc1ccccc1Br',
    'Cc1noc(-c2ccc(Br)cc2)c1NC(=O)OC(C)c1ccccc1',
    'Nc1cc(Br)[nH]n1',
    'Brc1c(C2CCCCC2)cc(C2CCCCC2)cc1C1CCCCC1',
    'COC(=O)c1cc(Br)c(N)c([N+](=O)[O-])c1',
    'CC(C)(C)OC(=O)N1CCc2nc(Br)sc2C1',
    'Oc1ccc(O)c(Br)c1',
    'Cc1nc2cc(Br)c(F)cc2n1C1CCCCC1',
    'Ic1ccc(N(c2ccccc2)c2ccccc2)cc1',
    'Cc1ccc(NC(=O)OC(C)(C)C)cc1Br',
    'COC(=O)c1ccc(N2CCOCC2)c(Br)c1',
    'CCOC(=O)COc1ccccc1Br',
    'C=CCc1ccc(Br)cc1',
    'O=Cc1c(Br)cccc1N1CCCC1',
    'CCCCCCCCCc1ccc(Br)cc1',
    'Cc1ccc(I)cc1Cc1ccc(-c2ccc(F)cc2)s1',
    'CCOc1c(Br)cc(C=O)cc1OC',
    'CC(C)(C)c1ccc(-c2ccc(C(C)(C)C)cc2Br)cc1',
    'COC(=O)c1cc(Br)cc(OCC(C)C)c1',
    'OC(c1ccc(Br)cc1)c1cccc(F)c1',
    'CC(C)(C)OC(=O)NCCNS(=O)(=O)c1ccc(Br)cc1',
    'FC(F)(F)c1ccc(OCc2ccccc2)c(Br)c1',
    'O=C1c2ccccc2C(=O)c2cc(Br)ccc21',
    'CCCNc1cc(OCCC)c(Br)cc1[N+](=O)[O-]',
    'NC(=O)c1ccc(I)cc1',
    'COc1cc(Br)ccc1CC(=O)O',
  ];

  smiles1 = '';
  smiles2 = '';
  smiles3 = '';
  smiles = '';

  svg1 = '';
  svg2 = '';
  svg3 = '';
  svg = '';

  viewer1: any;
  viewer2: any;
  viewer3: any;
  viewer: any;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
  ) {}

  @ViewChild('3dmol') set $3dmolEl(elRef: ElementRef<HTMLDivElement> | null) {
    if (elRef) {
      if (!this.viewer) {
        this.viewer = $3Dmol.createViewer(elRef.nativeElement);
      }
    } else {
      this.viewer?.stopAnimate();
      this.viewer = null;
    }
  }

  @ViewChild('3dmol1') set $3dmolEl1(elRef: ElementRef<HTMLDivElement> | null) {
    if (elRef) {
      if (!this.viewer1) {
        this.viewer1 = $3Dmol.createViewer(elRef.nativeElement);
      }
    } else {
      this.viewer1?.stopAnimate();
      this.viewer1 = null;
    }
  }

  @ViewChild('3dmol2') set $3dmolEl2(elRef: ElementRef<HTMLDivElement> | null) {
    if (elRef) {
      if (!this.viewer2) {
        this.viewer2 = $3Dmol.createViewer(elRef.nativeElement);
      }
    } else {
      this.viewer2?.stopAnimate();
      this.viewer2 = null;
    }
  }

  @ViewChild('3dmol3') set $3dmolEl3(elRef: ElementRef<HTMLDivElement> | null) {
    if (elRef) {
      if (!this.viewer3) {
        this.viewer3 = $3Dmol.createViewer(elRef.nativeElement);
      }
    } else {
      this.viewer3?.stopAnimate();
      this.viewer3 = null;
    }
  }

  process(svg: string) {
    const parser = new DOMParser();
    const dom = parser.parseFromString(svg, 'application/xml');
    return dom.querySelector('svg')?.outerHTML ?? '';
  }

  update1() {
    const { hostname } = this.envService.getEnvConfig();
    this.viewer1.clear();
    this.svg1 = '';
    if (this.smiles1) {
      this.http
        .post<{ svg: string; mol2: string }>(`${hostname}/test/viz/`, {
          smiles: this.smiles1,
        })
        .subscribe(({ svg, mol2 }) => {
          this.svg1 = this.process(svg);
          if (this.viewer1) {
            this.viewer1.clear();
            this.viewer1.addModel(mol2, 'mol');
            this.viewer1.setStyle({}, { stick: {} });
            this.viewer1.zoomTo();
            this.viewer1.render();
          }
        });
    }
    this.update();
  }

  update2() {
    const { hostname } = this.envService.getEnvConfig();
    this.viewer2.clear();
    this.svg2 = '';
    if (this.smiles2) {
      this.http
        .post<{ svg: string; mol2: string }>(`${hostname}/test/viz/`, {
          smiles: this.smiles2,
        })
        .subscribe(({ svg, mol2 }) => {
          this.svg2 = this.process(svg);
          if (this.viewer2) {
            this.viewer2.clear();
            this.viewer2.addModel(mol2, 'mol');
            this.viewer2.setStyle({}, { stick: {} });
            this.viewer2.zoomTo();
            this.viewer2.render();
          }
        });
    }
    this.update();
  }

  update3() {
    const { hostname } = this.envService.getEnvConfig();
    this.viewer3.clear();
    this.svg3 = '';
    if (this.smiles3) {
      this.http
        .post<{ svg: string; mol2: string }>(`${hostname}/test/viz/`, {
          smiles: this.smiles3,
        })
        .subscribe(({ svg, mol2 }) => {
          this.svg3 = this.process(svg);
          if (this.viewer3) {
            this.viewer3.clear();
            this.viewer3.addModel(mol2, 'mol');
            this.viewer3.setStyle({}, { stick: {} });
            this.viewer3.zoomTo();
            this.viewer3.render();
          }
        });
    }
    this.update();
  }

  update() {
    const { hostname } = this.envService.getEnvConfig();
    this.viewer.clear();
    this.svg = '';
    this.http
      .post<{ smiles: string }>(`${hostname}/test/`, {
        smiles1: this.smiles1,
        smiles2: this.smiles2,
        smiles3: this.smiles3,
      })
      .subscribe((res) => {
        this.smiles = res.smiles;
        if (this.smiles) {
          this.http
            .post<{ svg: string; mol2: string }>(`${hostname}/test/viz/`, {
              smiles: this.smiles,
            })
            .subscribe(({ svg, mol2 }) => {
              this.svg = this.process(svg);
              if (this.viewer) {
                this.viewer.clear();
                this.viewer.addModel(mol2, 'mol');
                this.viewer.setStyle({}, { stick: {} });
                this.viewer.zoomTo();
                this.viewer.render();
              }
            });
        }
      });
  }
}
