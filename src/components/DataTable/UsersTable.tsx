import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Profile } from '@/types/models';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';
import { MdFolderOpen } from 'react-icons/md';

type UsersTableProps = {
  profiles: Profile[];
  foldersCount: { [key: string]: number };
  handleSearch: (search: string) => void;
  handleAddButtonClick: () => void;
  handleEditUser: (user: Profile) => void;
  openDeleteModal: (userId: string) => void;
  openManageAccessModal: (user: Profile) => void;
};

const UsersTable: React.FC<UsersTableProps> = ({
  profiles, foldersCount, handleSearch, handleAddButtonClick, handleEditUser, openDeleteModal, openManageAccessModal,
}) => {
  const { user } = useUser();

  const columns: ColumnDef<Profile>[] = [
    {
      accessorKey: "firstname",
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Utilisateur
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="capitalize">{`${row.original.firstname} ${row.original.lastname}`}</div>
      ),
    },
    {
      accessorKey: "position",
      id: "position",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fonction
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("position")}</div>,
    },
    {
      accessorKey: "email",
      id: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "folder",
      id: "folder",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nb de dossiers
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const folderCount = foldersCount[row.original.id];
        return <div className="lowercase text-center">{folderCount !== undefined ? folderCount : 0}</div>;
      },
    },
    ...(user?.role !== ROLES.SALES
      ? [
          {
            id: "manage_folders",
            enableHiding: false,
            cell: ({ row }: any) => (
              <button onClick={() => openManageAccessModal(row.original)} className="flex items-center text-blueCustom border border-2 border-blueCustom p-2 rounded-lg shadow-md hover:bg-blue-100">
                Gérer les dossiers
                <MdFolderOpen className="ml-2" size="25" />
              </button>
            ),
          },
          {
            id: "menu",
            enableHiding: false,
            cell: ({ row }: any) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditUser(row.original)}>
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
    <DataTable<Profile>
      data={profiles}
      columns={columns}
      placeholder="Recherche"
      addButtonLabel="Ajouter un utilisateur"
      onAddButtonClick={handleAddButtonClick}
      onChangeSearch={handleSearch}
    />
  );
};

export default UsersTable;
