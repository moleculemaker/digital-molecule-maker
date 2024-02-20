import { Block } from 'app/models';

export function getChemicalFormula(blockList: (Block | null)[]) {
  let returnVal = '';
  const concatenatedFormula = blockList
    .filter((x): x is Block => !!x)
    .map((block) => block.properties['chemicalFormula'])
    .join('');
  if (concatenatedFormula.length > 0) {
    const atomCounts = new Map<string, number>();
    const processSubstring = (substring: string) => {
      const match = substring.match(/([A-Za-z]+)(\d*)/);
      if (match) {
        const atom = match[1]!;
        const count = parseInt(match[2] || '1', 10);
        if (atomCounts.has(atom)) {
          atomCounts.set(atom, atomCounts.get(atom)! + count);
        } else {
          atomCounts.set(atom, count);
        }
      }
    };
    let seen = concatenatedFormula.charAt(0);
    for (let index = 1; index < concatenatedFormula.length; index++) {
      let next = concatenatedFormula.charAt(index);
      // if it's an upper-case letter, process seen and start anew
      if (/[A-Z]/.test(next)) {
        processSubstring(seen);
        seen = next;
      } else {
        seen += next;
      }
    }
    processSubstring(seen);
    const appendOneAtom = (atom: string) => {
      if (atomCounts.has(atom)) {
        const count = atomCounts.get(atom)!;
        returnVal += atom;
        if (count > 1) {
          returnVal += count;
        }
      }
    };
    ['C', 'H', 'F', 'N', 'O', 'S'].forEach((atom) => {
      appendOneAtom(atom);
      atomCounts.delete(atom);
    });
    // if there's anything left, add it to the end
    atomCounts.forEach((count, atom) => {
      appendOneAtom(atom);
    });
  }
  return returnVal;
}

export function getSMILES(blockList: (Block | null)[]) {
  return blockList
    .filter((x): x is Block => !!x)
    .map((block) => block.properties['smiles'])
    .join('-');
}
