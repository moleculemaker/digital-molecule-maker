import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { Block, BlockType, Molecule, aggregateProperty } from '../models';
import { combineLatest } from 'rxjs';
import { HSLColorOptions, lambdaMaxToColor } from '../utils/colors';

type BlockPoint = {
  blockList: Block[];
  x: number;
  y: number;
  focused: boolean;
};

type Bounds = [number, number, number, number];

function x(blockList: Block[]) {
  return blockList.reduce(
    (lambda, block) => lambda + block.properties.lambdaMaxShift,
    0,
  );
}

function y(blockList: Block[]) {
  return blockList.reduce(
    (weight, block) => weight + block.properties.molecularWeight,
    0,
  );
}

@Component({
  selector: 'dmm-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
})
export class ScatterplotComponent implements OnInit {
  bounds: Bounds = [0, 0, 0, 0];
  allPoints: BlockPoint[] = [];

  constructor(private workspace: WorkspaceService) {
    combineLatest([workspace.blockSet$]).subscribe(([blockSet]) => {
      if (!blockSet) return;
      this.allPoints = [];

      const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
        if (!remainingTypes.length) {
          this.allPoints.push({
            blockList: curBlocks,
            x: x(curBlocks),
            y: y(curBlocks),
            focused: false,
          });
          return;
        }
        const [nextType, ...nextRemainingTypes] = remainingTypes;
        for (const nextBlock of blockSet.blocks[nextType]) {
          enumerate([...curBlocks, nextBlock], nextRemainingTypes);
        }
      };

      enumerate([], Object.values(BlockType));

      this.bounds = this.allPoints.reduce(
        ([minX, maxX, minY, maxY], bp) => [
          Math.min(minX, bp.x),
          Math.max(maxX, bp.x),
          Math.min(minY, bp.y),
          Math.max(maxY, bp.y),
        ],
        [Infinity, -Infinity, Infinity, -Infinity],
      );
    });

    combineLatest([
      workspace.blockSet$,
      workspace.moleculeList$,
      workspace.filters$,
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
              bp.blockList.some((b) => usedBlock.id === b.id),
            )) &&
          filters.every((filter) => filter(bp.blockList));
      });
      // console.log(this.allPoints);
    });
  }

  lambdaMaxToColor(lambda: number, options: HSLColorOptions = {}) {
    return lambdaMaxToColor(lambda, options);
  }

  ngOnInit(): void {}
}
