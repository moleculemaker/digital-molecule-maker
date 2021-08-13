export enum BlockType {
    Start = 'start',
    Middle = 'middle',
    End = 'end'
}

export interface Block {
    type: BlockType;
    label: string;
    svgUrl: string;
    width: number;
    height: number;
}

export interface BlockSet {
    [BlockType.Start]: Block[];
    [BlockType.Middle]: Block[];
    [BlockType.End]: Block[];
}