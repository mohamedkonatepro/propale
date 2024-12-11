import React, { useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { CellContext, ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, HeaderContext, Row, useReactTable } from "@tanstack/react-table";
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
import { DbCompanySettings } from '@/types/dbTypes';
import { getOption } from '@/lib/utils';
import { hasAccessToAudit } from '@/constants/permissions';
import { fetchTopMostParentCompanyCompanyById } from '@/services/companyService';
import { getStepperSession } from '@/services/stepperService';
import { fetchCompanySettings } from '@/services/companySettingsService';
import ProgressBar from '../common/ProgressBar';

interface ProspectsTableProps {
  prospects: Company[];
  handleSearch: (search: string) => void;
  openProspectModal: (data?: Company) => void;
  openDeleteModal: (prospectId: string) => void;
  handleMultipleDelete: (selectedRows: Company[]) => void;
  handleExportCsv: (selectedRows: Company[]) => void;
  handleSendEmail: (selectedRows: Company[]) => void;
  openContactModal: (data?: Company) => void;
  settings: DbCompanySettings | null;
  user: Profile | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ProspectsTableRef {
  toggleAllRowsSelected: (value: boolean) => void;
  getSelectedRows: () => Company[];
}

const ProspectsTable = forwardRef<ProspectsTableRef, ProspectsTableProps>((props, ref) => {
  const {
    prospects,
    handleSearch,
    openContactModal,
    openProspectModal,
    openDeleteModal,
    handleMultipleDelete,
    handleExportCsv,
    handleSendEmail,
    settings,
    user,
    currentPage,
    totalPages,
    onPageChange
  } = props;

  const [contacts, setContacts] = useState<{ [key: string]: Profile[] }>({});
  const [rowSelection, setRowSelection] = useState({});
  
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

  const contactColumn = useMemo<ColumnDef<Company>>(() => ({
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
    cell: ({ row }) => (
      <Link href={`/client-portal/infos/${row.original.id}`}>
        <PrimaryContact companyId={row.original.id} />
      </Link>
    ),
  }), []);
  
  const workflowColumn = useMemo(() => {
    if (!hasAccessToAudit(user, settings)) return [];
    return [
      {
        id: "workflow",
        enableHiding: false,
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Workflow
            <LiaSortSolid className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => <WorkflowCell row={row} settings={settings} />,
      },
    ];
  }, [user, settings]);

  const columns: ColumnDef<Company>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }: HeaderContext<Company, unknown>) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: CellContext<Company, unknown>) => (
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
        <Link href={`/client-portal/infos/${row.original.id}`}>
          <div className="flex flex-col text-xs">
            <div className='text-sm'>{row.original.name}</div>
            <div className='text-stone-400'>
              {row.original.activity_sector && row.original.activity_sector.length > 20
                ? `${row.original.activity_sector.substring(0, 20)}...`
                : row.original.activity_sector}
            </div>
            <div className='text-stone-400'>SIREN: {row.original.siren}</div>
          </div>
        </Link>
      ),
    },
    contactColumn,
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
        const statusOption = getOption(row.getValue("status"), statuses);
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
        const heatLevelOption = getOption(row.getValue("heat_level"), heatLevels);
        return heatLevelOption ? (
          <Badge
            label={heatLevelOption.label}
            color={heatLevelOption.color}
            icon={heatLevelOption.icon ? <heatLevelOption.icon /> : null}
          />
        ) : null;
      },
    },
    ...workflowColumn,
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
  ], [contacts, rowSelection])


  const table = useReactTable({
    data: prospects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
  });
  
  useImperativeHandle(ref, () => ({
    toggleAllRowsSelected: (value: boolean) => table.toggleAllPageRowsSelected(value),
    getSelectedRows: () => {
      return table.getSelectedRowModel().rows.map((row: Row<Company>) => row.original);
    },
  }));
  

  const handleDeleteClick = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row: Row<Company>) => row.original);
    handleMultipleDelete(selectedRows);
  };

  const handleDownloadClick = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row: Row<Company>) => row.original);
    handleExportCsv(selectedRows);
  };

  const handleEmailClick = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row: Row<Company>) => row.original);
    handleSendEmail(selectedRows);
  };

  return (
    <DataTable<Company>
      data={prospects}
      columns={columns}
      placeholder="Recherche"
      addButtonLabel="Ajouter un prospect"
      onAddButtonClick={() => openProspectModal()}
      onChangeSearch={handleSearch}
      handleDeleteClick={handleDeleteClick}
      handleDownloadClick={handleDownloadClick}
      handleEmailClick={handleEmailClick}
      table={table}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />
  );
});

ProspectsTable.displayName = 'ProspectsTable';

export default ProspectsTable;

const WorkflowCell: React.FC<{ row: Row<Company>, settings: DbCompanySettings | null }> = ({ row, settings }) => {
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [workflowStatus, setWorkflowStatus] = useState<string>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowData = async () => {
      const companyId = row.original.id;
      try {
        const companyForSettings = await fetchTopMostParentCompanyCompanyById(companyId);
        if (companyForSettings) {
          const session = await getStepperSession(companyForSettings.id, companyId);
          if (session) {
            setWorkflowStatus(session.session.status);

            if (session.session.status === 'saved') {
              const settingsData = await fetchCompanySettings(companyForSettings.id);
              if (settingsData && settingsData.workflow) {
                const totalQuestions = settingsData.workflow.questions.length;
                const answeredQuestions = session.responses.length;
                const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
                setCompletionPercentage(percentage);
              }
            }
            if (session.session.status === 'completed') {
              setCompletionPercentage(100);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch workflow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowData();
  }, [row.original.id]);

  const getButtonText = () => {
    switch (workflowStatus) {
      case 'saved':
        return `Continuer l'audit ${completionPercentage}%`;
      case 'completed':
        return `Gérer la propale`;
      default:
        return `Démarrer l'audit`;
    }
  };

  const getHref = () => {
    return workflowStatus === 'completed'
      ? `/client-portal/proposal/${row.original.id}/list`
      : `/client-portal/workflow/${row.original.id}`;
  };

  if (loading) {
    return <div className="text-sm text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div>
      <Link href={getHref()} className={`whitespace-nowrap text-sm flex items-center justify-center text-white bg-blueCustom ${workflowStatus === 'saved' ? 'rounded-t-lg pt-2 pb-1' : 'rounded-lg py-2'} px-2 text-center`} rel="noopener noreferrer">
        {getButtonText()}
      </Link>
      {workflowStatus === 'saved' && (
        <ProgressBar percentage={completionPercentage} progressColor={"bg-green-500"} height={"h-1"} roundedClass={"rounded-b-lg"} />
      )}
    </div>
  );
};
