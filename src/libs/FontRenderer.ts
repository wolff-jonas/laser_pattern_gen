import { Font, load, Path } from 'opentype.js';

export class FontRenderer {
  static font: Font | null = null;

  static init(callback: () => void) {
    if (this.font === null) {
      load('/src/straight_font.ttf', (err: any, font: Font | undefined) => {
        if (err || font === undefined) {
          console.log(err);
          // alert('Font could not be loaded: ' + err);
        } else {
          this.font = font;
          callback();
        }
      });
    }
  }

  static convert2GCode(text: string, yAxis: boolean, fontSize: number, xOffset: number, yOffset: number, feedrate: number): string {
    const power = 1.0;

    const path = this.font!.getPath(text, 0, 0, fontSize);
    const bb = this.getSize(text, fontSize);

    let gcode = `; Writing "${text}"\nG1 F${feedrate}\n`;
    path.commands.forEach((command) => {
      if (command.type === 'Z') {
        return;
      }

      const x = (yAxis ? command.y + bb.h : command.x) + xOffset;
      // y-axis is flipped
      const y = (yAxis ? command.x : -command.y) + yOffset;

      if (command.type === 'M') {
        gcode += `G0 X${x.toFixed(2)} Y${y.toFixed(2)} S0\n`;
      } else if (command.type === 'L') {
        gcode += `G1 X${x.toFixed(2)} Y${y.toFixed(2)} S${power.toFixed(2)}\n`;
      } else {
        console.log(`unknown command: ${command}`);
      }
    });

    gcode += ';Turn laser off\nG0 S0\nG1 S0\n\n';

    return gcode;
  }

  static getSize(text: string, fontSize: number): { w: number; h: number } {
    const boundingBox = this.font!.getPath(text, 0, 0, fontSize).getBoundingBox();
    const h = Math.abs(boundingBox.y2 - boundingBox.y1);
    const w = Math.abs(boundingBox.x2 - boundingBox.x1);
    return { h, w };
  }

  static getBBLongest(text: string, fontSize: number): number {
    const { h, w } = this.getSize(text, fontSize);
    return h > w ? h : w;
  }

  static getPath(text: string, fontSize: number): Path {
    return this.font!.getPath(text, 0, 0, fontSize);
  }
}
