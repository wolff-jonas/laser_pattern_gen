export class Line {
  /**
   * All positions are relative to the parent Path object
   */
  start_x: number;
  start_y: number;
  end_x: number;
  end_y: number;

  constructor(start_x: number, start_y: number, end_x: number, end_y: number) {
    this.start_x = start_x;
    this.end_x = end_x;
    this.start_y = start_y;
    this.end_y = end_y;
  }
}
