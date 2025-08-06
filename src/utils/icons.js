import { Droplets, TreePine } from 'lucide-react';

export const zoneTypeIcons = {
  turf: { icon: Droplets, className: 'w-5 h-5 text-green-500' },
  shrubs: { icon: TreePine, className: 'w-5 h-5 text-emerald-600' },
  trees: { icon: TreePine, className: 'w-5 h-5 text-green-700' }
};

export function getZoneIcon(type) {
  const config = zoneTypeIcons[type] || zoneTypeIcons.turf;
  const Icon = config.icon;
  return <Icon className={config.className} />;
}