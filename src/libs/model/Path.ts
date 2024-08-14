import { Line } from '@/libs/model/Line';
import { PathParameters } from '@/libs/model/PathParameters';

export class Path {
  // Top Left corner
  // relative to parent Pattern object
  start_x: number;
  start_y: number;
  parameters: PathParameters;
  lines: Line[];

  constructor(start_x: number, start_y: number, label: string, feedrate: number, laserpower: number, passes: number, lines: Line[]) {
    this.start_x = start_x;
    this.start_y = start_y;
    this.parameters = new PathParameters(label, feedrate, laserpower, passes);
    this.lines = lines;
  }
}
