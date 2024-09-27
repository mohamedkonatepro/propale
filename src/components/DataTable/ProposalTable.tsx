import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { FaDownload, FaPlus } from "react-icons/fa";
import { LiaSortSolid } from "react-icons/lia";
import { DataTable } from '@/components/DataTable/DataTable';
import { Button } from '@/components/common/Button';
import { Proposal } from '@/types/models';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../common/DropdownMenu';
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/router';

type ProposalTableProps = {
  proposals: Proposal[];
  handleDownloadPdf: (proposal: Proposal) => void;
  handleDeleteClick: (proposalId: string) => void;
};

const ProposalTable: React.FC<ProposalTableProps> = ({ proposals, handleDownloadPdf, handleDeleteClick }) => {
  const router = useRouter();
  const handleEditClick = (proposal: Proposal) => {
    router.push(`/client-portal/proposal/${proposal.prospect_id}?proposalId=${proposal.id}`);
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "title",
      id: "title",
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
      cell: ({ row }) => <div className="capitalize">{row.getValue("title")}</div>,
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
          className='flex items-center justify-start w-full p-0'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Statut
          <LiaSortSolid className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
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
      cell: ({ row }) => <div>{format(new Date(row.getValue("created_at")), 'dd/MM/yyyy')}</div>,
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
      cell: ({ row }) => <div>{format(new Date(row.getValue("updated_at")), 'dd/MM/yyyy')}</div>,
    },
    {
      id: "download",
      enableHiding: false,
      cell: ({ row }) => (
        <Button className="bg-white text-blueCustom border border-blueCustom px-4 py-2 rounded-md hover:bg-blue-100" onClick={() => handleDownloadPdf(row.original)}>
          <div>Télécharger en PDF</div> <FaDownload className="h-4 w-4 ml-2" />
        </Button>
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
            <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDeleteClick(row.original.id)}>
              Supprimer
            </DropdownMenuItem>
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
