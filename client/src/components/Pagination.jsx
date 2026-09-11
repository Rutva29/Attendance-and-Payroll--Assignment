export default function Pagination({ currentPage, totalPages, rangeStart, rangeEnd, total, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {rangeStart}-{rangeEnd} of {total}
      </span>
      <div className="pagination-actions">
        <button type="button" className="btn btn-small" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="pagination-page">
          Page
          <select
            className="pagination-page-select"
            value={currentPage}
            onChange={(event) => onPageChange(Number(event.target.value))}
            aria-label="Jump to page"
          >
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <option key={pageNumber} value={pageNumber}>
                {pageNumber}
              </option>
            ))}
          </select>
          of {totalPages}
        </span>
        <button type="button" className="btn btn-small" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
