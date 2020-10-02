export interface Position {
  line: number;
  column: number;
}

export const makePosition = (line: string | number, column: string | number): Position =>
  ({ line: +line, column: +column });

export interface Selection {
  start?: Position;
  end?: Position;
}

export interface CommonEditorProps {
  code: string;
  execute: () => any;
  onEditCode: (_: string) => any;
  position: Position;
  selection: Selection;
}
