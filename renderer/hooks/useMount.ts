import { useEffect } from 'react';

export default function useMount(callback) {
  useEffect(() => {
    callback();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
