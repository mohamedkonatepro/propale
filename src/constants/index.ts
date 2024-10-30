import { IoFlame, IoSnow, IoSunny } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';

export type Color = 'blue' | 'orange' | 'red' | 'green' | 'gray';

export interface Option {
  label: string;
  value: string;
  color: Color;
  icon?: IconType;
}
export const heatLevels: Option[] = [
  { label: 'Froid', value: 'cold', color: 'blue', icon: IoSnow },
  { label: 'Tiède', value: 'warm', color: 'orange', icon: IoSunny },
  { label: 'Chaud', value: 'hot', color: 'red', icon: IoFlame },
];

export const statuses: Option[] = [
  { label: 'Nouveau', value: 'new', color: 'blue' },
  { label: 'Audit', value: 'audit', color: 'orange' },
  { label: 'Proposition', value: 'proposal', color: 'red' },
  { label: 'Conclu', value: 'concluded', color: 'green' },
  { label: 'Perdu', value: 'lost', color: 'gray' },
];

export const proposalStatusOptions: Option[] = [
  { label: 'En cours', value: 'draft', color: 'blue' },
  { label: 'Sélectionner', value: 'selected', color: 'gray' },
  { label: 'Accepté', value: 'accepted', color: 'green' },
  { label: 'Refusé', value: 'refused', color: 'red' },
  { label: 'Proposé', value: 'proposed', color: 'orange' },
];