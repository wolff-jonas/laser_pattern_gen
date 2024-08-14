export class PathParameters {
  label: string;
  feedrate: number;
  laserpower: number;
  passes: number;

  /**
   *
   * @param label
   * @param feedrate
   * @param laserpower
   * @param passes
   */
  constructor(label: string, feedrate: number, laserpower: number, passes: number) {
    this.label = label;
    this.feedrate = feedrate;
    this.laserpower = laserpower;
    this.passes = passes;
  }
}
