import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import { createCompany, fetchCompaniesByCompanyId, fetchCompaniesWithParentByProfileId, fetchCompanyById, updateCompany } from '@/services/companyService';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company } from '@/types/models';
import { useRouter } from 'next/router';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';
import AddFolderModal from '@/components/modals/AddFolderModal';
import { FolderFormInputs } from '@/schemas/folder';

interface FoldersProps {}

const Folders: React.FC<FoldersProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderFormInputs | null>();
  const [search, setSearch] = useState<string>('');

  const handleOpenModal = (data?: FolderFormInputs) => {
    setIsModalOpen(true);
    setSelectedFolder(data)
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFolder(null);
  };

  const handleCreateFolder = async (data: FolderFormInputs) => {
    if (selectedFolder) {
      const folderData = {
        ...data,
        id: selectedFolder.id,
      };
      await updateCompany(folderData);
    } else {
      const folderData = {
        ...data,
        companyId: id as string,
      };
      await createCompany(folderData);
    }
    await getCompanyData()
    handleCloseModal();
  };

  const getCompanyData = async () => {
    if (!user?.id || !id) return;

    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);

    if (companyData) {
      let data;
      if (user.role === ROLES.SALES) {
        data = await fetchCompaniesWithParentByProfileId(companyData.id, search);
      } else {
        data = await fetchCompaniesByCompanyId(companyData.id, search);
      }
      setCompanies(data);
    }
  };

  useEffect(() => {
    getCompanyData();
  }, [id, user, search]);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

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
      id: "menuFolder",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleOpenModal({...row.original, companyName: row.original.name})}>Modifier</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6">
      <Header title={company?.name} subtitle="Mes dossiers" siren={company?.siren} />
      <DataTable<Company>
        data={companies}
        columns={columns}
        placeholder="Recherche"
        addButtonLabel="Ajouter un dossier"
        onAddButtonClick={() => handleOpenModal()}
        onChangeSearch={handleSearch}
      />
      <AddFolderModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateFolder}
        defaultValues={selectedFolder}
      />
    </div>
  );
};

export default Folders;
