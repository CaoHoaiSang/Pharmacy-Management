import React, { useMemo } from "react";

const DOTS = "...";

const buildPageItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, DOTS, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, DOTS, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, DOTS, currentPage - 1, currentPage, currentPage + 1, DOTS, totalPages];
};

const Pagination = ({ currentPage, pageSize, totalItems, onPageChange, itemLabel = "mục" }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  const pageItems = useMemo(() => buildPageItems(currentPage, totalPages), [currentPage, totalPages]);

  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="pagination-bar">
      <div className="pagination-summary">
        Hiển thị {startItem}-{endItem} / {totalItems} {itemLabel}
      </div>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Trước
        </button>

        {pageItems.map((pageItem, index) =>
          pageItem === DOTS ? (
            <span key={`dots-${index}`} className="pagination-dots">
              {DOTS}
            </span>
          ) : (
            <button
              key={pageItem}
              type="button"
              className={`pagination-btn ${currentPage === pageItem ? "active" : ""}`}
              onClick={() => onPageChange(pageItem)}
            >
              {pageItem}
            </button>
          )
        )}

        <button
          type="button"
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default Pagination;
