import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/common/Button';
import { FaPlus } from "react-icons/fa";
import { CiTextAlignLeft } from "react-icons/ci";
import { MdLabelOutline } from "react-icons/md";

interface Item {
  id: string;
  content: React.ReactNode;
}

interface LeftColumnProps {
  items: Item[];
  showExtraButtons: boolean;
  onAddParagraph: () => void;
  onAddNeed: () => void;
  onToggleExtraButtons: (show: boolean) => void;
}
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0]?.includes('defaultProps')) return;
  originalError(...args);
};


const LeftColumn: React.FC<LeftColumnProps> = ({
  items,
  showExtraButtons,
  onAddParagraph,
  onAddNeed,
  onToggleExtraButtons,
  
}) => {
  return (
    <Droppable droppableId="leftColumn">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="bg-backgroundGray p-6 rounded-lg shadow-lg w-1/2 min-h-[400px] relative">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Besoins et Paragraphes</h3>

          <div className={`${showExtraButtons ? 'mb-36' : 'mb-16'}`}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="p-4 rounded-md mb-3 shadow-sm bg-white">
                    {item.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
          
          <div className="absolute bottom-5 left-5 flex flex-col space-y-2">
            {showExtraButtons ? (
              <>
                <Button onClick={onAddParagraph} className="bg-white text-blueCustom p-3 rounded shadow-xl w-fit flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors duration-200">
                  <CiTextAlignLeft className='text-xl mr-2'/> <div>Nouveau paragraphe</div> 
                </Button>
                <Button onClick={onAddNeed} className="bg-white text-blueCustom p-3 rounded shadow-xl w-fit flex items-center justify-center space-x-2 hover:bg-blue-100 transition-colors duration-200">
                  <MdLabelOutline className='text-xl mr-2'/> <div>Nouveau besoin</div> 
                </Button>
                <Button onClick={() => onToggleExtraButtons(false)} className="bg-white text-blueCustom p-4 text-base rounded shadow-xl w-fit hover:bg-blue-100 transition-colors duration-200">X</Button>
              </>
            ) : (
              <Button onClick={() => onToggleExtraButtons(true)} className="bg-blueCustom text-white p-4 rounded-xl shadow-2xl w-12 h-12 flex items-center justify-center hover:bg-blue-700">
                <FaPlus className="text-white text-lg" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default LeftColumn;