"use client";
<<<<<<< HEAD
import {useState} from 'react'; import {MapPin,Navigation,Phone,Mail,Globe,ShieldCheck} from 'lucide-react';
const people=[['Dr. Maya Shah','Breast surgeon','Harbor Women’s Clinic','Delhi, India','+91 11 5550 0101','maya.shah@example.org','Demo listing'],['Dr. Anika Rao','Gynecologist','Bloom Health Centre','Mumbai, India','+91 22 5550 0102','anika.rao@example.org','Demo listing'],['Dr. Priya Menon','Radiologist','Northstar Imaging','Bengaluru, India','+91 80 5550 0103','priya.menon@example.org','Demo listing'],['Dr. Rhea Kapoor','Genetic counselor','Everwell Centre','Chennai, India','+91 44 5550 0104','rhea.kapoor@example.org','Demo listing']];
const options=['Breast surgeon','Gynecologist','Oncologist','Radiologist','Primary-care physician','Genetic counselor'];
export default function Specialists(){const [city,setCity]=useState('Delhi, India');const [specialty,setSpecialty]=useState('Breast surgeon');const [asked,setAsked]=useState(false);const query=`${specialty} near ${city}`;const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(query);const useLocation=()=>{setAsked(true);navigator.geolocation?.getCurrentPosition(()=>setCity('Current location (not saved)'),()=>setCity(''));};return <section className="max-w-5xl mx-auto"><span className="eyebrow">EXTERNAL SPECIALIST DIRECTORY</span><h1 className="text-4xl font-bold text-slate-800 mt-3">Find a specialist</h1><p className="text-slate-500 mt-2">Search shortcuts use public maps. Diagnex never shares your health records with providers.</p><div className="glass-panel p-6 mt-6 grid md:grid-cols-3 gap-3"><input className="input-field" value={city} onChange={e=>setCity(e.target.value)} placeholder="City, state, country" aria-label="City, state, country"/><select className="input-field" value={specialty} onChange={e=>setSpecialty(e.target.value)} aria-label="Specialty">{options.map(x=><option key={x}>{x}</option>)}</select><div className="flex gap-2"><button className="secondary flex-1" onClick={useLocation}><Navigation size={16}/> Use my location</button><a className="btn flex-1" href={maps} target="_blank"><MapPin size={16}/> Search Maps</a></div><p className="md:col-span-3 text-xs text-slate-500">{asked?'Browser location was requested only because you selected it. Diagnex does not store GPS coordinates.':'Location stays on your device unless you enter a city for this search.'} Selected search: <b>{query||'Choose a city'}</b></p></div><div className="grid md:grid-cols-2 gap-4 mt-6">{people.filter(x=>!specialty||x[1].toLowerCase()===specialty.toLowerCase()).map(x=><article className="glass-panel p-5" key={x[0]}><h2 className="font-semibold text-slate-800">{x[0]}</h2><p className="text-teal-700 text-sm">{x[1]} · {x[2]}</p><p className="text-sm text-slate-500 mt-3">{x[3]}<br/>Consultation hours: Mon–Fri, 9am–5pm<br/>Last updated: 14 Sep 2026 · {x[6]}</p><div className="flex flex-wrap gap-2 mt-4"><a className="secondary" href={'tel:'+x[4]}><Phone size={14}/>Call</a><a className="secondary" href={'mailto:'+x[5]}><Mail size={14}/>Email</a><a className="secondary" href="https://example.org" target="_blank"><Globe size={14}/>Website</a><a className="secondary" href={'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(x[2]+' '+x[3])} target="_blank"><MapPin size={14}/>Open in Maps</a></div></article>)}</div><p className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900 flex gap-2"><ShieldCheck size={19}/>Diagnex provides a search shortcut to external maps and does not verify provider availability, qualifications, pricing, insurance coverage, treatment options, or outcomes. Diagnex does not share your health records with providers.</p></section>}
=======

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
>>>>>>> bcc08286bf2bb7aa73724fd69d45e537e6fea233
