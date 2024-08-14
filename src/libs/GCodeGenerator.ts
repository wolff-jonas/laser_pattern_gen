import { Pattern } from '@/libs/model/Pattern';
import { Line } from '@/libs/model/Line';
import { Path } from '@/libs/model/Path';

export class GCodeGenerator {
  static fromPatterns(patterns: Pattern[]): string {
    const patternsGCode = patterns.map((p) => this.fromPattern(p)).reduce((previousValue, currentValue) => previousValue + currentValue);

    return `${GCodeGenerator.getPre()}\n${patternsGCode}\n${GCodeGenerator.getPost()}`;
  }

  static getPre() {
    return 'G21         ; Set units to mm\nG90         ; Absolute positioning\nG0 F10000  ; Rapid feedrate\n';
  }

  static getPost() {
    return 'M5          ; Switch tool offEnd';
  }

  static fromPattern(pattern: Pattern) {
    const pathsGCode = pattern.paths.map((path) => this.fromPath(path, pattern.start_x, pattern.start_y)).reduce((previousValue, currentValue) => previousValue + currentValue);

    return `\n; Starting Pattern "${pattern.label}"\n${pathsGCode}\n`;
  }

  static fromPath(path: Path, pattern_x: number, pattern_y: number): string {
    const abs_x = pattern_x + path.start_x;
    const abs_y = pattern_y + path.start_y;

    // todo write out label above path

    const linesGCode = path.lines
      .map((line, index) => this.fromLine(line, abs_x, abs_y, path.parameters.laserpower, path.lines[index - 1]))
      .reduce((previousValue, currentValue) => previousValue + currentValue);

    const header = `\n; Path "${path.parameters.label}" - Passes: ${path.parameters.passes} - Feedrate: ${path.parameters.feedrate}`;

    let gcode = '';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < path.parameters.passes; i++) {
      gcode += `; Pass #${i + 1}\n${linesGCode}\n`;
    }

    return `${header}\nG1 F${path.parameters.feedrate}\n${gcode}\n`;
  }

  static fromLine(line: Line, path_x: number, path_y: number, laserpower: number, prevLine: Line | undefined) {
    const abs_start_x = path_x + line.start_x;
    const abs_start_y = path_y + line.start_y;
    const abs_end_x = path_x + line.end_x;
    const abs_end_y = path_y + line.end_y;

    // if previous line ends at the same position, no need to move to the start
    if (prevLine !== undefined && prevLine.end_x === line.start_x && prevLine.end_y === line.start_y) {
      return `G1 X${abs_end_x} Y${abs_end_y} S${laserpower}\n`;
    }
    return `G0 X${abs_start_x} Y${abs_start_y} S0\nG1 X${abs_end_x} Y${abs_end_y} S${laserpower}\n`;
  }
}
