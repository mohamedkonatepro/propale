import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { data } from '@/data/folders';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

export type Folder = {
  id: string;
  name: string;
  activity_area: string;
  siret: string;
};

const Dashboard = () => {

  const handleAddButtonClick = () => {
    // handle add button click logic here
  };

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
        <Sidebar />
        <div className="flex-1 p-6">
          <Header title="IPSUM Consulting" subtitle="Mes dossiers" siren="983 067 737" />
          <DataTable<Folder>
            data={data}
            columns={columns}
            placeholder="Recherche"
            addButtonLabel="Ajouter un dossier"
            onAddButtonClick={handleAddButtonClick}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
