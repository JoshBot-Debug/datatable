import { useEffect, useRef, useState } from "react";
import "./index.css"
import { FloatingArrow, FloatingFocusManager, Placement, arrow, autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';

export function Datatable<FieldNames extends string>(props: UseDatatable.DatatableProps<FieldNames>) {

  const {
    data,
    isFetching,
    columns,
    tableClassName = "",
    thClassName = "",

    sortable,
    pagination,
    selectable,

    RowOptionMenu,
    AppsPanel,
    TextFilter,
  } = props;

  return (
    <div className="myers-datatable">
      <div className={`table-container ${tableClassName}`}>

        <div className="table-cell table-header apps-button-header-cell" >
          {
            AppsPanel && (
              <Popper
                Icon={IoApps}
                mainAxisOffset={20}
                crossAxisOffset={10}
                placement="bottom-end"
              >
                {AppsPanel}
              </Popper>
            )
          }
        </div>

        {!!selectable?.show && (
          <TableHeader column={{ field: "_selectable", datatype: "string", columnName: "", sortable: false, omit: false }}>
            <selectable.Header
              selectAll={selectable.selectAll}
              isAllSelected={selectable.isAllSelected}
            />
          </TableHeader>
        )}

        {columns.map((column) => (
          <TableHeader
            key={column.field}
            column={column}
            onClick={(column) => {
              if (sortable) sortable.onSort(column);
            }}
            className={`${sortable ? 'sortable-table-header' : ''} ${column.omit ? 'hide' : ''} ${thClassName}`}
          >
            <div className="column-header-options">
              {
                !!sortable && (
                  <sortable.Sort
                    key={column.field}
                    column={column}
                    sortDirection={sortable.sortOrder[column.field]?.sortDirection}
                    orderIndex={sortable.sortOrder[column.field]?.orderIndex}
                    isMultiSort={Object.keys(sortable.sortOrder).length > 1}
                  />
                )
              }
              {
                (
                  ((
                    column.datatype === "string" ||
                    column.datatype === "paragraph" ||
                    column.datatype === "name" ||
                    column.datatype === "email" ||
                    column.datatype === "link" ||
                    column.datatype === "phone" ||
                    column.datatype === "image"
                  ) && TextFilter)
                ) && (
                  <div className="filter-options-button">
                    <Popper
                      Icon={IoMenu}
                      mainAxisOffset={20}
                      crossAxisOffset={10}
                      placement="bottom-end"
                    >
                      <TextFilter field={column.field} filterOperations={column.filterOperations} />
                    </Popper>
                  </div>
                )
              }
            </div>
          </TableHeader>
        ))}

        {data.map((row, rIndex) => (
          <div key={rIndex} className="table-row">

            <div className="table-cell">
              {
                RowOptionMenu && (
                  <Popper
                    Icon={IoEllipsisVertical}
                    mainAxisOffset={10}
                    crossAxisOffset={0}
                    placement="right-start"
                  >
                    <RowOptionMenu row={row} rowIndex={rIndex} />
                  </Popper>
                )
              }

              {
                isFetching && (
                  <div className="spinner-container">
                    <div className="spinner"></div>
                    <span className="spinner-loading-text">Loading</span>
                  </div>
                )
              }
            </div>

            {!!selectable?.show && (
              <div className="table-cell">
                <selectable.Row
                  index={rIndex}
                  isSelectable={selectable.isSelectable}
                  row={row}
                  checked={selectable.selectedRows.includes(rIndex)}
                  onChange={selectable.onSelectRow}
                  disableRow={selectable.disableRow}
                />
              </div>
            )}

            {columns.map((col, cIndex) => (
              <div
                key={cIndex}
                className={`table-cell ${col.omit ? 'hide' : ''}`}
                title={String(row[col.field])}
              >
                {(col.renderCell ?? Cell)(row[col.field], col)}
              </div>
            ))}

          </div>
        ))}

      </div>
      {
        !pagination?.Pagination
          ? null
          : (
            <pagination.Pagination
              currentPage={pagination.page.currentPage}
              count={pagination.count}
              rowsPerPage={pagination.page.rowsPerPage}
              currentRowsPerPage={pagination.page.currentRowsPerPage}
              numberOfRows={pagination.numberOfRows}
              firstPage={pagination.firstPage}
              lastPage={pagination.lastPage}
              nextPage={pagination.nextPage}
              previousPage={pagination.previousPage}
              goToPage={pagination.goToPage}
              onChangeRowsPerPage={pagination.onChangeRowsPerPage}
            />
          )
      }
    </div>
  )
}


const Cell = <FieldNames extends string,>(value: any, column: UseDatatable.Column<FieldNames>) => {

  if (column.datatype === "paragraph") return <ParagraphCell text={value} />

  if (column.datatype === "name") return <span className="cell-datatype-name" >{value}</span>

  if (column.datatype === "link") return <a href={value} target="_blank">{new URL(value).hostname}</a>

  if (column.datatype === "email") return <a href={`mailto:${value}`}>{value}</a>

  if (column.datatype === "date") {
    return new Date(value).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (column.datatype === "datetime") {
    return new Date(value).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (column.datatype === "boolean") {

    return (
      <>
        {
          JSON.parse(value)
            ? <IoCheckmarkCircle />
            : <IoClose />
        }
      </>
    )
  }

  if (column.datatype === "phone") {

    const phone = { code: false, number: value }
    const parts = value.split(" ");
    if (parts.length > 1) {
      phone.code = parts[0];
      phone.number = parts[1];
    }
    const formattedNumber = phone.number.slice(0, 3) + "-" + phone.number.slice(3, 6) + "-" + phone.number.slice(6);
    if (phone.code) return `${phone.code} ${formattedNumber}`
    return formattedNumber
  }

  if (column.datatype === "image") {

    return <a href={value} target="_blank">
      <img className="cell-datatype-image" src={value} />
    </a>
  }

  return value
}

const ParagraphCell = (props: { text: string; }) => {

  const { text } = props;

  const [open, setOpen] = useState(false);

  return (
    <span
      className={`cell-datatype-paragraph ${open ? 'cell-datatype-paragraph-open' : 'cell-datatype-paragraph-closed'}`}
      onClick={() => setOpen(o => !o)}
    >{text}</span>
  )
}

const TableHeader = <FieldNames extends string,>(props: UseDatatable.TableHeaderProps<FieldNames>) => {

  const {
    column,
    children,
    className = "",
    onClick
  } = props;

  const ref = useRef(null);
  const [fontSize, setFontSize] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const computedStyle = getComputedStyle(ref.current);
    const fontSize = computedStyle.fontSize;
    setFontSize(Number(fontSize.replace("px", "")))
  }, []);

  return (
    <div
      ref={ref}
      key={column.columnName}
      className={`table-cell table-header ${className}`}
      onClick={() => onClick && onClick(column)}
      style={{ minWidth: fontSize ? ((column.columnName.length * fontSize)) : undefined }}
    >
      <div className="table-header-children-container">
        {!!column.columnName && <span className="table-header-column-name">{column.columnName}</span>}
        {children}
      </div>
    </div>
  )
}

function IoCheckmarkCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="boolean-svg boolean-true-svg"
    >
      <path
        d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm108.25 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z"
      />
    </svg>
  )
}

function IoClose() {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="boolean-svg boolean-false-svg"
    >
      <path
        d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm75.31 260.69a16 16 0 11-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 01-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0122.62-22.62L256 233.37l52.69-52.68a16 16 0 0122.62 22.62L278.63 256z"
      />
    </svg>
  )
}

function IoApps() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg"
    >
      <path
        d="M104 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 160a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 312a56 56 0 1156-56 56.06 56.06 0 01-56 56zM104 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM256 464a56 56 0 1156-56 56.06 56.06 0 01-56 56zM408 464a56 56 0 1156-56 56.06 56.06 0 01-56 56z"
      />
    </svg>
  )
}

function IoEllipsisVertical() {

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="options-svg"
    >
      <circle cx="256" cy="256" r="48" />
      <circle cx="256" cy="416" r="48" />
      <circle cx="256" cy="96" r="48" />
    </svg>
  )
}

function IoMenu() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeMiterlimit="10"
        strokeWidth="48"
        d="M88 152h336M88 256h336M88 360h336"
      />
    </svg>
  )
}

function Popper(props: { Icon: React.FC; placement: Placement; mainAxisOffset: number; crossAxisOffset: number; } & React.PropsWithChildren) {

  const {
    Icon,
    children,
    mainAxisOffset,
    crossAxisOffset,
    placement
  } = props;

  const arrowRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement,
    middleware: [
      arrow({ element: arrowRef, padding: 16 }),
      offset({ mainAxis: mainAxisOffset, crossAxis: crossAxisOffset }),
      flip(),
      shift()
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const buttonProps = getReferenceProps();

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...buttonProps}
        onClick={e => { e.stopPropagation(); (buttonProps as any).onClick(e); }}
      >
        <Icon />
      </button>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="popup-floating-container"
            {...getFloatingProps()}
          >
            <FloatingArrow ref={arrowRef} context={context} className="popup-floating-arrow" />
            <div className="popup-container">
              {children}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}