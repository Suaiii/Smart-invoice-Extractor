import React from 'react';
import { InvoiceItem } from '../types';
import { Download, Copy, CheckCheck } from 'lucide-react';

interface InvoiceTableProps {
  title: string;
  items: InvoiceItem[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ title, items }) => {
  const [copied, setCopied] = React.useState(false);

  const totalSum = items.reduce((sum, item) => sum + item.totalAmount, 0);

  const handleCopy = () => {
    const header = "分类\t名称\t数量\t单价\t总金额\t备注";
    const rows = items.map(item => 
      `${item.category}\t${item.name}\t${item.quantity}\t${item.unitPrice}\t${item.totalAmount}\t${item.remarks || ''}`
    ).join('\n');
    
    navigator.clipboard.writeText(`${header}\n${rows}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="w-full animate-fade-in-up">
      <div className="flex justify-between items-end mb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">{title || 'Extracted Items'}</h2>
           <p className="text-sm text-slate-500">Review the extracted data below</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard' : 'Copy Table'}
        </button>
      </div>

      <div className="overflow-hidden border border-emerald-800/20 rounded-lg shadow-lg bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-emerald-50 border-b border-emerald-100 text-emerald-900">
                <th className="px-6 py-4 font-semibold text-center w-24">分类 (Category)</th>
                <th className="px-6 py-4 font-semibold border-l border-dashed border-emerald-200">名称 (Name)</th>
                <th className="px-6 py-4 font-semibold text-center border-l border-dashed border-emerald-200 w-24">数量 (Qty)</th>
                <th className="px-6 py-4 font-semibold text-right border-l border-dashed border-emerald-200 w-32">单价 (Unit)</th>
                <th className="px-6 py-4 font-semibold text-right border-l border-dashed border-emerald-200 w-32">总金额 (Total)</th>
                <th className="px-6 py-4 font-semibold border-l border-dashed border-emerald-200">备注 (Remarks)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-center font-medium text-slate-600 bg-slate-50/50">
                    <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-white border border-slate-200 text-slate-500">
                      {item.category || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800 border-l border-dashed border-slate-200">
                    {item.name}
                  </td>
                  <td className="px-6 py-3 text-center text-slate-600 border-l border-dashed border-slate-200">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-600 border-l border-dashed border-slate-200 font-mono">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-700 border-l border-dashed border-slate-200 font-mono">
                    {formatCurrency(item.totalAmount)}
                  </td>
                  <td className="px-6 py-3 text-slate-500 border-l border-dashed border-slate-200 text-xs italic">
                    {item.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-emerald-600">
              <tr>
                <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-700 uppercase tracking-wide text-xs">
                  Grand Total
                </td>
                <td className="px-6 py-4 text-right font-bold text-xl text-emerald-800 border-l border-dashed border-slate-300 font-mono">
                  {formatCurrency(totalSum)}
                </td>
                <td className="bg-slate-50"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex gap-3 text-emerald-800 text-sm">
         <div className="mt-0.5">💡</div>
         <p>
           This list is generated by AI. Please verify all quantities and prices against the original document before processing payments.
         </p>
      </div>
    </div>
  );
};