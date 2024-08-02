import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company } from '@/types/models';
import { Checkbox } from '@/components/common/Checkbox';

type ProspectsTableProps = {
  prospects: Company[];
  handleSearch: (search: string) => void;
  openProspectModal: () => void;
  openDeleteModal: (prospectId: string) => void;
  handleMultipleDelete: (selectedRows: Company[]) => void;
  handleExportCsv: (selectedRows: Company[]) => void;
};

const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects, handleSearch, openProspectModal, openDeleteModal, handleMultipleDelete, handleExportCsv,
}) => {

  const columns: ColumnDef<Company>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prospect
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "siret",
      id: "siret",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Siret
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("siret")}</div>,
    },
    {
      accessorKey: "activity_sector",
      id: "activity_sector",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Secteur d’activité
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("activity_sector")}</div>,
    },
    {
      accessorKey: "status",
      id: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statut
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("status")}</div>,
    },
    {
      accessorKey: "heat_level",
      id: "heat_level",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Chaleur
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("heat_level")}</div>,
    },
    {
      id: "menuProspect",
      enableHiding: false,
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDeleteModal(row.original.id)}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable<Company>
      data={prospects}
      columns={columns}
      placeholder="Recherche"
      addButtonLabel="Ajouter un prospect"
      onAddButtonClick={openProspectModal}
      onChangeSearch={handleSearch}
      handleDeleteClick={handleMultipleDelete}
      handleDownloadClick={handleExportCsv}
    />
  );
};

export default ProspectsTable;
