// accessors maps a column key to a value getter. null/undefined always sorts last.
export function sortRows(rows, accessors, sort) {
  const getValue = accessors[sort.key];
  if (!getValue) return rows;

  return [...rows].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    const emptyA = valueA === null || valueA === undefined;
    const emptyB = valueB === null || valueB === undefined;
    if (emptyA && emptyB) return 0;
    if (emptyA) return 1;
    if (emptyB) return -1;
    if (valueA < valueB) return sort.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}
