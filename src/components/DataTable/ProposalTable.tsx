import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaDownload } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Proposal, ProposalStatus } from '@/types/models';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/router';
import { Option } from '@/constants';
import { getOption } from '@/lib/utils';
import { generatePdf } from '@/services/pdfService';
import { useUser } from '@/context/userContext';
import { ROLES } from '@/constants/roles';
import CustomDropdown from '../common/CustomDropdown';

const statusOptions: Option[] = [
  { label: 'En cours', value: 'draft', color: 'blue' },
  { label: 'Accepté', value: 'accepted', color: 'green' },
  { label: 'Refusé', value: 'refused', color: 'red' },
  { label: 'Proposé', value: 'proposed', color: 'orange' },
];

type ProposalTableProps = {
  proposals: Proposal[];
  handleDeleteClick: (proposalId: string) => void;
  handleStatusChange: (proposalId: string, newStatus: ProposalStatus['status']) => void;
};

const ProposalTable: React.FC<ProposalTableProps> = ({ proposals, handleDeleteClick, handleStatusChange }) => {
  const router = useRouter();
  const { user } = useUser();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEditClick = (proposal: Proposal) => {
    router.push(`/client-portal/proposal/${proposal.prospect_id}?proposalId=${proposal.id}`);
  };
  const handlePreviewClick = (proposal: Proposal) => {
    router.push(`/client-portal/proposal/${proposal.prospect_id}/preview/${proposal.id}`);
  };

  const handleDownloadPdf = async (proposal: Proposal) => {
    setLoadingId(proposal.id); // Set the current row to loading
    try {
      await generatePdf(`${process.env.NEXT_PUBLIC_URL}/proposals/${proposal.id}`);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setLoadingId(null); // Reset loading state after completion
    }
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "name",
      id: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center justify-start w-full p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom de la propale
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "total_price",
      id: "total_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className='flex items-center justify-start w-full p-0'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{`${row.getValue("total_price")} €`}</div>,
    },
    {
      accessorKey: "status",
      id: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className='flex items-center justify-center w-full p-0'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statut
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const status = getOption(row.getValue("status"), statusOptions);
        return (
          <CustomDropdown
            options={statusOptions}
            label=""
            selected={row.getValue("status")}
            onChange={(newStatus) => handleStatusChange(row.original.id, newStatus as ProposalStatus['status'])}
          />
        );
      },
    },
    {
      accessorKey: "created_at",
      id: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className='flex items-center justify-start w-full p-0'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date de création
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className='ml-4'>{format(new Date(row.getValue("created_at")), 'dd/MM/yyyy')}</div>,
    },
    {
      accessorKey: "updated_at",
      id: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className='flex items-center justify-start w-full p-0'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dernière modification
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className='ml-4'>{format(new Date(row.getValue("updated_at")), 'dd/MM/yyyy')}</div>,
    },
    ...(user?.role !== ROLES.PROSPECT
      ? [
          {
            id: "download",
            enableHiding: false,
            cell: ({ row }: any) => {
              const proposal = row.original;
              return (
                <Button
                  isLoading={loadingId === proposal.id} // Only show loading for the current row
                  disabled={loadingId === proposal.id}
                  className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
                  onClick={() => handleDownloadPdf(proposal)}
                >
                  <span>Télécharger en PDF</span> <FaDownload className="h-4 w-4 ml-2" />
                </Button>
              );
            },
          },
        ]
      : []),
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
            <DropdownMenuItem onClick={() => handlePreviewClick(row.original)}>
              Aperçu
            </DropdownMenuItem>
            {user?.role !== ROLES.PROSPECT && row.original.status !== "accepted" && "refused" ? <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
              Modifier
            </DropdownMenuItem> : ''}
            
            {user?.role !== ROLES.PROSPECT && <DropdownMenuItem onClick={() => handleDeleteClick(row.original.id)}>
              Supprimer
            </DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DataTable<Proposal>
      data={proposals}
      columns={columns}
    />
  );
};

export default ProposalTable;
