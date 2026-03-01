import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';

export default function ContactUs({ config }: { config: Record<string, string> }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8 dark:text-white text-center">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h2 className="text-2xl font-bold dark:text-white mb-6">Get in Touch</h2>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center shrink-0">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Phone</p>
              <a href={`tel:${config.contact_phone || '+8801234567890'}`} className="text-lg font-bold dark:text-white hover:text-blue-600 transition-colors">
                {config.contact_phone || '+880 1234 567890'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Email</p>
              <a href={`mailto:${config.contact_email || 'support@malabez.com'}`} className="text-lg font-bold dark:text-white hover:text-purple-600 transition-colors">
                {config.contact_email || 'support@malabez.com'}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shrink-0">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Address</p>
              <p className="text-lg font-bold dark:text-white">
                {config.contact_address || 'Dhaka, Bangladesh'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6">
          <h2 className="text-2xl font-bold dark:text-white mb-6">Social Media</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Follow us on social media for the latest updates, offers, and new arrivals!
          </p>
          
          <div className="space-y-4">
            {config.contact_facebook && (
              <a href={config.contact_facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                <Facebook size={24} className="text-blue-600" />
                <span className="font-bold dark:text-white">Facebook Page</span>
              </a>
            )}
            {config.contact_instagram && (
              <a href={config.contact_instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                <Instagram size={24} className="text-pink-600" />
                <span className="font-bold dark:text-white">Instagram Profile</span>
              </a>
            )}
            {!config.contact_facebook && !config.contact_instagram && (
              <p className="text-slate-500 italic">No social media links configured yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
