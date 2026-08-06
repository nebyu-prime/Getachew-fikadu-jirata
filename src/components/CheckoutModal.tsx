'use client';

import { useEffect, useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lottery: any;
  phoneFromUrl?: string | null;
}

export default function CheckoutModal({ isOpen, onClose, lottery, phoneFromUrl }: CheckoutModalProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState<'numbers' | 'details' | 'payment' | 'upload' | 'processing' | 'success'>('numbers');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [unavailableNumbers, setUnavailableNumbers] = useState<Set<number>>(new Set());
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [generatedTickets, setGeneratedTickets] = useState<string[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  useEffect(() => {
    console.log('CheckoutModal phoneFromUrl:', phoneFromUrl);
    if (phoneFromUrl) {
      setPhoneNumber(phoneFromUrl);
      // Clear any stored phone number to prioritize the new one from URL
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_phone');
      }
    }
  }, [phoneFromUrl]);

  const handleCopy = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const totalTickets = lottery.totalTickets || 3500;

  useEffect(() => {
    if (isOpen) {
      fetchUnavailableNumbers();
    }
  }, [isOpen, lottery.id]);

  const fetchUnavailableNumbers = async () => {
    setIsLoadingNumbers(true);
    try {
      const unavailable = new Set<number>();
      
      // Generate 90% random numbers as pre-sold (consistent per lottery)
      const soldCount = Math.floor(totalTickets * 0.90);
      const allNumbers = Array.from({ length: totalTickets }, (_, i) => i + 1);
      
      // Use lottery ID as seed for consistent random numbers
      const seed = lottery.id || lottery.$id || 'default';
      let seedValue = 0;
      for (let i = 0; i < seed.length; i++) {
        seedValue += seed.charCodeAt(i);
      }
      
      // Simple seeded random shuffle
      const shuffled = [...allNumbers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        const j = Math.floor((seedValue / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      const preSoldNumbers = shuffled.slice(0, soldCount);
      preSoldNumbers.forEach(num => unavailable.add(num));
      
      // Also fetch actually sold tickets from database
      if (typeof window !== 'undefined' && (window as any).Appwrite) {
        const { Client, Databases, Query } = (window as any).Appwrite;
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6765c172002d08b3b5b6');
        const databases = new Databases(client);

        const response = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6765f6f3001120e42a14',
          process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || '6765f9fb0002879b1a46',
          [
            Query.equal('carId', lottery.id || lottery.$id),
            Query.equal('status', ['Pending', 'Approved'])
          ]
        );

        response.documents.forEach((doc: any) => {
          const num = parseInt(doc.ticketNumber.replace('#', ''));
          if (!isNaN(num)) {
            unavailable.add(num);
          }
        });
      }
      
      setUnavailableNumbers(unavailable);
    } catch (error) {
      console.error('Error fetching unavailable numbers:', error);
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  const toggleNumber = (num: number) => {
    if (unavailableNumbers.has(num)) return;
    
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      } else if (prev.length < 10) {
        return [...prev, num];
      }
      return prev;
    });
  };

  const handleConfirmPurchase = async () => {
    setStep('processing');
    console.log('Starting ticket purchase...');

    try {
      if (typeof window !== 'undefined' && (window as any).Appwrite) {
        console.log('Appwrite available');
        const { Client, Databases, ID, Storage } = (window as any).Appwrite;
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6765c172002d08b3b5b6');
        const databases = new Databases(client);
        const storage = new Storage(client);

        console.log('Client initialized, uploading screenshot...');
        console.log('paymentProof file:', paymentProof);
        console.log('paymentProof size:', paymentProof?.size);
        console.log('paymentProof type:', paymentProof?.type);
        // Upload screenshot to storage
        let screenshotFileId = null;
        if (paymentProof) {
          try {
            console.log('Starting screenshot upload to bucket:', process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '6765f8a9003adaa6d724');
            const file = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '6765f8a9003adaa6d724',
              ID.unique(),
              paymentProof
            );
            screenshotFileId = file.$id;
            console.log('Screenshot uploaded successfully:', screenshotFileId);
          } catch (screenshotError) {
            console.error('Screenshot upload failed, continuing without screenshot:', screenshotError);
            console.error('Screenshot upload error details:', JSON.stringify(screenshotError, null, 2));
            // Continue without screenshot - don't fail the whole purchase
          }
        } else {
          console.log('No paymentProof file selected');
        }

        console.log('Creating ticket documents...');
        const newTickets: string[] = [];
        for (const num of selectedNumbers) {
          const ticketNumber = `#${num}`;
          newTickets.push(ticketNumber);

          console.log('Creating ticket:', ticketNumber);
          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6765f6f3001120e42a14',
            process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || '6765f9fb0002879b1a46',
            ID.unique(),
            {
              fullName,
              phone: phoneNumber,
              ticketNumber,
              status: 'Pending',
              paymentMethod,
              carId: lottery.id,
              carName: lottery.carName,
              screenshot: screenshotFileId,
            }
          );
          console.log('Ticket created:', ticketNumber);
        }

        // Save user phone number for notifications
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_phone', phoneNumber);
        }

        setGeneratedTickets(newTickets);
        setStep('success');
      } else {
        alert('Appwrite is not available. Please check your connection.');
        setStep('upload');
      }
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert('Failed to purchase tickets. Please try again. Check console for details.');
      setStep('upload');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 p-6 text-white">
        {step === 'numbers' && (
          <>
            <h2 className="mb-4 text-2xl font-black">Select Your Lucky Numbers</h2>
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-slate-400">Selected: {selectedNumbers.length}/10</span>
              <span className="text-slate-400">Available: {totalTickets - unavailableNumbers.size}</span>
            </div>
            
            {isLoadingNumbers ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
              </div>
            ) : (
              <div className="mb-4 grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                {Array.from({ length: totalTickets }, (_, i) => i + 1).map((num) => {
                  const isSelected = selectedNumbers.includes(num);
                  const isUnavailable = unavailableNumbers.has(num);

                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(num)}
                      disabled={isUnavailable}
                      className={`
                        aspect-square rounded border text-xs font-bold transition-all
                        ${isSelected
                          ? 'bg-red-500 border-red-400 text-white scale-110'
                          : isUnavailable
                          ? 'bg-red-500 border-red-400 text-white cursor-not-allowed opacity-50'
                          : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20 hover:border-white/30'
                        }
                      `}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">Total Amount</p>
              <p className="text-3xl font-black text-yellow-400">
                {selectedNumbers.length * lottery.ticketPrice} ETB
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setStep('details')}
                disabled={selectedNumbers.length === 0}
                className="w-full rounded-xl bg-yellow-400 py-4 font-black text-slate-950 disabled:opacity-50"
              >
                Continue ({selectedNumbers.length} tickets)
              </button>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <h2 className="mb-4 text-2xl font-black">{lottery.carName}</h2>
            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400">{selectedNumbers.length} Tickets × {lottery.ticketPrice} Birr</p>
              <p className="text-3xl font-black text-yellow-400 mt-1">
                {selectedNumbers.length * lottery.ticketPrice} Birr
              </p>
            </div>
            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400 mb-2">Your Ticket Number</p>
              <p className="text-2xl font-black text-white">#{selectedNumbers[0]}</p>
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm text-slate-400">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl bg-white/10 p-4 outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm text-slate-400">Phone Number</label>
              <input
                type="tel"
                placeholder="+2519xxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl bg-white/10 p-4 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('numbers')}
                className="flex-1 rounded-xl bg-white/10 py-4 font-bold"
              >
                Back
              </button>
              <button
                onClick={() => setStep('payment')}
                disabled={!fullName || !phoneNumber}
                className="flex-1 rounded-xl bg-yellow-400 py-4 font-black text-slate-950 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'payment' && (
          <>
            <h2 className="mb-4 text-2xl font-black">Select Payment Method</h2>
            <div className="space-y-3 mb-6">
              {['Telebirr', 'CBE Birr'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full rounded-xl p-4 text-left font-bold transition ${
                    paymentMethod === method
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 rounded-xl bg-white/10 py-4 font-bold"
              >
                Back
              </button>
              <button
                onClick={() => paymentMethod && setStep('upload')}
                disabled={!paymentMethod}
                className="flex-1 rounded-xl bg-yellow-400 py-4 font-black text-slate-950 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 'upload' && (
          <>
            <h2 className="mb-4 text-2xl font-black">Proof of Payment</h2>
            
            <div className="mb-6 rounded-xl bg-blue-900/30 border border-blue-500/30 p-4">
              <p className="mb-3 text-sm font-bold text-blue-300">Payment Details</p>
              {paymentMethod === 'Telebirr' ? (
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-2 font-bold text-yellow-400">Telebirr</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Name:</span>
                      <span className="text-sm font-bold text-yellow-400">Getachew fikadu</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Number:</span>
                      <button
                        onClick={() => handleCopy('+2510993136207', 'telebirr-number')}
                        className="flex items-center gap-2 text-sm font-bold text-yellow-400 hover:text-yellow-300"
                      >
                        {copiedItem === 'telebirr-number' ? (
                          <>
                            Copied!
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4 text-green-400"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </>
                        ) : (
                          <>
                            +2510993136207
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-white/5 p-3">
                  <p className="mb-2 font-bold text-yellow-400">Commercial Bank of Ethiopia</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Name:</span>
                      <span className="text-sm font-bold text-yellow-400">Getachew Fikadu Jirata</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Account Number:</span>
                      <button
                        onClick={() => handleCopy('1000772220317', 'cbe-account')}
                        className="flex items-center gap-2 text-sm font-bold text-yellow-400 hover:text-yellow-300"
                      >
                        {copiedItem === 'cbe-account' ? (
                          <>
                            Copied!
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4 text-green-400"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </>
                        ) : (
                          <>
                            1000772220317
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm text-slate-400">Upload Payment Receipt</label>
              <p className="mb-3 text-xs text-slate-400">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                className="w-full rounded-xl bg-white/10 p-4 outline-none"
              />
            </div>
            <p className="mb-6 text-sm text-slate-400">After transferring the money, upload your payment receipt or transaction screenshot.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('payment')}
                className="flex-1 rounded-xl bg-white/10 py-4 font-bold"
              >
                Back
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={!paymentProof}
                className="flex-1 rounded-xl bg-yellow-400 py-4 font-black text-slate-950 disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
            <p className="text-xl font-bold">Processing your purchase...</p>
          </div>
        )}

        {step === 'success' && (
          <>
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 text-6xl">✅</div>
              <h2 className="mb-2 text-2xl font-black">Purchase Successful!</h2>
              <p className="text-slate-400">Your tickets have been purchased</p>
            </div>
            <div className="mb-6 rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-400 mb-2">Your Lucky Numbers:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {generatedTickets.map((ticket) => (
                  <span key={ticket} className="inline-block px-3 py-1 rounded-lg bg-yellow-400/20 text-yellow-400 font-bold">
                    {ticket}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-yellow-400 py-4 font-black text-slate-950"
            >
              Done
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
