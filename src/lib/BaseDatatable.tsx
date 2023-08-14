import { useRef, useState } from "react";
import "./index.css"
import { FloatingArrow, FloatingFocusManager, Placement, arrow, autoUpdate, flip, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { Datatable } from "./types";
import { useResizer } from "./helpers";


export function BaseDatatable<Data extends Record<string, any>>(props: Datatable.DatatableProps<Data>) {

  const {
    data,
    isFetching,
    columns,
    onColumnClick,
    RowOptionMenu,
    AppsPanel,
    renderSort,
    renderFilter,
    Footer,
    hideSelect,
    SelectHeader,
    SelectCell,
    NoData,
    onRowClick,
    showOptionsOnRowClick,
    minColumnSize,
    columnNameFontSize
  } = props;

  const selectWidth = hideSelect ? 0 : 50;
  const appPanelColWidth = 50;

  const resizer = useResizer({
    columns,
    isFetching,
    extraWidth: selectWidth + appPanelColWidth,
    minColumnSize,
    columnNameFontSize,
  });

  return (
    <div className="myers-datatable">
      <div ref={resizer.containerRef} className="table-scroll-container">

        <div className="table-header-row table-row">
          <div className="table-cell table-header-cell apps-button-header-cell" style={{ width: appPanelColWidth, minWidth: appPanelColWidth, maxWidth: appPanelColWidth }}>
            {
              AppsPanel && (
                <Popper
                  Icon={IoApps}
                  mainAxisOffset={20}
                  crossAxisOffset={10}
                  placement="bottom-end"
                  className="app-panel-button"
                >
                  {AppsPanel}
                </Popper>
              )
            }
          </div>

          {(!hideSelect && !!SelectHeader) && (
            <TableHeader
              className="select-header-cell"
              column={{ field: "_selectable", datatype: "string", columnName: "", sortable: false, omit: false, filterable: false }}
              width={selectWidth}
            >
              <SelectHeader />
            </TableHeader>
          )}

          {columns.map((column) => (
            <TableHeader
              key={String(column.field)}
              column={column}
              onClick={onColumnClick}
              className={`${column.sortable ? 'sortable-table-header' : ''} ${column.omit ? 'hide' : ''}`}
              width={resizer.getWidth(column)}
            >

              <div className="column-header-options">
                {(column.sortable && renderSort) && renderSort(column)}
                {(column.filterable && renderFilter) && renderFilter(column, FilterMenu)}
              </div>
            </TableHeader>
          ))}
        </div>

        {data.map((row, rIndex) => (
          <PopperRow
            key={rIndex}
            crossAxisOffset={0}
            placement="right-start"
            PopUp={!RowOptionMenu ? null : <RowOptionMenu row={row} rowIndex={rIndex} />}
            useCursorOffset={!!showOptionsOnRowClick}
          >
            {
              (triggerProps) => (
                <div
                  className={`table-row ${(!!onRowClick || showOptionsOnRowClick) ? 'table-row-clickable' : ''}`}
                  onClick={(e) => {
                    onRowClick && onRowClick(row, e);
                    showOptionsOnRowClick && triggerProps.onClick(e);
                  }}
                >

                  {
                    isFetching && (
                      <div className="spinner-container">
                        <div className="spinner-wrapper">
                          <div className="spinner"></div>
                          <span className="spinner-loading-text">Loading</span>
                        </div>
                      </div>
                    )
                  }

                  <div className="table-cell" style={{ width: appPanelColWidth, minWidth: appPanelColWidth, maxWidth: appPanelColWidth }}>
                    {
                      RowOptionMenu && (
                        <button
                          {...triggerProps}
                          onClick={(e) => { e.stopPropagation(); triggerProps.onClick(e) }}
                        >
                          <IoEllipsisVertical />
                        </button>
                      )
                    }
                  </div>


                  {(!hideSelect && !!SelectCell) && (
                    <div className="table-cell" style={{ width: selectWidth, minWidth: selectWidth, maxWidth: selectWidth }}>
                      <SelectCell
                        index={rIndex}
                        row={row}
                      />
                    </div>
                  )}

                  {columns.map((column, cIndex) => <Cell key={cIndex} column={column} row={row} width={resizer.getWidth(column)} />)}

                </div>
              )
            }
          </PopperRow>
        ))}

        {(data.length === 0 && !isFetching) && (NoData ? NoData : <DefaultNoData />)}
      </div>
      {Footer}
    </div >
  )
}

function FilterMenu(props: { hasFilter: boolean; } & React.PropsWithChildren) {
  const { children, hasFilter } = props;

  return (
    <div className="filter-options-button">
      <Popper
        Icon={hasFilter ? IoFunnel : IoMenu}
        mainAxisOffset={20}
        crossAxisOffset={0}
        placement="bottom-end"
      >
        {children}
      </Popper>
    </div>
  )
}

const Cell = <Data extends Record<string, any>,>(props: { column: Datatable.Column<Data>; row: Data; width?: number; }) => {

  const { column, row, width } = props;

  const title = row[column.field] !== undefined ? String(row[column.field]) : undefined;

  const style = {
    width: width,
    minWidth: width,
    maxWidth: width,
  }

  if (column.renderCell) {
    return (
      <div
        className={`table-cell ${column.omit ? 'hide' : ''}`}
        title={title}
        style={style}
      >
        {column.renderCell(row[column.field], column, row)}
      </div>
    )
  }

  if (column.datatype === "paragraph") return <ParagraphCell column={column} title={title} text={row[column.field]} style={style} />

  return (
    <div
      className={`table-cell ${column.omit ? 'hide' : ''}`}
      title={title}
      style={style}
    >
      {DatatypeCell(row[column.field], column)}
    </div>
  )
}

const DatatypeCell = <Data extends Record<string, any>,>(value: any, column: Datatable.Column<Data>) => {

  if (column.datatype === "name") return <span className="cell-datatype-name text-wrapper">{value}</span>

  if (column.datatype === "link") return <a className="text-wrapper" href={value} target="_blank" rel="noreferrer">{new URL(value).hostname}</a>

  if (column.datatype === "email") return <a className="text-wrapper" href={`mailto:${value}`} target="_blank" rel="noreferrer">{value}</a>


  if (column.datatype === "date") {

    return (
      <span
        className="text-wrapper"
      >{!value ? "" : new Date(value).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })}
      </span>
    )
  }

  if (column.datatype === "datetime") {
    return (
      <span
        className="text-wrapper"
      >{!value ? "" : new Date(value).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}
      </span>
    )
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

    if (phone.code) return <span className="text-wrapper">{`${phone.code} ${formattedNumber}`}</span>
    return <span className="text-wrapper">{formattedNumber}</span>
  }

  if (column.datatype === "image") {

    return <a href={value} target="_blank" rel="noreferrer">
      <img alt="row" className="cell-datatype-image" src={value} />
    </a>
  }

  return <span className="text-wrapper">{value}</span>;
}

const ParagraphCell = <Data extends Record<string, any>,>(props: { column: Datatable.Column<Data>; text: string; title?: string; style: any }) => {

  const { text, title, column, style } = props;

  const [open, setOpen] = useState(false);

  return (
    <div
      className={`table-cell cell-datatype-paragraph ${column.omit ? 'hide' : ''} ${open ? 'cell-datatype-paragraph-open' : 'cell-datatype-paragraph-closed'}`}
      title={title}
      onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
      style={style}
    >
      <span className="text-wrapper">{text}</span>
    </div>
  )
}

const TableHeader = <Data,>(props: Datatable.TableHeaderProps<Data>) => {

  const {
    column,
    children,
    className = "",
    onClick,
    width
  } = props;

  return (
    <div
      key={column.columnName}
      className={`table-cell table-header-cell ${className}`}
      onClick={() => onClick && onClick(column)}
      title={column.columnName}
      style={{
        width: width,
        minWidth: width,
        maxWidth: width,
      }}
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
      className="header-svg io-apps"
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
      className="options-svg io-ellipsis"
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
      className="header-svg io-menu"
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

function IoFunnel() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="header-svg io-funnel"
    >
      <path
        d="M296 464a23.88 23.88 0 01-7.55-1.23L208.3 436.1a23.92 23.92 0 01-16.3-22.78V294.11a.44.44 0 00-.09-.13L23.26 97.54A30 30 0 0146.05 48H466a30 30 0 0122.79 49.54L320.09 294a.77.77 0 00-.09.13V440a23.93 23.93 0 01-24 24z"
      />
    </svg>
  )
}

function Popper(props: {
  className?: string;
  Icon: React.FC;
  placement: Placement;
  mainAxisOffset: number;
  crossAxisOffset: number;
} & React.PropsWithChildren) {

  const {
    Icon,
    children,
    mainAxisOffset,
    crossAxisOffset,
    placement,
    className,
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
        className={`icon-button ${className ?? ""}`}
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

function PopperRow(props: {
  className?: string;
  placement: Placement;
  crossAxisOffset: number;
  children: (triggerProps: any) => React.ReactNode;
  PopUp: React.ReactNode;
  useCursorOffset: boolean;
}) {

  const {
    children,
    PopUp,
    crossAxisOffset,
    placement,
    className,
    useCursorOffset,
  } = props;

  const arrowRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mainAxisMouseOffset, setMainAxisMouseOffset] = useState(useCursorOffset ? 0 : 10);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [
      arrow({ element: arrowRef, padding: 16 }),
      offset({ mainAxis: mainAxisMouseOffset, crossAxis: crossAxisOffset }),
      flip(),
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

  const triggerProps = {
    type: "button",
    ref: refs.setReference,
    ...buttonProps,
    className: `icon-button ${className ?? ""}`,
    onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
      e.stopPropagation();
      if (useCursorOffset) {
        const offsetX = e.nativeEvent.clientX - e.currentTarget.getBoundingClientRect().left;
        setMainAxisMouseOffset(offsetX);
      }
      (buttonProps as any).onClick(e);
    }
  }

  return (
    <>
      {children(triggerProps)}
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="popup-floating-container"
          >
            <FloatingArrow ref={arrowRef} context={context} className="popup-floating-arrow" />
            <div className="popup-container">
              {PopUp}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}

function DefaultNoData() {
  return <p className="no-items-to-display">No items to display.</p>
}