import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { Block, BlockType, Molecule, aggregateProperty } from '../models';
import { combineLatest } from 'rxjs';

type Point = { x: number; y: number };
type Bounds = [number, number, number, number];

const xCoord = (blockList: Block[]) => {
  return blockList.reduce(
    (lambda, block) => lambda + block.properties.lambdaMaxShift,
    0,
  );
};

const yCoord = (blockList: Block[]) => {
  return blockList.reduce(
    (weight, block) => weight + block.properties.molecularWeight,
    0,
  );
};

@Component({
  selector: 'dmm-scatterplot',
  templateUrl: './scatterplot.component.html',
  styleUrls: ['./scatterplot.component.scss'],
})
export class ScatterplotComponent implements OnInit {
  bounds: Bounds = [0, 0, 0, 0];
  allPoints: Point[] = [];
  targetPoints: Point[] = [];

  constructor(private workspace: WorkspaceService) {
    combineLatest([workspace.blockSet$]).subscribe(([blockSet]) => {
      if (!blockSet) return;
      const allCombinations: Block[][] = [];

      const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
        if (!remainingTypes.length) {
          allCombinations.push([...curBlocks]);
          return;
        }
        const [nextType, ...nextRemainingTypes] = remainingTypes;
        for (const nextBlock of blockSet.blocks[nextType]) {
          enumerate([...curBlocks, nextBlock], nextRemainingTypes);
        }
      };

      enumerate([], Object.values(BlockType));

      this.bounds = allCombinations.reduce(
        ([minX, maxX, minY, maxY], blocks) => [
          Math.min(minX, xCoord(blocks)),
          Math.max(maxX, xCoord(blocks)),
          Math.min(minY, yCoord(blocks)),
          Math.max(maxY, yCoord(blocks)),
        ],
        [Infinity, -Infinity, Infinity, -Infinity],
      );

      this.allPoints = allCombinations.map((blocks) => ({
        x: xCoord(blocks),
        y: yCoord(blocks),
      }));
    });

    combineLatest([
      workspace.blockSet$,
      workspace.moleculeList$,
      workspace.filters$,
    ]).subscribe(([blockSet, molecules, filters]) => {
      if (!blockSet) return;

      const currentMolecule = molecules[0];
      const initialBlocks = currentMolecule?.blockList ?? [];

      const excludedTypes = new Set(
        currentMolecule?.blockList.map((block) => block.type) ?? [],
      );

      const availableTypes = Object.values(BlockType).filter(
        (t) => !excludedTypes.has(t),
      );

      const targetCombinations: Block[][] = [];

      const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
        if (!remainingTypes.length) {
          if (filters.every((filter) => filter(curBlocks))) {
            targetCombinations.push([...curBlocks]);
          }
          return;
        }
        const [nextType, ...nextRemainingTypes] = remainingTypes;
        for (const nextBlock of blockSet.blocks[nextType]) {
          enumerate([...curBlocks, nextBlock], nextRemainingTypes);
        }
      };

      enumerate(initialBlocks, availableTypes);

      this.targetPoints = targetCombinations.map((blocks) => ({
        x: xCoord(blocks),
        y: yCoord(blocks),
      }));
    });
  }

  ngOnInit(): void {}
}
