import { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable';
import Header from '@/components/layout/Header';
import { fetchCompaniesWithParentByProfileId, fetchCompanyById } from '@/services/companyService';
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
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import EditUserModal from '@/components/modals/EditUserModal';
import { toast } from 'react-toastify';
import { ROLES } from '@/constants/roles';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

interface UsersProps {}

const Users: React.FC<UsersProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [foldersCount, setFoldersCount] = useState<{ [key: string]: number }>({});
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [searchUser, setSearchUser] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && id) {
      getCompanyData();
    }
  }, [id, user, searchUser]);

  const getCompanyData = async () => {
    const companyData = await fetchCompanyById(id as string);
    setCompany(companyData);

    if (companyData) {
      const profileData = await fetchProfilesWithUserDetails(companyData.id, searchUser);
      setProfiles(profileData);

      const folderCounts: { [key: string]: number } = {};
      for (const profile of profileData) {
        const count = await getNbFolders(profile.id);
        folderCounts[profile.id] = count;
      }
      setFoldersCount(folderCounts);
    }
  };

  const getNbFolders = async (id: string): Promise<number> => {
    const companies = await fetchCompaniesWithParentByProfileId(id);
    return companies.length;
  };

  const handleEditUser = (userSelected: Profile) => {
    setSelectedUser(userSelected);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
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
    handleCloseEditModal();
    await getCompanyData();
    toast.success(`${data.firstname} ${data.lastname} à bien été modifié dans la liste.`);
  };

  const handleAddButtonClick = () => setIsModalOpen(true);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = (dataSearch: string) => setSearchUser(dataSearch);

  const handleCreateUser = async (formInputs: UserFormInputs) => {
    try {
      const result = await createUser(formInputs.email, formInputs.password);
      if (!result || typeof result === 'string') {
        return result;
      }

      const profileData = {
        ...formInputs,
        userId: result.id,
      };
      await createProfile(profileData);
      await associateProfileWithCompany(result.id, id as string);

      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`,
      });

      setIsModalOpen(false);
      await getCompanyData();
      toast.success(`${profileData.firstname} ${profileData.lastname} à bien été ajouté·e à la liste. Un email de confirmation à été envoyé à l'adresse indiquée.`);
    } catch (error) {
      console.log('Erreur de création d\'utilisateur:', error);
      toast.error(`Erreur lors de la création de l'utilisateur: ${formInputs.firstname} ${formInputs.lastname}`);
    }
  };

  const openDeleteModal = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserIdToDelete(null);
  };

  const handleDeleteUser = async () => {
    if (!userIdToDelete) return;

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userIdToDelete);

    if (error) {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      return;
    }

    await getCompanyData();
    toast.success("L'utilisateur a bien été supprimé !");
    closeDeleteModal();
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
    ...(user?.role !== ROLES.SALES
      ? [
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
          isOpen={isEditModalOpen}
          onRequestClose={handleCloseEditModal}
          onSubmit={handleSubmitEdit}
          defaultValues={selectedUser}
        />
      )}
      <AddUserModal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        onSubmit={handleCreateUser}
      />
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
        message={"Êtes-vous sûr de vouloir supprimer l'utilisateur ?"}
      />
    </div>
  );
};

export default Users;
