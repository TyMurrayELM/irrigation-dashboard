import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function formatFrequency(frequency, days) {
  if (frequency === 'custom-days' && days && days.length > 0) {
    return days.join(', ');
  }
  return frequency.replace(/-/g, ' ');
}

export function getStatusColor(days) {
  if (days === null || days === undefined) return 'text-gray-400';
  if (days <= 7) return 'text-green-600';
  if (days <= 30) return 'text-yellow-600';
  return 'text-red-600';
}

export function getStatusIcon(days) {
  if (days === null || days === undefined) return AlertCircle;
  if (days <= 7) return CheckCircle;
  if (days <= 30) return Clock;
  return AlertCircle;
}

export function getUniqueValues(array, field) {
  return [...new Set(array.map(item => item[field]).filter(Boolean))].sort();
}