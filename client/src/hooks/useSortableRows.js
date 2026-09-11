import { useState } from 'react';
import { sortRows } from '../utils/sorting';

// click sorts asc, click again flips to desc, new column starts at asc
export function useSortableRows(rows, accessors, initialSort) {
  const [sort, setSort] = useState(initialSort);

  function handleSort(key) {
    setSort((current) =>
      current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }
    );
  }

  return { sortedRows: sortRows(rows, accessors, sort), sort, handleSort };
}
