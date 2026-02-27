import React, { useEffect, useState } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ShippingLabelModal({ order, onClose }: { order: any, onClose: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${order.id}/items`)
      .then(res => res.json())
      .then(data => setItems(data))
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
      pdf.save(`MALABAZ_Order_${order.id}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:rounded-none print:shadow-none">
        
        {/* Header - Hidden on print */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 print:hidden">
          <h3 className="text-xl font-bold">Shipping Label</h3>
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
              <Printer size={18} /> Print Label
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto print:overflow-visible print:p-0" id="printable-label">
          <div id="printable-label-content" className="border-2 border-black p-6 max-w-[4in] mx-auto bg-white text-black">
            
            {/* Top Section */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter">MALABAZ</h1>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black border-2 border-black px-2 py-1">
                  {order.payment_method === 'cod' ? 'COD' : 'PAID'}
                </div>
              </div>
            </div>

            {/* Shipper & Receiver */}
            <div className="grid grid-cols-2 gap-4 border-b-2 border-black pb-4 mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-black">From:</p>
                <p className="font-bold text-sm text-black">Malabaz Store</p>
                <p className="text-xs text-black">Dhaka, Bangladesh</p>
                <p className="text-xs text-black">Phone: +880 1234 567890</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-black">To:</p>
                <p className="font-bold text-sm text-black">{order.user_name || 'Guest'}</p>
                <p className="text-xs text-black">{order.shipping_address}</p>
                <p className="text-xs text-black">{order.city} - {order.zip_code}</p>
                <p className="text-xs font-bold mt-1 text-black">Phone: {order.payment_phone || 'N/A'}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="border-b-2 border-black pb-4 mb-4">
              <div className="flex justify-between text-xs mb-2 text-black">
                <span className="font-bold">Order ID:</span>
                <span>#{order.id}</span>
              </div>
              <div className="flex justify-between text-xs mb-2 text-black">
                <span className="font-bold">Date:</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs mb-2 text-black">
                <span className="font-bold">Payment:</span>
                <span className="uppercase">{order.payment_method}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-b-2 border-black pb-4 mb-4">
              <p className="text-[10px] font-bold uppercase text-black mb-2">Description:</p>
              <div className="space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-black">
                    <span className="truncate pr-2">{item.quantity}x {item.product_name || 'Product'}</span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-black mb-6 text-black">
              <span>TOTAL:</span>
              <span>৳{order.total.toLocaleString()}</span>
            </div>

            {/* Barcode Placeholder */}
            <div className="text-center">
              <div className="h-16 w-full bg-black flex items-center justify-center text-white font-mono text-xs tracking-[0.5em] overflow-hidden relative">
                {/* Fake barcode lines using repeating linear gradient */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px, transparent 4px, transparent 5px, white 5px, white 8px)',
                  backgroundSize: '100% 100%'
                }}></div>
              </div>
              <p className="text-xs font-mono mt-1 tracking-widest">{order.id}-{Date.now().toString().slice(-6)}</p>
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
