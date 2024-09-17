import React, { useEffect, useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { LiaSortSolid } from "react-icons/lia";
import { MoreVertical } from "lucide-react";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/common/DropdownMenu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { Company, Profile } from '@/types/models';
import { Checkbox } from '@/components/common/Checkbox';
import PrimaryContact from './Contacts/PrimaryContact';
import Badge from '../common/Badge';
import { heatLevels, statuses } from '@/constants';
import { fetchContactByCompanyId } from '@/services/profileService';
import ProfileAvatarGroup from '../common/ProfileAvatarGroup';
import Link from 'next/link';

type ProspectsTableProps = {
  prospects: Company[];
  handleSearch: (search: string) => void;
  openProspectModal: (data?: Company) => void;
  openDeleteModal: (prospectId: string) => void;
  handleMultipleDelete: (selectedRows: Company[]) => void;
  handleExportCsv: (selectedRows: Company[]) => void;
  openContactModal: (data?: Company) => void;
};

const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects, handleSearch, openContactModal, openProspectModal, openDeleteModal, handleMultipleDelete, handleExportCsv,
}) => {

  const [contacts, setContacts] = useState<{ [key: string]: Profile[] }>({});

  useEffect(() => {
    const fetchContacts = async () => {
      const contactData: { [key: string]: Profile[] } = {};
      for (const prospect of prospects) {
        const contact = await fetchContactByCompanyId(prospect.id);
        if (contact) {
          contactData[prospect.id] = contact;
        }
      }
      setContacts(contactData);
    };

    fetchContacts();
  }, [prospects]);
  
  const getStatusOption = (value: string) => statuses.find(status => status.value === value);
  const getHeatLevelOption = (value: string) => heatLevels.find(level => level.value === value);


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
        <div className="flex flex-col text-xs">
          <div className='text-sm'>{row.original.name}</div>
          <div className='text-stone-400'>{row.original.activity_sector}</div>
          <div className='text-stone-400'>SIREN: {row.original.siren}</div>
        </div>
      ),
    },
    {
      accessorKey: "contact",
      id: "contact",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contact principal
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <PrimaryContact companyId={row.original.id} />,
    },
    {
      accessorKey: "contacts_others",
      id: "contacts_others",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contacts
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {contacts[row.original.id] && (
            <ProfileAvatarGroup profiles={contacts[row.original.id]} maxDisplay={3} onButtonClick={() => openContactModal(row.original)} />
          )}
        </div>
      ),
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
      cell: ({ row }) => {
        const statusOption = getStatusOption(row.getValue("status"));
        return statusOption ? (
          <Badge
            label={statusOption.label}
            color={statusOption.color}
          />
        ) : null;
      },
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
      cell: ({ row }) => {
        const heatLevelOption = getHeatLevelOption(row.getValue("heat_level"));
        return heatLevelOption ? (
          <Badge
            label={heatLevelOption.label}
            color={heatLevelOption.color}
            icon={heatLevelOption.icon ? <heatLevelOption.icon /> : null}
          />
        ) : null;
      },
    },
    {
      accessorKey: "score",
      id: "score",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Score
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className='text-xs px-5 py-1 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-600'>
          <span>-</span>
        </div>
      ),
    },
    {
      id: "workflow",
      enableHiding: false,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workflow
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link 
          href={`/client-portal/audit/${row.original.id}`}
          className="text-sm flex items-center justify-center text-white bg-blueCustom py-2 px-2 rounded-lg text-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          {"Démarrer l'audit"}
        </Link>
      ),
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
            <DropdownMenuItem onClick={() => openProspectModal(row.original)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDeleteModal(row.original.id)}>
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable<Company>
      data={prospects}
      columns={columns}
      placeholder="Recherche"
      addButtonLabel="Ajouter un prospect"
      onAddButtonClick={openProspectModal}
      onChangeSearch={handleSearch}
      handleDeleteClick={handleMultipleDelete}
      handleDownloadClick={handleExportCsv}
    />
  );
};

export default ProspectsTable;
