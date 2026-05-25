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
    const container = document.getElementById('printable-label');
    if (!element || !container) return;
    
    try {
      setDownloading(true);
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          // Temporarily fix oklch colors for html2canvas
          const elems = doc.querySelectorAll('*');
          elems.forEach((el) => {
            const computed = window.getComputedStyle(el);
            if (computed && computed.backgroundColor && computed.backgroundColor.includes('oklch')) {
              (el as HTMLElement).style.backgroundColor = '#ffffff';
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const maxPdfWidth = pdf.internal.pageSize.getWidth();
      const maxPdfHeight = pdf.internal.pageSize.getHeight();
      
      // Get exact image properties
      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate ratio to fit within margins
      const ratio = Math.min((maxPdfWidth - 20) / imgProps.width, (maxPdfHeight - 20) / imgProps.height);
      
      const pdfWidth = imgProps.width * ratio;
      const pdfHeight = imgProps.height * ratio;
      
      const marginX = (maxPdfWidth - pdfWidth) / 2;
      const marginY = 10;
      
      pdf.addImage(imgData, 'PNG', marginX, marginY, pdfWidth, pdfHeight);
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
        <div className="p-4 overflow-y-auto print:overflow-visible print:p-0" id="printable-label">
          <div id="printable-label-content" className="border-2 p-4 mx-auto font-sans leading-relaxed" style={{ borderColor: '#000', backgroundColor: '#fff', color: '#000', maxWidth: '3.5in' }}>
            
            {/* Top Logo & Barcode Grid */}
            <div className="flex justify-between items-center border-b-2 pb-3 mb-3" style={{ borderColor: '#000' }}>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight" style={{ color: '#b8860b' }}>MALABEZ</h1>
                <p className="text-[8px] font-bold uppercase tracking-widest leading-none" style={{ color: '#64748b' }}>Premium Clothing & Lifestyle</p>
              </div>
              <div className="text-right">
                <div className="inline-block text-sm font-black px-2 py-1 rounded" style={{ backgroundColor: '#000', color: '#fff' }}>
                  {order.payment_method === 'cod' ? 'C.O.D.' : 'PAID'}
                </div>
              </div>
            </div>

            {/* Courier Waybill Barcode Section */}
            <div className="border p-2 rounded mb-3 text-center" style={{ borderColor: '#000', backgroundColor: '#f8fafc' }}>
              <div className="text-[10px] font-bold uppercase tracking-wider mb-1">Waybill tracking no:</div>
              <div className="h-10 w-full flex items-center justify-center font-mono overflow-hidden relative" style={{ backgroundColor: '#fff' }}>
                {[2, 1, 3, 1, 1, 2, 4, 1, 2, 2, 1, 3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 1, 2, 4, 1, 2, 2, 1, 1, 2, 3, 1].map((w, i) => (
                  <div key={i} className="h-full" style={{ width: `${w * 2}px`, marginRight: `${(i % 3) + 1}px`, backgroundColor: '#000' }}></div>
                ))}
              </div>
              <p className="text-[10px] font-mono mt-1 font-bold tracking-wider mb-0" style={{ color: '#000' }}>{1200000000 + order.id}</p>
            </div>

            {/* Dispatch details */}
            <div className="grid grid-cols-2 gap-3 border p-2 rounded mb-3 text-[10px]" style={{ borderColor: '#000' }}>
              <div className="border-r pr-2" style={{ borderColor: 'rgba(0,0,0,0.2)' }}>
                <p className="text-[8px] font-bold uppercase tracking-wider mb-1 h-2" style={{ color: '#64748b' }}>Sender Details:</p>
                <p className="font-extrabold text-xs mb-1 leading-none" style={{ color: '#000' }}>MALABEZ Store</p>
                <p className="text-[10px] leading-tight mb-1" style={{ color: '#1e293b' }}>{config.contact_address || 'Dhaka, Bangladesh'}</p>
                <p className="text-[10px] font-bold leading-none mt-1" style={{ color: '#000' }}>📞 {config.contact_phone || '+880 1234 567890'}</p>
              </div>
              <div className="pl-1">
                <p className="text-[8px] font-bold uppercase tracking-wider mb-1 h-2" style={{ color: '#64748b' }}>Receiver Details:</p>
                <p className="font-extrabold text-xs mb-1 leading-none" style={{ color: '#000' }}>{order.user_name || 'Guest Customer'}</p>
                <p className="text-[10px] leading-tight mb-1" style={{ color: '#1e293b' }}>{order.shipping_address}</p>
                <p className="text-[10px] leading-none" style={{ color: '#1e293b' }}>{order.city} - {order.zip_code}</p>
                <p className="text-[10px] font-extrabold leading-none mt-2" style={{ color: '#000' }}>📞 {order.payment_phone || 'N/A'}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="border rounded p-2 mb-3 text-[10px]" style={{ borderColor: '#000', backgroundColor: '#f8fafc', color: '#000' }}>
              <div className="grid grid-cols-2 gap-y-1 font-medium">
                <div className="flex justify-between border-b pb-1 mr-2" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-semibold text-[8px] uppercase" style={{ color: '#64748b' }}>Order Ref:</span>
                  <span className="font-bold">#{order.id}</span>
                </div>
                <div className="flex justify-between border-b pb-1" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-semibold text-[8px] uppercase" style={{ color: '#64748b' }}>Date:</span>
                  <span className="font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b pb-1 mr-2" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-semibold text-[8px] uppercase" style={{ color: '#64748b' }}>Service:</span>
                  <span className="font-bold">Standard</span>
                </div>
                <div className="flex justify-between border-b pb-1" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-semibold text-[8px] uppercase" style={{ color: '#64748b' }}>Method:</span>
                  <span className="font-bold uppercase">{order.payment_method}</span>
                </div>
              </div>
            </div>

            {/* Total Items Count */}
            <div className="border rounded p-2 mb-3 text-center" style={{ borderColor: '#000', backgroundColor: '#f8fafc', color: '#000' }}>
              <span className="font-bold text-[10px] uppercase tracking-wider">Total Items Qty: <span className="text-xs font-black">{items.reduce((sum, item) => sum + item.quantity, 0)}</span></span>
            </div>

            {/* Price breakdown and Payable Cash details */}
            <div className="border rounded p-2 text-[10px] font-semibold" style={{ borderColor: '#000' }}>
              <div className="space-y-1" style={{ color: '#475569' }}>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pb-1 border-b" style={{ borderColor: '#e2e8f0' }}>
                  <span>Shipping:</span>
                  <span>৳{deliveryCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-base font-black pt-1" style={{ color: '#000' }}>
                  <span>Total:</span>
                  <span style={{ color: '#b8860b' }}>৳{order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
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
            padding: 20px !important;
            margin: 0;
          }
          #printable-label-content {
            margin: 0 !important;
            max-width: 100% !important;
            width: 3.5in !important;
          }
        }
      `}} />
    </div>
  );
}
