import {
  Block,
  BlockSet,
  ChemicalPropertyDefinition,
  LookupTableEntry,
} from './models';

export function keyToBlockIds(key: string) {
  return key.split(':').map((id) => Number(id));
}

export function blockListToBlockIds(blockList: Block[], blockSet: BlockSet) {
  const res: number[] = Array(blockSet.moleculeSize).fill(0);
  for (let block of blockList) {
    res[block.index] = block.id;
  }
  return res;
}

export function contains(blockIdsA: number[], blockIdsB: number[]) {
  if (blockIdsA.length !== blockIdsB.length) return false;
  for (let i = 0; i < blockIdsA.length; ++i) {
    if (blockIdsB[i] && blockIdsA[i] !== blockIdsB[i]) return false;
  }
  return true;
}

export function getAllOutcomes(blockList: Block[], blockSet: BlockSet) {
  const currentBlockIds = blockListToBlockIds(blockList, blockSet);
  const res: LookupTableEntry[] = [];
  for (let entry of Object.values(blockSet.table)) {
    const blockIds = keyToBlockIds(entry.key);
    if (contains(blockIds, currentBlockIds) && !blockIds.includes(0)) {
      res.push(entry);
    }
  }
  return res;
}

export function getProperties(blockList: Block[], blockSet: BlockSet) {
  const blockIds = blockListToBlockIds(blockList, blockSet);
  const lookupKey = blockIds.join(':');
  return blockSet.table[lookupKey];
}

export function lookupProperty(
  blockList: Block[],
  blockSet: BlockSet,
  property: ChemicalPropertyDefinition,
) {
  const entry = getProperties(blockList, blockSet);
  return entry[property.key];
}

export type FilterDefinition = {
  select: ChemicalPropertyDefinition[];
  accept: (selectedValues: number[]) => boolean;
};

export function applyTargetFilter(
  filter: FilterDefinition,
  startingFrom: Block[],
  blockSet: BlockSet,
): Block[] {
  const usedIndices = startingFrom.map((block) => block.index);
  const validOutcomes = getAllOutcomes(startingFrom, blockSet).filter((entry) =>
    filter.accept(filter.select.map((def) => Number(entry[def.key]))),
  );
  const res = new Set<Block>();
  validOutcomes.forEach(({ key }) => {
    keyToBlockIds(key).forEach((id, index) => {
      if (!usedIndices.includes(index)) {
        res.add(blockSet.blocks[index][id - 1]);
      }
    });
  });
  return [...res];
}
