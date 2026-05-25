import React, { useEffect, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ShippingLabelModal({ order, onClose }: { order: any, onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch items ordered
    fetch(`/api/admin/orders/${order.id}/items`)
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error(err));

    // Fetch store contact details dynamically for waybill
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig(data);
        }
      })
      .catch(err => console.error(err));
  }, [order.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-label-content');
    if (!element) return;
    
    try {
      setDownloading(true);
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MALABEZ_Order_${order.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setDownloading(false);
    }
  };

  // Calculations for billing details
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = Math.max(0, order.total - subtotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:rounded-none print:shadow-none">
        
        {/* Header - Hidden on print */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden">
          <div>
            <h3 className="text-xl font-bold">Courier Waybill (Shipping Label)</h3>
            <p className="text-xs text-slate-400 mt-1">Generated and formatted automatically in high-contrast print layout</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={18} /> {downloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-[#b8860b] text-white rounded-xl font-bold hover:bg-[#9a700a] transition-colors flex items-center gap-2"
            >
              <Printer size={18} /> Print Waybill
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto print:overflow-visible print:p-0" id="printable-label">
          <div id="printable-label-content" className="border-4 border-double border-black p-6 max-w-[4.2in] mx-auto bg-white text-black font-sans leading-relaxed">
            
            {/* Top Logo & Barcode Grid - Properly aligned */}
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-[#b8860b]">MALABEZ</h1>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Premium Clothing & Lifestyle</p>
              </div>
              <div className="text-right">
                <div className="inline-block text-lg font-black bg-black text-white px-3 py-1 rounded">
                  {order.payment_method === 'cod' ? 'C.O.D.' : 'PAID'}
                </div>
              </div>
            </div>

            {/* Courier Waybill Barcode Section */}
            <div className="border border-black p-2 rounded mb-4 text-center bg-slate-50">
              <div className="text-xs font-bold uppercase tracking-wider mb-1">Waybill tracking no:</div>
              <div className="h-12 w-full bg-black flex items-center justify-center text-white font-mono text-xs tracking-[0.5rem] overflow-hidden relative">
                {/* Simulated high-quality barcode */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #000, #000 3px, #fff 3px, #fff 6px, #000 6px, #000 7px, #fff 7px, #fff 9px)',
                  backgroundSize: '100% 100%'
                }}></div>
              </div>
              <p className="text-[11px] font-mono mt-1 font-bold tracking-wider mb-0 text-black">#{order.id}</p>
            </div>

            {/* Dispatch details nicely aligned in box blocks */}
            <div className="grid grid-cols-2 gap-4 border border-black p-3 rounded mb-4 text-xs">
              <div className="border-r border-black/20 pr-3">
                <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 h-3">Sender Details:</p>
                <p className="font-extrabold text-black text-sm mb-1 leading-none">MALABEZ Store</p>
                <p className="text-[11px] text-slate-800 leading-tight mb-1">{config.contact_address || 'Dhaka, Bangladesh'}</p>
                <p className="text-[11px] font-bold text-black leading-none mt-1">📞 {config.contact_phone || '+880 1234 567890'}</p>
              </div>
              <div className="pl-1">
                <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-1 h-3">Receiver Details:</p>
                <p className="font-extrabold text-black text-sm mb-1 leading-none">{order.user_name || 'Guest Customer'}</p>
                <p className="text-[11px] text-slate-800 leading-tight mb-1">{order.shipping_address}</p>
                <p className="text-[11px] text-slate-800 leading-none">{order.city} - {order.zip_code}</p>
                <p className="text-[11px] font-extrabold text-black leading-none mt-2">📞 {order.payment_phone || 'N/A'}</p>
              </div>
            </div>

            {/* Metadata (Service order & payment details list) */}
            <div className="border border-black rounded p-3 mb-4 bg-slate-50 text-xs text-black">
              <div className="grid grid-cols-2 gap-y-1.5 font-medium">
                <div className="flex justify-between border-b border-slate-200 pb-1 mr-2">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Order Reference:</span>
                  <span className="font-bold">#{order.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Waybill Date:</span>
                  <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1 mr-2">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Service Type:</span>
                  <span className="font-bold">Standard Delivery</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase">Method:</span>
                  <span className="font-bold uppercase">{order.payment_method}</span>
                </div>
              </div>
            </div>

            {/* Serialized Items Table ("siriyale and laine rakha path") */}
            <div className="border border-black rounded overflow-hidden mb-4">
              <p className="text-[9px] font-bold uppercase text-white bg-black px-3 py-1">Order Items Details List (SL/Serial Order)</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[11px] text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-black text-black font-bold">
                      <th className="px-3 py-1.5 border-r border-black w-10 text-center">SL</th>
                      <th className="px-3 py-1.5 border-r border-black">Item Name</th>
                      <th className="px-3 py-1.5 border-r border-black text-center w-12">Qty</th>
                      <th className="px-3 py-1.5 text-right w-20">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/20 text-slate-900 font-medium">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 border-r border-black/20 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="px-3 py-1.5 border-r border-black/20 font-bold truncate max-w-[170px]">{item.product_name || 'Product Item'}</td>
                        <td className="px-3 py-1.5 border-r border-black/20 text-center">{item.quantity}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">৳{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price breakdown and Payable Cash details */}
            <div className="border border-black rounded p-3 mb-4 text-xs font-semibold">
              <div className="space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal Amount:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-200">
                  <span>Shipping Fee:</span>
                  <span>৳{deliveryCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-black pt-1">
                  <span>Grand Total:</span>
                  <span className="text-[#b8860b]">৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Courier instruction / COD status - highly helpful for deliveries */}
            {order.payment_method === 'cod' ? (
              <div className="border-2 border-black bg-[#b8860b]/10 text-black p-3 rounded text-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a700a] mb-0.5">Courier COD Instruction</p>
                <p className="text-lg font-black leading-tight text-slate-900">
                  Please Collect: <span className="text-xl underline">৳{order.total.toLocaleString()}</span> Cash
                </p>
              </div>
            ) : (
              <div className="border-2 border-green-600 bg-green-50 text-green-800 p-3 rounded text-center mb-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-0.5">Prepaid Status</p>
                <p className="text-lg font-black leading-tight text-green-700">
                  PAID ORDER - DO NOT COLLECT CASH
                </p>
                {order.transaction_id && (
                  <p className="text-[9px] font-mono mt-0.5">TrxID: {order.transaction_id}</p>
                )}
              </div>
            )}

            {/* Terms Footer */}
            <div className="text-center text-[8px] text-slate-400 mt-4 uppercase tracking-widest">
              Generated by MALABEZ Automated Waybill Engine
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-label, #printable-label * {
            visibility: visible;
          }
          #printable-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
