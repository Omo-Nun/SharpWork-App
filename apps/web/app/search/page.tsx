import Link from 'next/link';

export default function SearchPage() {
  // Mock data for scaffolding purposes
  const artisans = [
    { id: '1', name: 'John Doe', skill: 'Plumber', distance: '2.5km', rating: 4.8 },
    { id: '2', name: 'Jane Smith', skill: 'Electrician', distance: '3.1km', rating: 4.9 },
    { id: '3', name: 'Mike Johnson', skill: 'Carpenter', distance: '5.0km', rating: 4.6 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Artisans Near You</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artisans.map(artisan => (
            <div key={artisan.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl">{artisan.name}</h3>
                  <p className="text-brand-green font-medium">{artisan.skill}</p>
                </div>
                <div className="flex items-center text-sm font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  ★ {artisan.rating}
                </div>
              </div>
              <p className="text-gray-500 mb-6 flex items-center">
                <span className="mr-2">📍</span> {artisan.distance} away
              </p>
              <Link href={`/book/${artisan.id}`} className="block w-full text-center bg-brand-black text-white py-2 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
