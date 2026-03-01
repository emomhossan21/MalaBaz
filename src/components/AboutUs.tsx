import React from 'react';

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-black mb-8 dark:text-white text-center tracking-tight">About MALABEZ</h1>
      
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
          <p>
            Welcome to <strong className="text-[#b8860b]">MALABEZ</strong>, your number one source for premium traditional and modern wear in Bangladesh. We're dedicated to giving you the very best of clothing, with a focus on quality, customer service, and uniqueness.
          </p>
          <p>
            Founded with a passion for fashion and a commitment to excellence, MALABEZ has come a long way from its beginnings. When we first started out, our passion for providing the best quality clothing drove us to do intense research, so that MALABEZ can offer you the most premium products.
          </p>
          <p>
            We now serve customers all over Bangladesh and are thrilled that we're able to turn our passion into our own website. Whether you are looking for an elegant Saree, a traditional Panjabi, or modern casual wear, we have carefully curated our collections to meet your highest expectations.
          </p>
          <p>
            We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
          </p>
          
          <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="font-bold text-xl dark:text-white">Sincerely,</p>
            <p className="text-[#b8860b] font-black text-2xl mt-2">The MALABEZ Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
