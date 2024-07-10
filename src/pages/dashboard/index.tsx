import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import { fetchAllCompaniesWithoutParent } from '@/services/companyService';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { fetchProfilesWithRoleSuperAdmin } from '@/services/userService';
import { MdFolderOpen } from 'react-icons/md';

export type Folder = {
  id: string;
  name: string;
  activity_area: string;
  siret: string;
  siren?: string;
};

interface HomeProps {
  user: Profile;
  page: string;
}

const Home: React.FC<HomeProps> = ({ user, page }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (page === 'users') {
        const profilesData = await fetchProfilesWithRoleSuperAdmin();
        setProfiles(profilesData || []);
      } else {
        const companiesData = await fetchAllCompaniesWithoutParent();
        setCompanies(companiesData || []);
      }
    };

    fetchData();
  }, [page, user.id]);

  const handleAddButtonClickFolder = () => {
    // todo
  };

  const handleSearchFolder = () => {
    // todo
  }

  const handleAddButtonClickUser = () => {
    // todo
  };

  const handleSearchUser = () => {
    // todo
  }

  const columns: ColumnDef<Folder>[] = [
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
          Nom du dossier
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
      accessorKey: "activity_area",
      id: "activity_area",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Secteur d’activité
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("activity_area")}</div>,
    },
    {
      id: "new_prospect",
      enableHiding: false,
      cell: ({ row }) => (
        <button className="flex items-center text-blue-500 border border-2 border-blue-500 py-2 px-4 rounded-lg shadow-md hover:bg-blue-100">
          Nouveau prospect
          <FaPlus className="ml-2" />
        </button>
      ),
    },
    {
      id: "menu",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];


  const columnsProfiles: ColumnDef<Profile>[] = [
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
      id: "manage_folders",
      enableHiding: false,
      cell: ({ row }) => (
        <button className="flex items-center text-blue-500 border border-2 border-blue-500 p-2 rounded-lg shadow-md hover:bg-blue-100">
          Gérer les dossiers
          <MdFolderOpen className="ml-2" size="25" />
        </button>
      ),
    },
    {
      id: "menu",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Modifier</DropdownMenuItem>
            <DropdownMenuItem>Supprimer</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <h3 className="text-2xl font-bold mt-5">Espace administrateur</h3>
      </div>
      {page === 'folders' ? (
        <DataTable<Folder>
          data={companies}
          columns={columns}
          placeholder="Recherche"
          addButtonLabel="Ajouter une entreprise"
          onAddButtonClick={handleAddButtonClickFolder}
          onChangeSearch={handleSearchFolder}
        />
      ) : (
        <DataTable<Profile>
          data={profiles}
          columns={columnsProfiles}
          placeholder="Recherche"
          addButtonLabel="Ajouter un utilisateur"
          onAddButtonClick={handleAddButtonClickUser}
          onChangeSearch={handleSearchUser}
        />
      )}
    </div>
  );
};

export default Home;
