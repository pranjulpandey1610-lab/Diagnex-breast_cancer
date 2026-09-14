"use client";

import { 
  MapPin,
  Phone,
  CalendarDays,
  Star,
  Search,
  CheckCircle2,
  Building,
  Clock,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [callingId, setCallingId] = useState<string | null>(null);
  const [callWaitTimes, setCallWaitTimes] = useState<Record<string, number>>({});
  
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Specialist | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

  const handleBookClick = (specialist: Specialist) => {
    setSelectedDoctor(specialist);
    setShowModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setBookingId(selectedDoctor.id);
    setShowModal(false);
    setTimeout(() => {
      setBookingId(null);
      setBooked(selectedDoctor.id);
    }, 1500);
  };

  const handleRequestCall = (id: string) => {
    setCallingId(id);
    setTimeout(() => {
      setCallingId(null);
      // Generate random wait time between 5 and 25 mins
      setCallWaitTimes(prev => ({...prev, [id]: Math.floor(Math.random() * 20) + 5}));
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

              <div className="flex flex-col gap-3 mt-auto">
                {callWaitTimes[specialist.id] ? (
                  <div className="bg-sky-50 text-sky-700 font-medium py-3 rounded-xl border border-sky-100 flex items-center justify-center gap-2 text-sm text-center px-4">
                    <Clock size={18} className="shrink-0" /> 
                    Dr. {specialist.full_name.split(' ').pop()} will connect in ~{callWaitTimes[specialist.id]} mins. Have your phone ready.
                  </div>
                ) : null}

                <div className="flex gap-3">
                  {booked === specialist.id ? (
                    <div className="flex-1 bg-emerald-500/10 text-emerald-600 font-bold py-2 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Appointment Confirmed
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleBookClick(specialist)}
                        disabled={bookingId === specialist.id || !!callWaitTimes[specialist.id]}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        {bookingId === specialist.id ? 'Confirming...' : (
                          <><CalendarDays size={16} /> Book Appt</>
                        )}
                      </button>
                      {!callWaitTimes[specialist.id] && (
                        <button 
                          onClick={() => handleRequestCall(specialist.id)}
                          disabled={callingId === specialist.id}
                          className="btn-secondary px-4 py-2 flex items-center gap-2 text-sm"
                        >
                          {callingId === specialist.id ? (
                            <Clock size={16} className="animate-spin" />
                          ) : (
                            <><Phone size={16} /> Request Call</>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Book Appointment</h2>
                  <p className="text-sm text-slate-500">{selectedDoctor.full_name}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Available Dates</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Oct 24', 'Oct 25', 'Oct 26'].map(date => (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${selectedDate === date ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Available Times</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['09:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:15 PM'].map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${selectedTime === time ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button 
                  onClick={handleConfirmBooking} 
                  disabled={!selectedDate || !selectedTime}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
