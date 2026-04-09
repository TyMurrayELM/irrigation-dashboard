import { Droplets, TreePine } from 'lucide-react';

export const zoneTypeIcons = {
  turf: { icon: Droplets, className: 'w-5 h-5 text-green-500' },
  shrubs: { icon: TreePine, className: 'w-5 h-5 text-emerald-600' },
  trees: { icon: TreePine, className: 'w-5 h-5 text-green-700' }
};

const unknownZoneIcon = { icon: Droplets, className: 'w-5 h-5 text-gray-400' };

export function getZoneIcon(type) {
  const config = zoneTypeIcons[type] || unknownZoneIcon;
  const Icon = config.icon;
  return <Icon className={config.className} />;
}