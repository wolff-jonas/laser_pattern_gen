import { Path } from '@/libs/model/Path';

export class Pattern {
  label: string;
  // absolute position
  start_x: number;
  start_y: number;
  paths: Path[];

  constructor(label: string, start_x: number, start_y: number, paths: Path[]) {
    this.label = label;
    this.start_x = start_x;
    this.start_y = start_y;
    this.paths = paths;
  }
}
