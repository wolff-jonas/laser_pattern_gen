import { Layer, Line, Stage } from 'react-konva';
import { JSX } from 'react/jsx-runtime';
import { Slider } from '@mantine/core';
import { useState } from 'react';

export function GCodeVis({ gcode }: { gcode: string }) {
  const lines: JSX.Element[] = [];

  const [zoom, setZoom] = useState(4);
  const height = 800;

  let x = 0;
  let y = height;

  gcode.split('\n').forEach((line, index) => {
    //Ignore everything that isn't G(1|0) X<A> Y<B>
    if (!line.startsWith('G') || !line.includes('X') || !line.includes('Y')) {
      return;
    }
    const type = line[1]; // extract 1/2 from G1/G2
    const matches = line.match(/X(?<X>.*?) Y(?<Y>.*?) /)?.groups;
    // Unknown format -> ignore
    if (!matches) {
      return;
    }
    const xVal = Number.parseFloat(matches.X) * zoom;
    const yVal = height - Number.parseFloat(matches.Y) * zoom;

    lines.push(<Line key={index} x={0} y={0} points={[x, y, xVal, yVal]} stroke={type === '1' ? 'red' : 'green'} strokeWidth={2} />);
    x = xVal;
    y = yVal;
  });

  return (
    <>
      <Slider min={0.5} max={5} step={0.1} value={zoom} onChange={setZoom} />
      <Stage width={800} height={height}>
        <Layer>{lines}</Layer>
      </Stage>
    </>
  );
}
