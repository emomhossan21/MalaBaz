import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-black mb-8 dark:text-white">Shipping Policy</h1>
      
      <div className="space-y-8 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">1. Delivery Coverage</h2>
          <p>
            MALABAZ currently delivers to all 64 districts within Bangladesh. We partner with reliable courier services (e.g., Pathao, Steadfast, RedX) to ensure your products reach you safely and on time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">2. Delivery Timeframes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Inside Dhaka:</strong> Delivery typically takes 1-2 business days.</li>
            <li><strong>Outside Dhaka:</strong> Delivery typically takes 3-5 business days.</li>
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            *Please note that delivery times may vary during public holidays, extreme weather conditions, or promotional campaigns.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">3. Shipping Charges</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Inside Dhaka:</strong> ৳60 - ৳80 (depending on package weight).</li>
            <li><strong>Outside Dhaka:</strong> ৳120 - ৳150 (depending on package weight and location).</li>
          </ul>
          <p className="mt-4">
            Shipping charges will be calculated and displayed at checkout before you complete your order.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">4. Order Tracking</h2>
          <p>
            Once your order is dispatched, you will receive a confirmation SMS/Email containing your tracking number and a link to track your package in real-time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">5. Cash on Delivery (COD)</h2>
          <p>
            We offer Cash on Delivery (COD) across Bangladesh. Please ensure you have the exact amount ready to pay the delivery executive upon receiving your parcel. For orders outside Dhaka, a partial advance payment may be required to confirm the order.
          </p>
        </section>
      </div>
    </div>
  );
}
