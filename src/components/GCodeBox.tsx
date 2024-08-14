import { Button, Group, NavLink, Stack, Textarea } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useClipboard } from '@mantine/hooks';
import { IconDownload } from '@tabler/icons-react';
import { GCodeVis } from '@/components/GCodeVis';

export function GCodeBox({ gcode, label }: { gcode: string; label: string }) {
  const [downloadBlobUrl, setDownloadBlobUrl] = useState('');

  const clipboard = useClipboard({ timeout: 500 });

  useEffect(() => {
    if (downloadBlobUrl !== '') {
      URL.revokeObjectURL(downloadBlobUrl);
    }
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    setDownloadBlobUrl(url);
  }, [gcode]);

  return (
    <Stack justify={'flex-start'}>
      <Group grow>
        <Button color={clipboard.copied ? 'teal' : 'blue'} onClick={() => clipboard.copy(gcode)}>
          {clipboard.copied ? 'Copied' : 'Copy GCode'}
        </Button>
        <NavLink href={downloadBlobUrl} label="Download" download={label + '.gcode'} leftSection={<IconDownload />} active />
      </Group>
      <Textarea label="GCode" defaultValue={gcode} minRows={30} />
      <GCodeVis gcode={gcode} />
    </Stack>
  );
}
