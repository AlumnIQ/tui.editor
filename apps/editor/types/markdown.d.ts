// @TODO: change toastMark type definition to @toast-ui/toastmark type file through importing
/* ToastMark node type */
type BlockNodeType =
  | 'document'
  | 'list'
  | 'blockQuote'
  | 'item'
  | 'heading'
  | 'thematicBreak'
  | 'paragraph'
  | 'codeBlock'
  | 'htmlBlock'
  | 'table'
  | 'tableHead'
  | 'tableBody'
  | 'tableRow'
  | 'tableCell'
  | 'tableDelimRow'
  | 'tableDelimCell'
  | 'refDef';

type InlineNodeType =
  | 'code'
  | 'text'
  | 'emph'
  | 'strong'
  | 'strike'
  | 'link'
  | 'image'
  | 'htmlInline'
  | 'linebreak'
  | 'softbreak';

interface NodeWalker {
  current: MdNode | null;
  root: MdNode;
  entering: boolean;

  next(): { entering: boolean; node: MdNode } | null;
  resumeAt(node: MdNode, entering: boolean): void;
}

export type MdNodeType = BlockNodeType | InlineNodeType;

export type MdPos = [number, number];
export type MdSourcepos = [MdPos, MdPos];

export interface MdNode {
  type: MdNodeType;
  id: number;
  parent: MdNode | null;
  prev: MdNode | null;
  next: MdNode | null;
  sourcepos?: MdSourcepos;
  firstChild: MdNode | null;
  lastChild: MdNode | null;
  literal: string | null;

  isContainer(): boolean;
  unlink(): void;
  replaceWith(node: MdNode): void;
  insertAfter(node: MdNode): void;
  insertBefore(node: MdNode): void;
  appendChild(child: MdNode): void;
  prependChild(child: MdNode): void;
  walker(): NodeWalker;
}

export interface CodeBlockMdNode extends MdNode {
  fenceOffset: number;
  fenceLength: number;
  fenceChar: string;
  info: string;
  infoPadding: number;
}

export interface ListItemMdNode extends MdNode {
  listData: {
    padding: number;
    task: boolean;
    checked: boolean;
    type: 'bullet' | 'ordered';
    start: number;
  };
}

export interface HeadingMdNode extends MdNode {
  level: number;
  headingType: 'atx' | 'setext';
}

export interface ImageMdNode extends MdNode {
  lastChild: MdNode;
}

export interface LinkMdNode extends MdNode {
  lastChild: MdNode;
  extendedAutolink: boolean;
}

export interface CodeMdNode extends MdNode {
  tickCount: number;
}

export interface TableColumn {
  align: 'left' | 'center' | 'right';
}

export interface TableCellNode extends MdNode {
  startIdx: number;
  endIdx: number;
  paddingLeft: number;
  paddingRight: number;
  ignored: boolean;
}

export interface TableMdNode extends MdNode {
  columns: TableColumn[];
}

/* ToastMark Parser type */
export type CustomParser = (node: MdNode, context: { entering: boolean }) => void;
export type CustomParserMap = Partial<Record<MdNodeType, CustomParser>>;

export type RemovedNodeRange = {
  id: [number, number];
  line: [number, number];
};

export interface EditResult {
  nodes: MdNode[];
  removedNodeRange: RemovedNodeRange | null;
}

/* ToastMark Renderer type */
export interface TagToken {
  tagName: string;
  outerNewLine?: boolean;
  innerNewLine?: boolean;
}

export interface OpenTagToken extends TagToken {
  type: 'openTag';
  classNames?: string[];
  attributes?: Record<string, string>;
  selfClose?: boolean;
}

export interface CloseTagToken extends TagToken {
  type: 'closeTag';
}

export interface TextToken {
  type: 'text';
  content: string;
}

export interface RawHTMLToken {
  type: 'html';
  content: string;
  outerNewLine?: boolean;
}

export type HTMLToken = OpenTagToken | CloseTagToken | TextToken | RawHTMLToken;

export type CustomHTMLRenderer = (node: MdNode, context: Context) => HTMLToken | HTMLToken[] | null;

export type CustomHTMLRendererMap = Partial<Record<MdNodeType, CustomHTMLRenderer>>;

export interface ContextOptions {
  gfm: boolean;
  softbreak: string;
  nodeId: boolean;
  tagFilter: boolean;
  convertors?: CustomHTMLRendererMap;
  customProp: Record<string, any>;
}

export interface Context {
  entering: boolean;
  leaf: boolean;
  options: Omit<ContextOptions, 'gfm' | 'convertors'>;
  getChildrenText: (node: MdNode) => string;
  skipChildren: () => void;
  origin: () => ReturnType<CustomHTMLRenderer>;
}