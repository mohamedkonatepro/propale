import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableTanstack 
} from "@tanstack/react-table"
import { Button } from "@/components/common/Button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "@/components/common/DropdownMenu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/Table"
import { InputSearch } from "../common/InputSearch"
import { FaPlus } from "react-icons/fa"
import { useUser } from "@/context/userContext"
import { ROLES } from "@/constants/roles"
import { FaRegTrashAlt } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { RxDividerVertical } from "react-icons/rx";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  placeholder?: string;
  addButtonLabel?: string;
  onAddButtonClick?: () => void;
  onChangeSearch?: (value: string) => void;
  handleDeleteClick?: (selectedRows: T[]) => void;
  handleDownloadClick?: (selectedRows: T[]) => void;
  table?: TableTanstack<T>;  // Ajout de cette ligne
}

export function DataTable<T>({ 
  data, 
  columns, 
  placeholder = "Recherche", 
  addButtonLabel = "Ajouter", 
  onAddButtonClick, 
  onChangeSearch, 
  handleDeleteClick, 
  handleDownloadClick, 
  table: externalTable 
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const { user } = useUser();

  const tableOptions = React.useMemo(() => ({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(externalTable?.options.state || {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(externalTable?.options || {}),
  }), [data, columns, sorting, columnFilters, columnVisibility, rowSelection, externalTable]);

  const table = useReactTable(tableOptions);

  const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);

  const handleMultipleDeleteClick = () => {
    if (handleDeleteClick) {
      handleDeleteClick(selectedRows);
    }
  };

  const handleMultipleDownloadClick = () => {
    if (handleDownloadClick) {
      handleDownloadClick(selectedRows);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex w-full justify-end">
          {onChangeSearch && <InputSearch
            placeholder={placeholder}
            onChange={(e) => onChangeSearch(e.target.value)}
            className="w-1/4 mr-5"
          />}
          {onAddButtonClick && (
            <button
              className="flex items-center bg-blueCustom text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              onClick={onAddButtonClick}
            >
              {addButtonLabel}
              <FaPlus className="ml-2" />
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {handleDeleteClick && handleDownloadClick && (
        <div className="flex bg-white w-fit p-2 items-center rounded-tr-lg">
          <div className="text-gray-400 flex p-1">
            {table.getFilteredSelectedRowModel().rows.length} sélectionnées
          </div>
          <RxDividerVertical className="h-full" />
          <div className="text-blueCustom flex p-1 items-center cursor-pointer" onClick={handleMultipleDeleteClick}>
            Supprimer <FaRegTrashAlt className="ml-1" />
          </div>
          <RxDividerVertical className="h-full" />
          <div className="text-blueCustom flex p-1 items-center cursor-pointer" onClick={handleMultipleDownloadClick}>
            Télécharger <MdOutlineFileDownload className="ml-1" />
          </div>
        </div>
      )}
      <div className="rounded-lg border shadow-lg">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`hover:bg-blue-50 ${row.getIsSelected() ? 'bg-blue-50' : 'bg-white'}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`${row.getIsSelected() ? "bg-blue-50" : ""}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur {" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnées.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
