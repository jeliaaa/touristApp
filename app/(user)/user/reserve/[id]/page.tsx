import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ReserveForm from './ReserveForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReservePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, description, capacity')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !restaurant) notFound();

  return (
    <main className="min-h-screen p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
      <p className="text-sm text-gray-500 mb-6">{restaurant.cuisine} · Capacity: {restaurant.capacity}</p>
      <ReserveForm restaurantId={restaurant.id} restaurantName={restaurant.name} />
    </main>
  );
}
