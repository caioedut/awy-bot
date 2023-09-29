import { useMemo, useState } from 'react';

import { Box, Button, Card, Grid, Text, Tooltip, useTheme } from '@react-bulk/web';

import useMount from '../hooks/useMount';
import service from '../providers/service';

export default function CheckUpdate() {
  const theme = useTheme();
  const { gap } = theme.shape;

  const [latest, setLatest] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const appVersion = useMemo(() => service('getAppInfo')?.data?.version, []);
  const currentVersion = appVersion?.replace(/^\D/g, '');
  const latestVersion = latest?.name?.replace(/^\D/g, '');
  const downloadURL = latest?.assets?.[0]?.browser_download_url;
  const hasUpdate = Boolean(currentVersion && latestVersion && downloadURL) && currentVersion !== latestVersion;

  useMount(() => {
    fetch('https://api.github.com/repos/caioedut/awy-bot/releases/latest')
      .then((res) => res.json())
      .then((res) => setLatest(res))
      .catch(() => setLatest(null))
      .finally(() => setVisible(true));
  });

  if (!visible || !hasUpdate) {
    return null;
  }

  return (
    <Box center h={gap + 60}>
      <Card position="fixed" b={gap} p={gap / 2} corners={8} border="1px solid white">
        {downloading ? (
          <Tooltip title="Downloading new version">
            <Button circular color="yellow" loading />
          </Tooltip>
        ) : (
          <Grid gap noWrap alignItems="center" justifyContent="end">
            <Box>
              <Text bold color="yellow" ml={gap / 2}>
                New version available!
              </Text>
            </Box>
            <Box>
              <Button circular variant="text" color="white" px={gap / 2} onPress={() => setVisible(false)}>
                Skip
              </Button>
            </Box>
            <Box>
              <Button circular color="yellow" px={gap} href={downloadURL} onPress={() => setDownloading(true)}>
                Update Now!
              </Button>
            </Box>
          </Grid>
        )}
      </Card>
    </Box>
  );
}
