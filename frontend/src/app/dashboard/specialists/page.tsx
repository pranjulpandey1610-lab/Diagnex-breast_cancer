"use client";

import { motion } from 'framer-motion';
import { 
  MapPin,
  Phone,
  CalendarDays,
  Star,
  Search,
  CheckCircle2,
  Building
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

type Specialist = {
  id: string;
  full_name: string;
  specialty: string;
  clinic_name: string;
  verification_status: string;
  distance?: string; // Add mock distance since backend doesn't provide coords yet
  rating?: number; // Add mock rating
  image?: string;
};

export default function SpecialistsPage() {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booked, setBooked] = useState<string | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      setIsLoading(true);
      try {
        const query = search ? `?specialty=${encodeURIComponent(search)}` : '';
        const { data } = await api.get(`/specialists${query}`);
        setSpecialists(data.map((s: any) => ({
          ...s,
          distance: (Math.random() * 10 + 1).toFixed(1) + ' mi',
          rating: (Math.random() * 1 + 4).toFixed(1),
          image: s.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timer = setTimeout(() => {
      fetchSpecialists();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [search]);

  const handleBook = (id: string) => {
    setBookingId(id);
    setTimeout(() => {
      setBookingId(null);
      setBooked(id);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Find a Specialist</h1>
          <p className="text-slate-500">Connect with qualified professionals in your area.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or specialty..." 
            className="input-field pl-10 w-full md:w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-500">
            Searching network...
          </div>
        ) : specialists.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500">
            No specialists found matching your search.
          </div>
        ) : (
          specialists.map((specialist, i) => (
            <motion.div 
              key={specialist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-3xl flex flex-col h-full border border-slate-200 hover:border-[var(--color-primary-500)]/40 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                  {specialist.image}
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full text-xs font-bold border border-amber-500/20">
                  <Star size={12} fill="currentColor" /> {specialist.rating}
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{specialist.full_name}</h3>
                <p className="text-[var(--color-primary-600)] text-sm font-medium mb-4">{specialist.specialty}</p>
                
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-500 shrink-0" />
                    <span className="truncate">{specialist.clinic_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500 shrink-0" />
                    {specialist.distance} away
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                {booked === specialist.id ? (
                  <div className="flex-1 bg-emerald-500/10 text-emerald-600 font-bold py-2 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Request Sent
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleBook(specialist.id)}
                      disabled={bookingId === specialist.id}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      {bookingId === specialist.id ? 'Requesting...' : (
                        <><CalendarDays size={16} /> Book</>
                      )}
                    </button>
                    <button className="btn-secondary px-4 py-2">
                      <Phone size={16} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
