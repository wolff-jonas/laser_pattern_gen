import { Pattern } from '@/libs/model/Pattern';
import { PathGenerator } from '@/libs/PathGenerator';
import { PathParameters } from '@/libs/model/PathParameters';
import { FontRenderer } from '@/libs/FontRenderer';

export enum Variable {
  feedrate,
  power,
  passes,
}

export class XvsYPatternGenerator {
  static generatePattern(
    typeX: string,
    minX: number,
    maxX: number,
    stepSizeX: number,
    typeY: string,
    minY: number,
    maxY: number,
    stepSizeY: number,
    size: number,
    freeVariableValue: number,
    filled: boolean,
    labelFeedrate: number
  ): Pattern {
    const paths = [];

    // distance between squares, in mm
    const margins = 3;

    const fontSizeX = this.getFontSizeForSize(this.formatVariable(maxX, typeX), size);
    const fontSizeY = this.getFontSizeForSize(this.formatVariable(maxY, typeY), size);

    const xValues = [];
    let xVal = minX;
    while (xVal <= maxX) {
      xValues.push(xVal);
      xVal += stepSizeX;
    }
    const yValues = [];
    let yVal = minY;
    while (yVal <= maxY) {
      yValues.push(yVal);
      yVal += stepSizeY;
    }

    for (let x = 0; x <= xValues.length; x++) {
      const valX = xValues[x - 1]; // because first column is for labels
      for (let y = 0; y <= yValues.length; y++) {
        const valY = yValues[y - 1]; // first row is for labels
        if (x === 0 && y !== 0) {
          // first column is for labels
          paths.push(PathGenerator.text(x * (size + margins), y * (size + margins) + margins, this.formatVariable(valY, typeY), fontSizeY, new PathParameters(`ValY: ${valY}`, labelFeedrate, 1, 1)));
        } else if (y === 0 && x !== 0) {
          // first row is for labels
          paths.push(PathGenerator.text(x * (size + margins), y * (size + margins) + margins, this.formatVariable(valX, typeX), fontSizeX, new PathParameters(`ValX: ${valX}`, labelFeedrate, 1, 1)));
        } else if (y !== 0 && x !== 0) {
          const feedrate = this.getVariableValue(Variable.feedrate, valX, valY, freeVariableValue, typeX, typeY);
          const power = this.getVariableValue(Variable.power, valX, valY, freeVariableValue, typeX, typeY);
          const passes = this.getVariableValue(Variable.passes, valX, valY, freeVariableValue, typeX, typeY);

          if (filled) {
            paths.push(PathGenerator.filledSquare(x * (size + margins), y * (size + margins), size, 0.2, new PathParameters(`P${power} | F${feedrate} | P${passes}`, feedrate, power, passes)));
          } else {
            paths.push(PathGenerator.squareOutline(x * (size + margins), y * (size + margins), size, new PathParameters(`P${power} | F${feedrate} | P${passes}`, feedrate, power, passes)));
          }
        }
      }
    }
    return new Pattern('Variables', 0, 0, paths);
  }

  static formatVariable(val: number, variable: string): string {
    switch (variable) {
      case Variable.feedrate.toString():
        if (val < 1000) {
          return val.toFixed(0);
        }
        if (val > 1000 && Math.floor(val / 100) * 100 === val) {
          // 5k, 1.8k
          return `${(val / 1000).toFixed(1)}k`;
        }
        return val.toFixed(0);
      case Variable.power.toString():
        return `${(val * 100).toFixed(0)}%`;
      case Variable.passes.toString():
        return val.toFixed(0);
    }
    return 'XXX';
  }

  static getFontSizeForSize(text: string, size: number): number {
    const minFont = 4;
    const maxFont = 80;

    return this.getFSizeForSizeRec(text, size, maxFont, minFont);
  }

  /**
   * Does binary search for correct font size
   * @param text
   * @param size
   * @param max
   * @param min
   */
  static getFSizeForSizeRec(text: string, size: number, max: number, min: number): number {
    if (max === min) {
      return max;
    }

    const fSize = min + (max - min) / 2;
    const bbLongest = FontRenderer.getBBLongest(text, fSize);

    const ratio = bbLongest / size;
    if (ratio > 0.8 && ratio < 1.2) {
      return fSize;
    }
    if (ratio > 1.2) {
      return this.getFSizeForSizeRec(text, size, fSize, min);
    }
    return this.getFSizeForSizeRec(text, size, max, fSize);
  }

  static getVariableValue(type: Variable, valX: number, valY: number, freeVariableValue: number, typeX: Variable, typeY: Variable): number {
    return typeX === type ? valX : typeY === type ? valY : freeVariableValue;
  }
}
