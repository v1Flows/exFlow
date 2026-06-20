"use client";
import { Pagination } from "@heroui/react";

type PagePaginationProps = {
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
};

export function PagePagination({
  onPageChange,
  page,
  pageCount,
}: PagePaginationProps) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <Pagination aria-label="Pagination">
      <Pagination.Content>
        <Pagination.Previous
          isDisabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
        >
          <Pagination.PreviousIcon />
        </Pagination.Previous>
        {pages.map((pageNumber) => (
          <Pagination.Item key={pageNumber}>
            <Pagination.Link
              isActive={pageNumber === page}
              onPress={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Next
          isDisabled={page >= pageCount}
          onPress={() => onPageChange(page + 1)}
        >
          <Pagination.NextIcon />
        </Pagination.Next>
      </Pagination.Content>
    </Pagination>
  );
}
