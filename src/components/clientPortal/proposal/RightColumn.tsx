import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Switch } from '@/components/common/Switch';

interface Item {
  id: string;
  type: string;
  content: React.ReactNode;
}

interface RightColumnProps {
  items: Item[];
  switchEnabled: boolean;
  onSwitchChange: (value: boolean) => void;
}

const RightColumn: React.FC<RightColumnProps> = ({ items, switchEnabled, onSwitchChange }) => {
  return (
    <Droppable droppableId="rightColumn">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="bg-backgroundGray p-6 rounded-lg shadow-lg w-1/2 min-h-[400px] relative"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Proposition</h3>
          
          <div className={'mb-16'}>
            {items.map((item, index) => (
              <Draggable
                key={item.id}
                draggableId={item.id}
                index={index}
                isDragDisabled={item.type === 'header' || item.type === 'price'} 
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-4 rounded-md mb-3 shadow-sm"
                  >
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            
            {provided.placeholder}
          </div>

          {/* Element en bas de la colonne */}
          <div className="absolute bottom-0 left-0 w-full bg-white p-5 rounded-b-lg flex items-center justify-between">
            <div className='text-black'>
              Mention “Réalisé avec Propale”
            </div>
            {/* Switch component to toggle the display of this mention */}
            <Switch checked={switchEnabled} onCheckedChange={onSwitchChange} />
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default RightColumn;
