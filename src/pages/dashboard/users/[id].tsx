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
    toast.success(`${data.firstname} ${data.lastname} à bien été modifié dans la liste.`)
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
      const result = await createUser(formInputs.email, formInputs.password);
      
      if (!result || typeof result === 'string') {
        return result;
      }
  
      const profileData = {
        ...formInputs,
        userId: result.id
      }
      await createProfile(profileData);
      await associateProfileWithCompany(result.id, id as string);
  
      await supabase.auth.resetPasswordForEmail(formInputs.email, {
        redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/reset-password`
      });
  
      setIsModalOpen(false);
      await getCompanyData();
      toast.success(`${profileData.firstname} ${profileData.lastname} à bien été ajouté·e à la liste. Un email de confirmation à été envoyé à l'adresse indiquée.`)
    } catch (error) {
      console.log('Erreur de création d\'utilisateur:', error);
      toast.error(`Erreur lors de la création de l'utilisateur: ${formInputs.firstname} ${formInputs.lastname}`)
    }
  };

  const handleSearch = async (dataSearch: string) => {
    setSearchUser(dataSearch);
  };

  const handleDeleteUser = async (userId: string) => {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      toast.error("Error lors de la suppréssion de l'utilisateur")
      return
    }

    await getCompanyData();
    toast.success("l'utilisateur à bien été créé !");
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
  ];

  if (user?.role !== ROLES.SALES) {
    columns.push({
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
            <DropdownMenuItem onClick={() => handleDeleteUser(row.original.id)}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

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
