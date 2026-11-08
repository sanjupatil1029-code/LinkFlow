import { useCallback, useEffect, useState } from 'react';
import { linksApi } from '../api/services';
import { getErrorMessage } from '../utils/format';

/** Loads the signed-in user's links and exposes helpers to refresh or prepend one. */
export default function useLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      setLinks(await linksApi.list());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your links.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addLink = useCallback((link) => {
    setLinks((prev) => [link, ...prev.filter((l) => l.shortCode !== link.shortCode)]);
  }, []);

  return { links, loading, error, reload: load, addLink };
}
