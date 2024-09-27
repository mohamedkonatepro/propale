import React from 'react';
import { GrFormEdit } from 'react-icons/gr';
import { Need, Item } from '@/types/models';

interface NeedContentProps {
  data: Need;
  id: string;
  onEdit: (item: Item) => void;
}

const NeedContent: React.FC<NeedContentProps> = ({ data, id, onEdit }) => {
  return (
    <div className="relative">
      {data.showName && <div className="font-bold">{data.name}</div>}
      {data.showPrice && <div className="font-bold">{`${data.price} €`}</div>}
      {data.quantity && <div>{`Nombre de J/H : ${data.quantity}`}</div>}
      <div>{`${data.description?.slice(0, 100)}${data.description && data.description.length > 100 ? '...' : ''}`}</div>
      <button
        onClick={() => onEdit({ ...data, id, type: 'need' } as unknown as Item)}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
      >
        <GrFormEdit className="text-xl" />
      </button>
    </div>
  );
};

export default NeedContent;