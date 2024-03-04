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

export function getPossibleOutcomes(blockList: Block[], blockSet: BlockSet) {
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

export function getAllOutcomes(blockList: Block[], blockSet: BlockSet) {
  const currentBlockIds = blockListToBlockIds(blockList, blockSet);
  return (
    Object.values(blockSet.table)
      // only include complete molecules
      .filter((entry) => !keyToBlockIds(entry.key).includes(0))
      .map((entry) => ({
        entry,
        isReachable: contains(keyToBlockIds(entry.key), currentBlockIds),
      }))
  );
}

export function getProperties(blockList: Block[], blockSet: BlockSet) {
  const blockIds = blockListToBlockIds(blockList, blockSet);
  const lookupKey = blockIds.join(':');
  return blockSet.table[lookupKey]!;
}

export function lookupProperty(
  blockList: Block[],
  blockSet: BlockSet,
  property: ChemicalPropertyDefinition,
) {
  const entry = getProperties(blockList, blockSet);
  return entry[property.key]!;
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
  const validOutcomes = getPossibleOutcomes(startingFrom, blockSet).filter(
    (entry) =>
      filter.accept(filter.select.map((def) => Number(entry[def.key]))),
  );
  const res = new Set<Block>();
  validOutcomes.forEach(({ key }) => {
    keyToBlockIds(key).forEach((id, index) => {
      if (!usedIndices.includes(index)) {
        const block = blockSet.blocks[index]![id - 1]!;
        if (block) res.add(block);
      }
    });
  });
  return [...res].sort((a, b) =>
    a.index === b.index ? a.id - b.id : a.index - b.index,
  );
}
