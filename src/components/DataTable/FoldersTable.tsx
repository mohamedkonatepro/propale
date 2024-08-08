import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company } from '@/types/models';
import Link from 'next/link';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';

type FoldersTableProps = {
  companies: Company[];
  handleOpenModal: (data?: any) => void;
  handleSearch: (search: string) => void;
  openProspectModal: (company: Company) => void;
  openDeleteModal: (folderId: string) => void;
};

const FoldersTable: React.FC<FoldersTableProps> = ({
  companies, handleOpenModal, handleSearch, openProspectModal, openDeleteModal,
}) => {
  const { user } = useUser();

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom du dossier
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/dashboard/prospect/${row.original.id}`} passHref>
          <div className="capitalize cursor-pointer">{row.getValue("name")}</div>
        </Link>
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
      cell: ({ row }) => (
        <Link href={`/dashboard/prospect/${row.original.id}`} passHref>
          <div className="lowercase cursor-pointer">{row.getValue("siret")}</div>
        </Link>
      ),
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
      cell: ({ row }) => (
        <Link href={`/dashboard/prospect/${row.original.id}`} passHref>
          <div className="lowercase cursor-pointer">{row.getValue("activity_sector")}</div>
        </Link>
      ),
    },
    {
      id: "new_prospect",
      enableHiding: false,
      cell: ({ row }) => (
        <button 
          className="flex items-center text-blue-500 border border-2 border-blue-500 py-2 px-4 rounded-lg shadow-md hover:bg-blue-100"
          onClick={() => openProspectModal(row.original)}
        >
          Nouveau prospect
          <FaPlus className="ml-2" />
        </button>
      ),
    },
    ...(user?.role !== ROLES.SALES
      ? [
          {
            id: "menuFolder",
            enableHiding: false,
            cell: ({ row }: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenModal(row.original)}>
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openDeleteModal(row.original.id)}>
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]
      : []),
  ];

  return (
    <DataTable<Company>
      data={companies}
      columns={columns}
      placeholder="Recherche"
      addButtonLabel="Ajouter un dossier"
      onAddButtonClick={() => handleOpenModal()}
      onChangeSearch={handleSearch}
    />
  );
};

export default FoldersTable;