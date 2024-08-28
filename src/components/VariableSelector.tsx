import { Checkbox, Fieldset, Grid, GridCol, Group, NativeSelect, NumberInput, Stack, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { ComboboxItem } from '@mantine/core/lib/components/Combobox/Combobox.types';
import { Variable, XvsYPatternGenerator } from '@/libs/XvsYPatternGenerator';
import { GCodeBox } from '@/components/GCodeBox';
import { useEffect, useState } from 'react';
import { Pattern } from '@/libs/model/Pattern';
import { FontRenderer } from '@/libs/FontRenderer';
import { GCodeGenerator } from '@/libs/GCodeGenerator';

export function VariableSelector() {
  const [typeX, setTypeX] = useInputState<string>(Variable.feedrate.toString());
  const [minX, setMinX] = useInputState<number | string>(1000);
  const [maxX, setMaxX] = useInputState<number | string>(10000);
  const [stepSizeX, setStepSizeX] = useInputState<number | string>(1000);

  const [typeY, setTypeY] = useInputState<string>(Variable.power.toString());
  const [minY, setMinY] = useInputState<number | string>(0.2);
  const [maxY, setMaxY] = useInputState<number | string>(1);
  const [stepSizeY, setStepSizeY] = useInputState<number | string>(0.1);

  const [freeVariable, setFreeVariable] = useInputState<number | string>(1);
  const [size, setSize] = useInputState<number | string>(10);
  const [filled, setFilled] = useInputState(false);

  const [label, setLabel] = useInputState('');
  const [labelFeedrate, setLabelFeedrate] = useInputState<number | string>(5000);

  const variableProp: ComboboxItem[] = [
    { label: 'Feedrate', value: Variable.feedrate.toString() },
    { label: 'Power', value: Variable.power.toString() },
    { label: 'Passes', value: Variable.passes.toString() },
  ];

  const [fontLoaded, setFontLoaded] = useState(false);

  const xLabel = variableProp
    .filter((val) => val.value === typeX.toString())
    .map((v) => v.label)
    .at(0);

  const yLabel = variableProp
    .filter((val) => val.value === typeY.toString())
    .map((v) => v.label)
    .at(0);

  const freevariableLabel = variableProp
    .filter((val) => val.value !== typeX.toString() && val.value !== typeY.toString())
    .map((v) => v.label)
    .at(0);

  let niceLabel = label;
  // Make sure we have a nice label
  if (label === '') {
    niceLabel = xLabel + ' vs ' + yLabel;
  }

  const [gcodeResult, setGcodeResult] = useState<string>('');

  useEffect(() => {
    if (!fontLoaded) {
      setGcodeResult('Font not loaded');
      return;
    }

    // sanity checks
    // max should be > min
    if (maxX < minX || maxY < minY) {
      setGcodeResult('MAX < MIN');
      return;
    }

    // step size should not be zero
    if (stepSizeX === 0 || stepSizeY === 0) {
      setGcodeResult('Stepsize === 0');
      return;
    }

    // don't do to many steps
    const stepCountX = ((maxX as number) - (minX as number)) / (stepSizeX as number);
    const stepCountY = ((maxY as number) - (minY as number)) / (stepSizeY as number);

    if (stepCountX > 30 || stepCountY > 30) {
      setGcodeResult('Stepsize too small, too many steps');
      return;
    }

    let pattern: Pattern;
    pattern = XvsYPatternGenerator.generatePattern(
      typeX,
      minX as number,
      maxX as number,
      stepSizeX as number,
      typeY,
      minY as number,
      maxY as number,
      stepSizeY as number,
      size as number,
      freeVariable as number,
      filled,
      labelFeedrate as number
    );

    const labelFontSize = 8;

    const xLabelText = `${xLabel!} - ${label}`;

    // use h because y label will be flipped 90deg
    const yLabelWidth = FontRenderer.getSize(yLabel!, labelFontSize).h;
    const xLabelHeight = FontRenderer.getSize(xLabelText, labelFontSize).h;

    // set pattern start to not interfere with labels
    pattern.start_x = yLabelWidth + 2;
    pattern.start_y = xLabelHeight + 2;

    const xAxisLabel = FontRenderer.convert2GCode(xLabelText, false, labelFontSize, yLabelWidth + 2, 0, labelFeedrate as number);
    const yAxisLabel = FontRenderer.convert2GCode(yLabel!, true, labelFontSize, 0, xLabelHeight + 2, labelFeedrate as number);
    const patternGCode = GCodeGenerator.fromPatterns([pattern]);

    const header =
      `; ${label}\n` +
      `; - X-Axis -  Variable: ${xLabel} Min: ${minX} Max: ${maxX} Stepsize: ${stepSizeX}\n` +
      `; - Y-Axis -  Variable: ${yLabel} Min: ${minY} Max: ${maxY} Stepsize: ${stepSizeY}\n` +
      `; - ${freevariableLabel} - Value: ${freeVariable}\n\n`;

    var completeGCode = `${header + xAxisLabel}\n${yAxisLabel}\n\n\n${patternGCode}`;

    setGcodeResult(completeGCode);
  }, [fontLoaded, xLabel, label, yLabel, filled, typeX, minX, maxX, stepSizeX, typeY, minY, maxY, stepSizeY, size, freeVariable, freevariableLabel, labelFeedrate]);

  if (!fontLoaded) {
    FontRenderer.init(() => setFontLoaded(true));
  }

  return (
    <Grid>
      <GridCol span={'auto'}>
        <Stack align={'stretch'}>
          <Fieldset legend={'X-Axis'}>
            <Group grow>
              <NativeSelect label="Variable" value={typeX} onChange={setTypeX} data={variableProp} />
              <NumberInput label="Min" value={minX} onChange={setMinX} min={0} />
              <NumberInput label="Max" value={maxX} onChange={setMaxX} min={0} />
              <NumberInput label="Stepsize" value={stepSizeX} onChange={setStepSizeX} min={0.1} />
            </Group>
          </Fieldset>
          <Fieldset legend={'Y-Axis'}>
            <Group>
              <NativeSelect label="Variable" value={typeY} onChange={setTypeY} data={variableProp} />
              <NumberInput label="Min" value={minY} onChange={setMinY} min={0} />
              <NumberInput label="Max" value={maxY} onChange={setMaxY} min={0} />
              <NumberInput label="Stepsize" value={stepSizeY} onChange={setStepSizeY} min={0.1} />
            </Group>
          </Fieldset>
          <Fieldset legend={'Misc'}>
            <Group>
              <NumberInput label={`Freevariable: ${freevariableLabel}`} value={freeVariable} onChange={setFreeVariable} />
              <NumberInput label="Size" value={size} onChange={setSize} />
              <Checkbox label="Filled" value={filled ? 'true' : 'false'} onChange={setFilled} />
            </Group>
          </Fieldset>
          <Fieldset legend={'Label'}>
            <TextInput label="Text" value={label} onChange={setLabel} />
            <NumberInput label="Feedrate" value={labelFeedrate} onChange={setLabelFeedrate} min={1000} />
          </Fieldset>
        </Stack>
      </GridCol>
      <GridCol span={'auto'}>
        <GCodeBox gcode={gcodeResult} label={niceLabel} />
      </GridCol>
    </Grid>
  );
}
