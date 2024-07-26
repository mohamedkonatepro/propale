import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import { createCompany, fetchCompaniesByCompanyId, fetchCompaniesWithParentByProfileId, fetchCompanyById, updateCompany, deleteCompany } from '@/services/companyService';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company } from '@/types/models';
import { useRouter } from 'next/router';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';
import AddFolderModal from '@/components/modals/AddFolderModal';
import { FolderFormInputs } from '@/schemas/folder';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import AddProspectModal from '@/components/modals/AddProspectModal'; // Assurez-vous d'importer le composant de modal de prospect

const Folders: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderFormInputs | null>(null);
  const [search, setSearch] = useState<string>('');
  const [folderIdToDelete, setFolderIdToDelete] = useState<string | null>(null);
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false); // État pour gérer l'ouverture de la modal de prospect
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleOpenModal = (data?: FolderFormInputs) => {
    setIsModalOpen(true);
    setSelectedFolder(data || null);
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
      toast.success(`${data.companyName} à bien été modifié.`);
    } else {
      const folderData = {
        ...data,
        companyId: id as string,
      };
      await createCompany(folderData);
      toast.success(`${data.companyName} à bien été ajouté à la liste.`);
    }
    await getCompanyData();
    handleCloseModal();
  };

  const getCompanyData = async () => {
    if (!user?.id || !id) return;

    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);

    if (companyData) {
      const data = user.role === ROLES.SALES
        ? await fetchCompaniesWithParentByProfileId(user.id, search)
        : await fetchCompaniesByCompanyId(companyData.id, search);
      setCompanies(data);
    }
  };

  useEffect(() => {
    getCompanyData();
  }, [id, user, search]);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };

  const openDeleteModal = (folderId: string) => {
    setFolderIdToDelete(folderId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setFolderIdToDelete(null);
  };

  const handleDeleteFolder = async () => {
    if (!folderIdToDelete) return;

    await deleteCompany(folderIdToDelete);
    toast.success("Le dossier a bien été supprimé !");
    await getCompanyData();
    closeDeleteModal();
  };

  const openProspectModal = (company: Company) => {
    setSelectedCompany(company)
    setIsProspectModalOpen(true);
  };

  const closeProspectModal = () => {
    setIsProspectModalOpen(false);
  };

  const handleCreateProspect = async (data: any) => {
    // Implémentez la logique de création de prospect ici
    console.log(data);
    closeProspectModal();
    return 'test'
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
                  <DropdownMenuItem onClick={() => handleOpenModal({ ...row.original, companyName: row.original.name })}>
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
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteFolder}
        message="Êtes-vous sûr de vouloir supprimer ce dossier ?"
      />
      {selectedCompany && <AddProspectModal
        isOpen={isProspectModalOpen}
        onRequestClose={closeProspectModal}
        onSubmit={handleCreateProspect}
        company={selectedCompany}
      />}
    </div>
  );
};

export default Folders;
