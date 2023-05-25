import { useTheme } from '@react-bulk/web';

import Code from '../icons/Code';
import Edit from '../icons/Edit';
import File from '../icons/File';
import Folder from '../icons/Folder';
import HelpCircle from '../icons/HelpCircle';
import Refresh from '../icons/Refresh';
import Trash from '../icons/Trash';

const Icons = {
  Code,
  Edit,
  File,
  Folder,
  HelpCircle,
  Refresh,
  Trash,
};

export type IconProps = {
  size?: number | string;
  color?: string;
  name: 'Code' | 'Edit' | 'File' | 'Folder' | 'HelpCircle' | 'Refresh' | 'Trash';
};

export default function Icon({ name, size = '1rem', color = 'primary' }: IconProps) {
  const theme = useTheme();

  color = theme.color(color);
  size = typeof size === 'string' ? theme.rem(Number(size.replace(/[^\d\.]/g, ''))) : Number(size);

  const Component = Icons[name] ?? HelpCircle;

  return <Component size={size as number} color={color} />;
}
