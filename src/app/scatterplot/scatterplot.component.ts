import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {WorkspaceService} from '../services/workspace.service';
import {BlockPoint, Bounds} from '../models';
import {combineLatest} from 'rxjs';
import {HSLColorOptions, lambdaMaxToColor} from '../utils/colors';
import {enumerateAll, getBounds} from "../utils/dft";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dmm-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
})
export class ScatterplotComponent implements OnInit {
  bounds: Bounds = [0, 0, 0, 0];
  allPoints: BlockPoint[] = [];

  constructor(private workspace: WorkspaceService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    combineLatest([this.workspace.blockSet$]).subscribe(([blockSet]) => {
      if (!blockSet) return;
      this.allPoints = enumerateAll();
      this.bounds = getBounds(this.allPoints)
      this.cd.detectChanges();
    });

    combineLatest([
      this.workspace.blockSet$,
      this.workspace.moleculeList$,
      this.workspace.filters$,
    ]).subscribe(([blockSet, molecules, filters]) => {
      // if (!blockSet) return;

      // const currentMolecule = molecules[0];
      // const initialBlocks = currentMolecule?.blockList ?? [];

      // const excludedTypes = new Set(
      //   currentMolecule?.blockList.map((block) => block.type) ?? [],
      // );

      // const availableTypes = Object.values(BlockType).filter(
      //   (t) => !excludedTypes.has(t),
      // );

      // const targetCombinations: Block[][] = [];

      // const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
      //   if (!remainingTypes.length) {
      //     if (filters.every((filter) => filter(curBlocks))) {
      //       targetCombinations.push([...curBlocks]);
      //     }
      //     return;
      //   }
      //   const [nextType, ...nextRemainingTypes] = remainingTypes;
      //   for (const nextBlock of blockSet.blocks[nextType]) {
      //     enumerate([...curBlocks, nextBlock], nextRemainingTypes);
      //   }
      // };

      // enumerate(initialBlocks, availableTypes);

      // this.targetPoints = targetCombinations.map((blocks) => ({
      //   x: xCoord(blocks),
      //   y: yCoord(blocks),
      // }));
      this.allPoints.forEach((bp) => {
        bp.focused =
          (molecules.length === 0 ||
            molecules[0].blockList.every((usedBlock) =>
              bp.blockList.some((b) => usedBlock.type === b.type && usedBlock.id === b.id),
            )) &&
          filters.every((filter) => filter(bp.blockList));
      });
      this.cd.detectChanges();
      // console.log(this.allPoints);
    });
  }

  lambdaMaxToColor(lambda: number, options: HSLColorOptions = {}) {
    return lambdaMaxToColor(lambda, options);
  }

}
