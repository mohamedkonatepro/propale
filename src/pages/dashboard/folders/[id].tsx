import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { fetchCompaniesByCompanyId, fetchCompaniesWithParentByProfileId, fetchCompanyById } from '@/services/companyService';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { useRouter } from 'next/router';

export type Folder = {
  id: string;
  name: string;
  activity_area: string;
  siret: string;
  siren?: string;
};

interface FoldersProps {
  user: Profile;
}

const Folders: React.FC<FoldersProps> = ({ user }) => {
  const router = useRouter();
  const { id } = router.query;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (user?.id) {
      const getCompanies = async (objectId: string) => {
        let data;
        
        if (user.role === "sales") {
          data = await fetchCompaniesWithParentByProfileId(objectId);
        } else {
          data = await fetchCompaniesByCompanyId(objectId);
        }
        
        setCompanies(data);
      };
  
      const getCompany = async () => {
        const data = await fetchCompanyById(id as string);
        setCompany(data);
      };
      if (company) {
        getCompanies(company.id);
      }
      getCompany();
    }
  }, [company, id, user]);

  const handleAddButtonClick = () => {
    // todo
  };

  const handleSearch = () => {
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex">
        <Sidebar user={user} currentPage='folders' />
        <div className="flex-1 p-6">
          <Header title={company?.name} subtitle="Mes dossiers" siren={company?.siren} />
          <DataTable<Folder>
            data={companies}
            columns={columns}
            placeholder="Recherche"
            addButtonLabel="Ajouter un dossier"
            onAddButtonClick={handleAddButtonClick}
            onChangeSearch={handleSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default Folders;
