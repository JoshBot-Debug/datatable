import { useEffect, useId, useState } from "react";
import { Datatable } from "../types";

export default function usePagination(config: Datatable.UsePagination.Config): Datatable.UsePagination.HookReturn {

  const {
    onChange,
    initialPage,
    defaultPage,
    numberOfRows,
    count
  } = config;

  const [page, setPage] = useState(initialPage ?? defaultPage);

  const lastPageNumber = Math.ceil(count / page.currentRowsPerPage);

  const firstPage = () => onPageChange(prev => ({ ...prev, currentPage: 1 }))
  const lastPage = () => onPageChange(prev => ({ ...prev, currentPage: lastPageNumber }))
  const nextPage = () => onPageChange(prev => ({ ...prev, currentPage: Math.min(prev.currentPage + 1, lastPageNumber) }))
  const previousPage = () => onPageChange(prev => ({ ...prev, currentPage: Math.max(prev.currentPage - 1, 1) }))
  const goToPage = (page: number) => { }

  const onChangeRowsPerPage = (rowsPerPage: number) => onPageChange(prev => ({ ...prev, currentRowsPerPage: rowsPerPage }));

  const onPageChange = (callback: (prev: Datatable.UsePagination.Page) => Datatable.UsePagination.Page) => {
    return setPage(prev => {
      const nextPage = callback(prev);
      onChange(nextPage);
      return nextPage;
    })
  }

  useEffect(() => { onChange(page); }, []);

  const reset = (filter?: Datatable.UsePagination.Page, useDefaultPage?: boolean) => {
    const resetValue = useDefaultPage ? defaultPage : filter ?? initialPage ?? defaultPage;
    setPage(resetValue);
    return resetValue;
  }

  return {
    page,
    count,
    numberOfRows,
    Pagination,
    firstPage,
    lastPage,
    nextPage,
    previousPage,
    goToPage,
    onChangeRowsPerPage,
    reset,
  }
}


const Pagination = (props: Datatable.UsePagination.PageProps) => {

  const {
    page,
    count,
    numberOfRows,
    firstPage,
    lastPage,
    nextPage,
    previousPage,
    goToPage,
    onChangeRowsPerPage,
  } = props;

  const { currentPage, currentRowsPerPage, rowsPerPage } = page;

  const id = useId();

  const from = ((currentPage * currentRowsPerPage) - currentRowsPerPage);

  return (
    <div className="pagination-container">
      <div className="pagination-rpp-container">

        <label htmlFor={`rows-per-page-${id}`}>Rows per page:</label>
        <select
          id={`rows-per-page-${id}`}
          value={currentRowsPerPage}
          onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}
          className="pagination-select-input"
        >
          {rowsPerPage.map(count => <option key={`rows-per-page-${count}`} value={count}>{count}</option>)}
        </select>

        {count === 0 && <span>0-0 of 0</span>}
        {count > 0 && <span>{from + 1}-{numberOfRows + from} of {count}</span>}

      </div>
      <div className="pagination-icon-button-container">
        <IconButton onClick={firstPage} SVG={StartSVG} />
        <IconButton onClick={previousPage} SVG={PreviousSVG} />
        <IconButton onClick={nextPage} SVG={NextSVG} />
        <IconButton onClick={lastPage} SVG={EndSVG} />
      </div>
    </div>
  )
}

interface IconButtonProps {
  onClick: () => void;
  SVG: React.FC;
}

const IconButton = (props: IconButtonProps) => {

  const {
    onClick,
    SVG
  } = props;

  return (
    <button
      onClick={onClick}
      className="pagination-icon-button"
      type="button"
    >
      <SVG />
    </button>
  )
}

const StartSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
    className="pagination-navigation-svg"
  >
    <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
    <path fill="none" d="M24 24H0V0h24v24z" />
  </svg>
)

const EndSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
    className="pagination-navigation-svg"
  >
    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
    <path fill="none" d="M0 0h24v24H0V0z" />
  </svg>
)

const PreviousSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
    className="pagination-navigation-svg"
  >
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)

const NextSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
    className="pagination-navigation-svg"
  >
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
)

