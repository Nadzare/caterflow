import { getClients } from '@/app/actions/clientActions';
import { ClientsList } from '@/components/clients/ClientsList';

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <ClientsList initialClients={clients as any[]} />
    </div>
  );
}


