import { Fragment, useCallback, useEffect, useState } from 'react';

import { Box, Button, Divider, Scrollable, Text } from '@react-bulk/web';
import axios from 'axios';

import ArrayHelper from '../helpers/ArrayHelper';

const gitUrlMain = 'https://api.github.com/repos/maketgoy/awy-bot-scripts/git/trees/main';

export type GitHubFile = {
  type: 'tree' | 'blob';
  sha: string;
  url: string;
  path: string;
  content?: string;
  tree?: GitHubFile[];
};

export default function GitHubRepository({ onChange }) {
  const [files, setFiles] = useState<any>({});
  const [tree, setTree] = useState<string[]>([gitUrlMain]);

  const currentTree = tree?.[tree.length - 1];
  const currentFiles = files?.[currentTree]?.tree ?? [];

  const getDir = useCallback(async (dir, data?: any) => {
    const response = await axios.get(dir);

    const newFile = {
      ...Object(data),
      ...Object(response?.data),
    };

    setFiles((current) => {
      return {
        ...current,
        [dir]: { ...Object(current[dir]), ...newFile },
      };
    });

    return newFile;
  }, []);

  const handleBackTo = useCallback(async (url: string) => {
    setTree((current) => {
      const index = current.indexOf(url);
      return current.slice(0, index + 1);
    });
  }, []);

  const handlePressFile = useCallback(async (file: GitHubFile) => {
    const data = await getDir(file.url, file);

    if (file.type !== 'tree') {
      console.log(file.url);
      return onChange?.(data);
    }

    setTree((current) => [...current, file.url]);
  }, []);

  useEffect(() => {
    getDir(gitUrlMain).catch(() => null);
  }, []);

  return (
    <>
      <Box row noWrap alignItems="center" p={1}>
        {tree.map((url, index) => (
          <Fragment key={index}>
            {index > 0 && (
              <Text mb={-0.5} mx={1}>
                /
              </Text>
            )}
            <Button align="start" variant="text" size="small" color="info" onPress={() => handleBackTo(url)}>
              {files?.[url]?.path ?? 'Root'}
            </Button>
          </Fragment>
        ))}
      </Box>

      <Divider />

      <Scrollable contentInset={1}>
        {ArrayHelper.orderBy(currentFiles, ['-type', 'path']).map((file) => {
          return (
            <Box key={file.sha}>
              <Button
                align="start"
                variant="text"
                size="small"
                color="secondary"
                startAddon={<Text mt={-1}>{file.type === 'tree' ? '📁' : '🗎'}</Text>}
                onPress={() => handlePressFile(file)}
              >
                {file.path}
              </Button>
            </Box>
          );
        })}
      </Scrollable>
    </>
  );
}
