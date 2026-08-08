'use client';

import { useState, useEffect } from 'react';

export default function AdminCarsPage() {
  const [formData, setFormData] = useState({
    carName: '',
    description: '',
    ticketPrice: '',
    totalTickets: '3500',
    drawDate: '',
    drawTime: '12:00',
    isActive: true,
    isFeatured: false,
    carPhoto: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cars, setCars] = useState<any[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);

  useEffect(() => {
    console.log('Admin cars page mounted, fetching cars...');
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoadingCars(true);
    try {
      if (typeof window !== 'undefined' && (window as any).Appwrite) {
        const { Client, Databases, Storage } = (window as any).Appwrite;
        
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim())
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim());
        
        const databases = new Databases(client);
        const storage = new Storage(client);

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim(),
          process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim()
        );

        console.log('Fetched raw documents from Appwrite:', response.documents);
        console.log('Total documents fetched:', response.documents.length);
        console.log('Document attributes:', response.documents.length > 0 ? Object.keys(response.documents[0]) : 'No documents');

        const formattedCars = response.documents.map((car: any) => {
          let photo = '';
          if (car.carPhoto) {
            photo = storage.getFileView(
              process.env.NEXT_PUBLIC_APPWRITE_CAR_STORAGE_BUCKET_ID?.trim(),
              car.carPhoto
            ).toString();
          }
          const formattedCar = {
            ...car,
            id: car.$id,
            carPhoto: photo,
          };
          console.log('Formatted car:', formattedCar);
          return formattedCar;
        });

        setCars(formattedCars);
        console.log('Fetched cars from Appwrite:', formattedCars);
      }
    } catch (error: any) {
      console.error('Error fetching cars from Appwrite:', error);
      // If there's an error, try to use localStorage as fallback
      const storedCars = localStorage.getItem('admin_cars');
      console.log('Checking localStorage for cars:', storedCars);
      if (storedCars) {
        try {
          const parsedCars = JSON.parse(storedCars);
          setCars(parsedCars);
          console.log('Loaded cars from localStorage:', parsedCars);
        } catch (e) {
          console.error('Error parsing stored cars:', e);
        }
      } else {
        console.log('No cars in localStorage');
      }
    } finally {
      setLoadingCars(false);
    }
  };

  const handleDeleteCar = async (carId: string, photoId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    // Always try to delete from localStorage first (for both local and Appwrite cars)
    const storedCars = localStorage.getItem('admin_cars');
    let localStorageDeleted = false;
    if (storedCars) {
      try {
        const allCars = JSON.parse(storedCars);
        const filteredCars = allCars.filter((car: any) => car.id !== carId);
        localStorage.setItem('admin_cars', JSON.stringify(filteredCars));
        setCars(filteredCars);
        localStorageDeleted = true;
      } catch (e) {
        console.error('Error deleting from localStorage:', e);
      }
    }

    // If it's a local car, we're done
    if (carId.startsWith('local_')) {
      setMessage(localStorageDeleted ? 'Car deleted successfully!' : 'Failed to delete car. Please try again.');
      return;
    }

    // For Appwrite cars, try to delete from Appwrite
    try {
      if (typeof window !== 'undefined' && (window as any).Appwrite) {
        const { Client, Databases, Storage } = (window as any).Appwrite;
        
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim())
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim());
        
        const databases = new Databases(client);
        const storage = new Storage(client);

        // Delete the document
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim(),
          process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim(),
          carId
        );

        // Delete the photo if it exists (ignore errors if photo deletion fails)
        if (photoId) {
          try {
            await storage.deleteFile(
              process.env.NEXT_PUBLIC_APPWRITE_CAR_STORAGE_BUCKET_ID?.trim(),
              photoId
            );
          } catch (photoError) {
            console.error('Error deleting photo (continuing anyway):', photoError);
          }
        }

        setMessage('Car deleted successfully!');
        fetchCars(); // Refresh the list
      } else {
        throw new Error('Appwrite not available');
      }
    } catch (error) {
      console.error('Error deleting car from Appwrite:', error);
      if (localStorageDeleted) {
        setMessage('Car deleted from local storage (Appwrite deletion failed).');
      } else {
        setMessage('Failed to delete car. Please try again.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, carPhoto: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (typeof window !== 'undefined' && (window as any).Appwrite) {
        const { Client, Databases, Storage, ID } = (window as any).Appwrite;
        
        // Use CAR PROJECT for car operations
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim())
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim());
        
        const databases = new Databases(client);
        const storage = new Storage(client);

        let photoFileId = '';

        if (formData.carPhoto) {
          try {
            const uploadedFile = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_CAR_STORAGE_BUCKET_ID?.trim(),
              ID.unique(),
              formData.carPhoto
            );
            photoFileId = uploadedFile.$id;
          } catch (uploadError) {
            console.error('File upload error:', uploadError);
            setMessage('Failed to upload photo. Please try again or continue without photo.');
            // Continue without photo if upload fails
          }
        }

        // Convert user's local time (UTC+3) to UTC and store as ISO string
        const [year, month, day] = formData.drawDate.split('-').map(Number);
        const [hours, minutes] = formData.drawTime.split(':').map(Number);
        // Subtract 3 hours to convert from UTC+3 to UTC
        const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 3, minutes, 0));
        const isoDate = utcDate.toISOString();
        console.log('Storing drawDate (UTC):', isoDate, 'Original local time:', formData.drawTime);

        const carDatabaseId = process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim();
        const lotteriesCollectionId = process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim();
        const carProjectId = process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim();
        
        const totalTickets = formData.totalTickets;
        
        // Truncate carName to 20 characters to meet Appwrite schema validation
        const truncatedCarName = formData.carName.substring(0, 20);
        
        console.log('Creating lottery document - Project:', carProjectId, 'Database:', carDatabaseId, 'Collection:', lotteriesCollectionId);
        console.log('Document data:', {
          carName: truncatedCarName,
          description: formData.description,
          ticketPrice: Number(formData.ticketPrice),
          totalTickets: totalTickets,
          drawDate: isoDate,
          carPhoto: photoFileId,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        });
        
        const carDocument = await databases.createDocument(
          carDatabaseId,
          lotteriesCollectionId,
          ID.unique(),
          {
            carName: truncatedCarName,
            description: formData.description,
            ticketPrice: parseInt(formData.ticketPrice),
            totalTickets: parseInt(formData.totalTickets),
            drawDate: isoDate,
            carPhoto: photoFileId,
            isActive: formData.isActive,
            isFeatured: formData.isFeatured,
          }
        );
        
        console.log(`Created car with ${totalTickets} total tickets`);
        console.log('Created car document:', carDocument);

        setMessage('Car added successfully to database!');
        console.log('Car upload successful, calling fetchCars to refresh list');
        setFormData({
          carName: '',
          description: '',
          ticketPrice: '',
          totalTickets: '3500',
          drawDate: '',
          drawTime: '12:00',
          isActive: true,
          isFeatured: false,
          carPhoto: null,
        });
        
        fetchCars(); // Refresh the list
      }
    } catch (error: any) {
      console.error('Error adding car:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Show more detailed error message
      let errorMessage = 'Failed to add car to database. ';
      if (error?.message) {
        errorMessage += `Error: ${error.message}`;
      }
      if (error?.code) {
        errorMessage += ` (Code: ${error.code})`;
      }
      setMessage(errorMessage);
      
      // Try to save to localStorage as fallback if database fails
      try {
        const newCar = {
          id: 'local_' + Date.now(),
          carName: formData.carName,
          description: formData.description,
          ticketPrice: Number(formData.ticketPrice),
          totalTickets: Number(formData.totalTickets),
          drawDate: formData.drawDate,
          drawTime: formData.drawTime,
          carPhoto: photoFileId,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        };
        const storedCars = localStorage.getItem('admin_cars');
        const allCars = storedCars ? JSON.parse(storedCars) : [];
        allCars.push(newCar);
        localStorage.setItem('admin_cars', JSON.stringify(allCars));
        console.log('Car saved to localStorage as fallback');
        setMessage(errorMessage + ' (Saved locally as fallback)');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#071a14] p-5 pb-32 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-black text-yellow-300">
          Add New Car
        </h1>
        <div className="flex gap-3 mb-6">
          <a
            href="/admin/verify"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
          >
            Verify Payments
          </a>
          <a
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
          >
            Home
          </a>
          <button
            onClick={() => {
              document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              window.location.href = '/admin/login';
            }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20 transition-all"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">
              Car Name
            </label>
            <input
              type="text"
              required
              value={formData.carName}
              onChange={(e) => setFormData({ ...formData, carName: e.target.value })}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50"
              placeholder="e.g., Toyota Land Cruiser"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50 resize-none"
              placeholder="Car description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Ticket Price (ETB)
              </label>
              <input
                type="number"
                required
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Total Tickets
              </label>
              <input
                type="number"
                required
                value={formData.totalTickets}
                onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50"
                placeholder="3500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Draw Date
              </label>
              <input
                type="date"
                required
                value={formData.drawDate}
                onChange={(e) => setFormData({ ...formData, drawDate: e.target.value })}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-300">
                Draw Time
              </label>
              <input
                type="time"
                required
                value={formData.drawTime}
                onChange={(e) => setFormData({ ...formData, drawTime: e.target.value })}
                className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-300">
              Car Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-yellow-400/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-400/20 file:text-yellow-300 file:cursor-pointer"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-white/5 accent-yellow-400"
              />
              <span className="text-sm text-slate-300">Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-white/5 accent-yellow-400"
              />
              <span className="text-sm text-slate-300">Featured</span>
            </label>
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-center font-semibold ${
              message.includes('success') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {message}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 py-4 font-black text-slate-950 shadow-lg hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
            >
              {loading ? 'Adding Car...' : 'Add Car'}
            </button>
          </div>
        </form>

        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-yellow-300">
              Existing Cars ({cars.length})
            </h2>
            <button
              onClick={fetchCars}
              disabled={loadingCars}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {loadingCars ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="space-y-4">
            {loadingCars && cars.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-8 text-center text-slate-400">
                Loading cars...
              </div>
            ) : cars.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-8 text-center text-slate-400">
                No cars added yet
              </div>
            ) : (
              cars.map((car) => (
                <div
                  key={car.id}
                  className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/10"
                >
                  {car.carPhoto && (
                    <img
                      src={car.carPhoto}
                      alt={car.carName}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{car.carName}</h3>
                    <p className="text-sm text-slate-400">{car.description}</p>
                    <div className="mt-2 flex gap-4 text-xs text-slate-300">
                      <span>Price: {car.ticketPrice} ETB</span>
                      <span>Tickets: {car.totalTickets}</span>
                      <span>Draw: {car.drawDate} {car.drawTime || '12:00'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCar(car.id, car.carPhoto)}
                    className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
