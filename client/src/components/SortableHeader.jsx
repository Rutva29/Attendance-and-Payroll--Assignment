import { IconChevronDown } from './icons';

// clickable th, chevron shows sort direction
export default function SortableHeader({ label, sortKey, sort, onSort, numeric }) {
  const isActive = sort.key === sortKey;
  return (
    <th className={numeric ? 'numeric' : ''}>
      <button type="button" className="th-sort" onClick={() => onSort(sortKey)}>
        {label}
        <IconChevronDown size={12} className={`th-sort-icon ${isActive ? 'active' : ''} ${isActive && sort.direction === 'asc' ? 'asc' : ''}`} />
      </button>
    </th>
  );
}
