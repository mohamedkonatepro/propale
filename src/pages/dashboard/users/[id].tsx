import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import { fetchCompaniesWithParentByProfileId, fetchCompanyById, fetchCompanyWithoutParentByProfileId } from '@/services/companyService';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { MdFolderOpen } from 'react-icons/md';
import { useRouter } from 'next/router';
import { useUser } from '@/context/userContext';
import { createProfile, fetchProfilesWithUserDetails, updateUserProfile } from '@/services/profileService';
import AddUserModal from '@/components/modals/AddUserModal';
import { UserFormInputs } from '@/schemas/user';
import { createUser } from '@/services/userService';
import { associateProfileWithCompany } from '@/services/companyProfileService';
import { supabase } from '@/lib/supabaseClient';
import EditUserModal from '@/components/modals/EditUserModal';

interface UsersProps {}

const Users: React.FC<UsersProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [foldersCount, setFoldersCount] = useState<{ [key: string]: number }>({});
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  const handleEditUser = (userSelected: Profile) => {
    setSelectedUser(userSelected);
    setIsModalOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setIsModalOpenEdit(false);
    setSelectedUser(null);
  };

  const handleSubmitEdit = async (data: Profile) => {
    if (user?.id) {
      const error = await updateUserProfile(data, user.id);
      if (error) {
        console.error('Error updating user profile:', error);
        return;
      }
    }
    handleCloseModalEdit();
    await getCompanyData();
  };

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
      const profileData = await fetchProfilesWithUserDetails(companyData.id, searchUser);
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
  };

  useEffect(() => {
    if (user?.id && id) {
      getCompanyData();
    }
  }, [id, user, searchUser]);

  const getNbFolders = async (id: string): Promise<number> => {
    const companies = await fetchCompaniesWithParentByProfileId(id);
    return companies.length;
  };

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const user = await createUser(formInputs.email, formInputs.password);
      if (!user) return;
  
      const profileData = {
        ...formInputs,
        userId: user.id
      }
      await createProfile(profileData);
      await associateProfileWithCompany(user.id, id as string);
  
      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`
      });
  
      setIsModalOpen(false);
      await getCompanyData();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSearch = async (dataSearch: string) => {
    setSearchUser(dataSearch);
  };

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
            <DropdownMenuItem onClick={() => handleEditUser(row.original)}>Modifier</DropdownMenuItem>
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
      {selectedUser && (
        <EditUserModal
          isOpen={isModalOpenEdit}
          onRequestClose={handleCloseModalEdit}
          onSubmit={handleSubmitEdit}
          defaultValues={selectedUser}
        />
      )}
      <AddUserModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default Users;
