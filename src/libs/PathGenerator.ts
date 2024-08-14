import { Path } from '@/libs/model/Path';
import { Line } from '@/libs/model/Line';
import { PathParameters } from '@/libs/model/PathParameters';
import { FontRenderer } from '@/libs/FontRenderer';

export class PathGenerator {
  /**
   *
   * @param x relative to pattern
   * @param y relative to pattern
   * @param size in mm
   * @param pathParams
   */
  static squareOutline(x: number, y: number, size: number, pathParams: PathParameters): Path {
    const lines = [];
    lines.push(new Line(0, 0, size, 0));
    lines.push(new Line(size, 0, size, size));
    lines.push(new Line(size, size, 0, size));
    lines.push(new Line(0, size, 0, 0));

    return new Path(x, y, pathParams.label, pathParams.feedrate, pathParams.laserpower, pathParams.passes, lines);
  }

  /**
   *
   * @param x relative to pattern
   * @param y relative to pattern
   * @param size in mm
   * @param stepOver distance between individial lines
   * @param pathParams
   */
  static filledSquare(x: number, y: number, size: number, stepOver: number, pathParams: PathParameters): Path {
    const numLines = size / stepOver;
    const lines = [];
    let currentX = 0;

    for (let i = 0; i < numLines; i++) {
      // move back and forth on alternating lines
      if (i % 2 == 0) {
        lines.push(new Line(currentX, 0, currentX, size));
      } else {
        lines.push(new Line(currentX, size, currentX, 0));
      }
      currentX += stepOver;
    }

    return new Path(x, y, pathParams.label, pathParams.feedrate, pathParams.laserpower, pathParams.passes, lines);
  }

  static text(x: number, y: number, text: string, fontSize: number, pathParams: PathParameters): Path {
    const textPath = FontRenderer.getPath(text, fontSize);
    const lines: Line[] = [];
    let currentPos = { x: 0, y: 0 };

    textPath.commands.forEach((command) => {
      if (command.type === 'Z') {
        return;
      }

      if (command.type === 'M') {
        currentPos = { x: command.x, y: -command.y };
      } else if (command.type === 'L') {
        lines.push(new Line(currentPos.x, currentPos.y, command.x, -command.y));
        currentPos = { x: command.x, y: -command.y };
      } else {
        console.log(`unknown command: ${command}`);
      }
    });

    return new Path(x, y, pathParams.label, pathParams.feedrate, pathParams.laserpower, pathParams.passes, lines);
  }
}
