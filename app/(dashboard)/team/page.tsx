import { getTeamMembers } from '@/app/actions/userActions';
import { TeamList } from '@/components/team/TeamList';
import { RoleGuard } from '@/components/RoleGuard';

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <TeamList initialMembers={members as any[]} />
      </div>
    </RoleGuard>
  );
}
