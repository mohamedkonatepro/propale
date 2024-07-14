import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { fetchCompaniesWithParentByProfileId, fetchCompanyById, fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { MdFolderOpen } from 'react-icons/md';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import { createProfile, fetchProfilesWithUserDetails } from '@/services/profileService';
import AddUserModal from '@/components/modals/AddUserModal';
import { userSchema } from '@/schemas/user';
import { z } from 'zod';
import { createUser } from '@/services/userService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import { supabase } from '@/lib/supabaseClient';

interface UsersProps {}

type DataModal = z.infer<typeof userSchema>;

const Users: React.FC<UsersProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [foldersCount, setFoldersCount] = useState<{ [key: string]: number }>({});
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getCompanyData = async () => {
    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);

    if (companyData) {
      const profileData = await fetchProfilesWithUserDetails(companyData.id);
      if (profileData) {
        setProfiles(profileData);

        const folderCounts: { [key: string]: number } = {};
        for (const profile of profileData) {
          const count = await getNbFolders(profile.id);
          folderCounts[profile.id] = count;
        }
        setFoldersCount(folderCounts);
      }
    }
  }

  useEffect(() => {
    if (user?.id) {
      getCompanyData();
    }
  }, [id, user]);

  const getNbFolders = async (id: string): Promise<number> => {
    const companies = await fetchCompaniesWithParentByProfileId(id);
    return companies.length;
  };

  const handleCreateUser = async (dataModal: DataModal) => {
    try {
      const user = await createUser(dataModal.email, dataModal.password);
      if (!user) return;
  
      await createProfile(user.id, dataModal);
      await associateProfileWithCompany(user.id, id as string);
  
      await supabase.auth.resetPasswordForEmail(dataModal.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/auth/reset-password`
      });
  
      setIsModalOpen(false);
      await getCompanyData();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleSearch = () => {
    // Logique pour gérer la recherche
  };

  const columns: ColumnDef<Profile>[] = [
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
      cell: ({ row }) => (
        <div className="lowercase text-center">{foldersCount[row.original.id] || 0}</div>
      ),
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
      <Header title={company?.name} subtitle="Utilisateurs" siren={company?.siren} />
      <DataTable<Profile>
        data={profiles}
        columns={columns}
        placeholder="Recherche"
        addButtonLabel="Ajouter un utilisateur"
        onAddButtonClick={handleAddButtonClick}
        onChangeSearch={handleSearch}
      />
      <AddUserModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default Users;
