import { getRoleDisplayName, getRoleBadgeColor } from '../utils/roleHelper';

export const RoleBadge = ({ role }) => {
  if (!role) return null;

  const displayName = getRoleDisplayName(role);
  const colorClass = getRoleBadgeColor(role);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {displayName}
    </span>
  );
};

export default RoleBadge;

