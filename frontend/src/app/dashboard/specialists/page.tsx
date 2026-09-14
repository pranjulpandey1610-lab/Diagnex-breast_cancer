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
import { useState } from 'react';

const specialists = [
  { id: 1, name: 'Dr. Sarah Chen', title: 'Breast Surgical Oncologist', distance: '2.4 mi', rating: 4.9, hospital: 'City Health Medical Center', image: 'SC' },
  { id: 2, name: 'Dr. Michael Roberts', title: 'Diagnostic Radiologist', distance: '3.1 mi', rating: 4.8, hospital: 'Northside Imaging Clinic', image: 'MR' },
  { id: 3, name: 'Dr. Emily Watson', title: 'Medical Oncologist', distance: '5.0 mi', rating: 4.9, hospital: 'Comprehensive Cancer Care', image: 'EW' }
];

export default function SpecialistsPage() {
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [booked, setBooked] = useState<number | null>(null);

  const handleBook = (id: number) => {
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
            type="text" 
            placeholder="Search by name or specialty..." 
            className="input-field pl-10 w-full md:w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialists.map((specialist, i) => (
          <motion.div 
            key={specialist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-3xl flex flex-col h-full border border-slate-200 hover:border-[var(--color-primary-500)]/40 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-xl font-bold text-slate-900 shadow-lg">
                {specialist.image}
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full text-xs font-bold border border-amber-500/20">
                <Star size={12} fill="currentColor" /> {specialist.rating}
              </div>
            </div>
            
            <div className="mb-6 flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{specialist.name}</h3>
              <p className="text-[var(--color-primary-400)] text-sm font-medium mb-4">{specialist.title}</p>
              
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-gray-500" />
                  {specialist.hospital}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-500" />
                  {specialist.distance} away
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              {booked === specialist.id ? (
                <div className="flex-1 bg-emerald-500/20 text-emerald-400 font-bold py-2 rounded-xl border border-emerald-500/30 flex items-center justify-center gap-2">
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
        ))}
      </div>
    </div>
  );
}
