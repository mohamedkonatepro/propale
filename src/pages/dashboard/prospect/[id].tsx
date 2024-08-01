import { useEffect, useRef, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/router';
import { ROLES } from '@/constants/roles';
import { useUser } from '@/context/userContext';
import AddProspectModal from '@/components/modals/AddProspectModal';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { toast } from 'react-toastify';
import { Company } from '@/types/models';
import { createProspect, deleteProspect, fetchCompanyById, fetchProspects, updateCompany } from '@/services/companyService';
import { Checkbox } from '@/components/common/Checkbox';
import { CSVLink } from 'react-csv';
import { GrFormEdit } from "react-icons/gr";
import AddFolderModal from '@/components/modals/AddFolderModal';
import { FolderFormInputs } from '@/schemas/folder';

const ProspectList: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [prospects, setProspects] = useState<Company[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const { user } = useUser();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Company | null>(null);
  const [search, setSearch] = useState<string>('');
  const [isProspectModalOpen, setIsProspectModalOpen] = useState(false); // État pour gérer l'ouverture de la modal de prospect
  const [csvData, setCsvData] = useState<any[]>([]); // État pour les données CSV
  const [isCsvLinkVisible, setIsCsvLinkVisible] = useState(false); // État pour contrôler l'affichage du lien CSV
  const csvLinkRef = useRef<CSVLink & HTMLAnchorElement & { link: HTMLAnchorElement }>(null); // Référence pour le composant CSVLink
  const [isModalOpenFolder, setIsModalOpenFolder] = useState(false);

  const getCompanyData = async () => {
    if (!user?.id || !id) return;

    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);
  };

  useEffect(() => {
    getCompanyData();
  }, [id, user]);

  const openProspectModal = () => {
    setIsProspectModalOpen(true);
  };

  const handleOpenModal = (data?: FolderFormInputs) => {
    setIsModalOpenFolder(true);
  };

  const closeProspectModal = () => {
    setIsProspectModalOpen(false);
  };

  const handleCloseModalFolder = () => {
    setIsModalOpenFolder(false);
  };
  const handleCreateProspect = async (data: any) => {
    const result = await createProspect(data);
    if (typeof result === 'string') {
      return result;
    }
    if (!result) {
      toast.error('Une erreur est survenue lors de la création du prospect.');
    } else {
      toast.success('Le prospect a été créé avec succès.');
      closeProspectModal();
      await getProspectData();
    }
  };

  const getProspectData = async () => {
    if (!user?.id) return;
    const data = await fetchProspects(id as string, search);
    setProspects(data);
  };

  useEffect(() => {
    getProspectData();
  }, [user, search]);

  const handleSearch = (searchValue: string) => {
    setSearch(searchValue);
  };


  const handleCreateFolder = async (data: FolderFormInputs) => {
    if (company) {
      const folderData = {
        ...data,
        id: company.id,
      };
      await updateCompany(folderData);
      toast.success(`${data.companyName} à bien été modifié.`);
    }
    await getCompanyData();
    handleCloseModalFolder();
  };
  
  const openDeleteModal = (prospectId: string) => {
    setSelectedProspect(prospects.find(p => p.id === prospectId) || null);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProspect(null);
  };

  const handleDeleteProspect = async () => {
    if (!selectedProspect) return;

    await deleteProspect(selectedProspect.id);
    toast.success("Le prospect a bien été supprimé !");
    await getProspectData();
    closeDeleteModal();
  };

  const handleMultipleDelete = async (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;

    for (const prospect of selectedRows) {
      await deleteProspect(prospect.id);
    }
    toast.success("Les prospects ont été supprimés !");
    await getProspectData();
  };

  const handleExportCsv = (selectedRows: Company[]) => {
    if (selectedRows.length === 0) return;

    const csvData = selectedRows.map(row => ({
      Name: row.name,
      Siren: row.siren,
      ActivitySector: row.activity_sector,
      Status: row.status,
      HeatLevel: row.heat_level,
    }));
    setCsvData(csvData);
    setIsCsvLinkVisible(true);
  };

  useEffect(() => {
    if (isCsvLinkVisible && csvLinkRef.current) {
      csvLinkRef.current.link.click();
      setIsCsvLinkVisible(false);
    }
  }, [isCsvLinkVisible, csvData]);

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
    <div className="flex-1 p-6">
      <div className='flex flex-col'>
        <div className="flex items-center mb-6">
          <div className='flex flex-col'>
            <div className='flex items-center'>
              <h2 className="text-3xl font-bold mb-2 mr-2 ">{company?.name}</h2>
              {company && <GrFormEdit
                onClick={() => handleOpenModal({ ...company, companyName: company.name })}
                className="text-2xl cursor-pointer text-stone-400"
              />}
            </div>
            <p className='text-black'>{company?.activity_sector}</p>
            <p className='text-stone-400'>{company?.description}</p>
          </div>
        </div>
      </div>
      <DataTable<Company>
        data={prospects}
        columns={columns}
        placeholder="Recherche"
        addButtonLabel="Ajouter un prospect"
        onChangeSearch={handleSearch}
        onAddButtonClick={() => openProspectModal()}
        handleDeleteClick={handleMultipleDelete}
        handleDownloadClick={handleExportCsv}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteProspect}
        message="Êtes-vous sûr de vouloir supprimer ce prospect ?"
      />
      {company && user && <AddFolderModal
        isOpen={isModalOpenFolder}
        onRequestClose={handleCloseModalFolder}
        onSubmit={handleCreateFolder}
        defaultValues={{...company, companyName: company?.name}}
        role={user?.role}
      />}
      {company && <AddProspectModal
        isOpen={isProspectModalOpen}
        onRequestClose={closeProspectModal}
        onSubmit={handleCreateProspect}
        company={company}
      />}
      <CSVLink
        data={csvData}
        filename={"prospects.csv"}
        className="hidden"
        ref={csvLinkRef}
        target="_blank"
      >
        Télécharger CSV
      </CSVLink>
    </div>
  );
};

export default ProspectList;
