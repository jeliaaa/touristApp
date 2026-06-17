import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Restaurants() {
  const supabase = await createClient();
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, description, capacity')
    .eq('is_active', true)
    .order('name');

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
      {error && <p className="text-sm text-red-500 mb-4">{error.message}</p>}
      <div className="flex flex-col gap-4">
        {restaurants?.map((r) => (
          <div key={r.id} className="bg-white rounded-xl shadow p-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg">{r.name}</h2>
              <p className="text-sm text-gray-500">{r.cuisine}</p>
              {r.description && <p className="text-xs text-gray-400 mt-1">{r.description}</p>}
            </div>
            <Link
              href={`/user/reserve/${r.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Reserve
            </Link>
          </div>
        ))}
        {!restaurants?.length && !error && (
          <p className="text-gray-500 text-sm">No restaurants available.</p>
        )}
      </div>
    </main>
  );
}
