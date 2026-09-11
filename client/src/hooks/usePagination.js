import { useEffect, useState } from 'react';

export const PAGE_SIZE = 20;

// call with an already-filtered/sorted row list; resets to page 1 whenever the row
// count changes or resetKey changes (pass sort/search state so a new search doesn't
// leave you stranded on a page that no longer exists)
export function usePagination(rows, resetKey, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows.length, resetKey]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, rows.length);

  return { pageRows, currentPage, totalPages, rangeStart, rangeEnd, setPage };
}
