'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadTickets = async () => {
    try {
      setLoading(true);
      if (typeof window === 'undefined' || !(window as any).Appwrite) {
        return;
      }

      const { Client, Databases, Query, Storage } = (window as any).Appwrite;

      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim()!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim()!);

      const databases = new Databases(client);
      const storage = new Storage(client);

      const response = await (databases as any).listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim()!,
        process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim()!,
        [
          Query.equal('status', 'Pending')
        ]
      );

      const formattedTickets = [];

      for (const ticket of response.documents) {
        console.log('Processing ticket:', ticket.$id, 'screenshot field:', ticket.screenshot);
        let screenshotUrl = null;
        if (ticket.screenshot) {
          try {
            console.log('Fetching screenshot for ticket:', ticket.$id, 'fileId:', ticket.screenshot);
            screenshotUrl = await storage.getFileView(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID?.trim() || '6a76564800384f6aa185',
              ticket.screenshot
            );
            console.log('Screenshot URL fetched:', screenshotUrl);
          } catch (error) {
            console.error('Error fetching screenshot for ticket:', ticket.$id, error);
          }
        } else {
          console.log('No screenshot field for ticket:', ticket.$id);
        }

        formattedTickets.push({
          id: ticket.$id,
          fullName: ticket.fullName || 'N/A',
          phone: ticket.phone,
          ticketNumber: ticket.ticketNumber,
          paymentMethod: ticket.paymentMethod,
          screenshot: ticket.screenshot || null,
          carId: ticket.carId,
          carName: ticket.carName,
          status: ticket.status,
          screenshotUrl
        });
      }

      console.log('Formatted tickets from Appwrite:', formattedTickets);
      setTickets(formattedTickets);
    } catch (error) {
      console.error('Load pending tickets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, carId?: string) => {
    try {
      const { Client, Databases } = (window as any).Appwrite;

      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim()!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim()!);

      const databases = new Databases(client);

      await (databases as any).updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim()!,
        process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim()!,
        id,
        {
          status: status
        }
      );

      loadTickets();

      setNotification({
        type: 'success',
        message: `Ticket ${status === 'Approved' ? 'approved' : 'rejected'} successfully`
      });

      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Update status error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update ticket status'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    router.push('/admin/login');
  };

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isAdminLoggedIn) {
      router.push('/admin/login');
      return;
    }
    loadTickets();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin/cars')}
              className="px-6 py-3 bg-yellow-400 text-slate-950 font-bold rounded-lg hover:bg-yellow-300"
            >
              Add Car
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Pending Payment Verifications</h2>
          {tickets.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400">No pending tickets to verify</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-slate-800 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Full Name</p>
                      <p className="font-bold">{ticket.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Phone</p>
                      <p className="font-bold">{ticket.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Ticket Number</p>
                      <p className="font-bold">{ticket.ticketNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Payment Method</p>
                      <p className="font-bold">{ticket.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Car Name</p>
                      <p className="font-bold">{ticket.carName}</p>
                    </div>
                  </div>

                  {ticket.screenshotUrl && (
                    <img
                      src={ticket.screenshotUrl}
                      alt="payment screenshot"
                      className="mt-4 h-64 w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => updateStatus(ticket.id, 'Approved', ticket.carId)}
                      className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(ticket.id, 'Rejected', ticket.carId)}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
