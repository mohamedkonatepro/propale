import { useCallback } from 'react';
import { Item } from '@/types/models';
import { DropResult } from 'react-beautiful-dnd';

export const useDragAndDrop = (
  leftColumn: Item[], 
  setLeftColumn: React.Dispatch<React.SetStateAction<Item[]>>, 
  rightColumn: Item[], 
  setRightColumn: React.Dispatch<React.SetStateAction<Item[]>>
) => {
  const onDragEnd = useCallback((result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId === 'leftColumn' ? leftColumn : rightColumn;
    const destColumn = destination.droppableId === 'leftColumn' ? leftColumn : rightColumn;

    const newSourceColumn = Array.from(sourceColumn);
    const newDestColumn = Array.from(destColumn);

    const [movedItem] = newSourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      newSourceColumn.splice(destination.index, 0, movedItem);

      if (source.droppableId === 'leftColumn') {
        setLeftColumn(newSourceColumn);
      } else {
        setRightColumn(enforceRightColumnConstraints(newSourceColumn));
      }
    } else {
      if (destination.droppableId === 'leftColumn') {
        if (movedItem.type !== 'header' && movedItem.type !== 'price') {
          newDestColumn.splice(destination.index, 0, movedItem);
          setLeftColumn(newDestColumn);
          const updatedRightColumn = rightColumn.filter(item => item.id !== movedItem.id);
          setRightColumn(enforceRightColumnConstraints(updatedRightColumn));
        } else {
          return;
        }
      } else {
        if (canMoveToRightColumn(movedItem, newDestColumn, destination.index)) {
          newDestColumn.splice(destination.index, 0, movedItem);
          setLeftColumn(newSourceColumn);
          setRightColumn(enforceRightColumnConstraints(newDestColumn));
        } else {
          return;
        }
      }
    }
  }, [leftColumn, rightColumn]);

  return { onDragEnd };
};

export const enforceRightColumnConstraints = (items: Item[]): Item[] => {
  const header = items.find(item => item.type === 'header');
  const description = items.find(item => item.type === 'description');
  const price = items.find(item => item.type === 'price');
  const needs = items.filter(item => item.type === 'need');
  const paragraphs = items.filter(item => item.type === 'paragraph');
  const others = items.filter(item => !['header', 'description', 'price', 'need', 'paragraph'].includes(item.type));

  return [
    header,
    description,
    ...needs,
    price,
    ...paragraphs,
    ...others
  ].filter(Boolean) as Item[];
};

const canMoveToRightColumn = (item: Item, destColumn: Item[], destIndex: number): boolean => {
  const headerIndex = destColumn.findIndex(i => i.type === 'header');
  const descriptionIndex = destColumn.findIndex(i => i.type === 'description');
  const priceIndex = destColumn.findIndex(i => i.type === 'price');
  const firstNeedIndex = destColumn.findIndex(i => i.type === 'need');
  const lastNeedIndex = destColumn.findLastIndex(i => i.type === 'need');
  const firstParagraphIndex = destColumn.findIndex(i => i.type === 'paragraph');

  if (item.type === 'description') {
    return destIndex === headerIndex + 1;
  } else if (item.type === 'need') {
    if (firstNeedIndex === -1) {
      return destIndex === (descriptionIndex !== -1 ? descriptionIndex + 1 : headerIndex + 1);
    }
    return destIndex > headerIndex && destIndex <= Math.max(lastNeedIndex + 1, priceIndex);
  } else if (item.type === 'paragraph') {
    if (firstParagraphIndex === -1) {
      return destIndex === priceIndex + 1;
    }
    return destIndex > priceIndex;
  }

  return false;
};