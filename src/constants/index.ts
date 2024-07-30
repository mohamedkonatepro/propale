import { IoFlame, IoSnow, IoSunny } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';

export type Option = {
  label: string;
  value: string;
  color: string;
  icon?: IconType;
};

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
