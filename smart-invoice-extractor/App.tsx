import React, { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { InvoiceTable } from './components/InvoiceTable';
import { fileToBase64, convertPdfPageToImage } from './utils/pdfUtils';
import { processInvoice } from './services/geminiService';
import { InvoiceItem } from './types';
import { Sparkles, ArrowLeft, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; filename: string } | undefined>(undefined);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelect = async (files: File[]) => {
    setProcessing(true);
    setError(null);
    
    let newItemsCount = 0;
    const failedFiles: string[] = [];

    // Sort files alphabetically to maintain a consistent order in the list based on filename
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

    for (let i = 0; i < sortedFiles.length; i++) {
      const file = sortedFiles[i];
      setProgress({
        current: i + 1,
        total: sortedFiles.length,
        filename: file.name
      });

      try {
        let base64Data: string;
        let processingMimeType = file.type;

        if (file.type === 'application/pdf') {
          // Client-side PDF to Image conversion
          base64Data = await convertPdfPageToImage(file);
          processingMimeType = 'image/jpeg';
        } else {
          base64Data = await fileToBase64(file);
        }

        // Remove extension for the name to be used in the list
        const displayName = file.name.replace(/\.[^/.]+$/, "");

        const result = await processInvoice(base64Data, processingMimeType, displayName);
        
        // Append items to state immediately
        setItems(prev => [...prev, ...result.items]);
        newItemsCount += result.items.length;
        
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err);
        failedFiles.push(file.name);
      }
    }

    setProcessing(false);
    setProgress(undefined);

    if (failedFiles.length > 0) {
      setError(`Failed to process ${failedFiles.length} file(s): ${failedFiles.join(', ')}. Check console for details.`);
    } else if (newItemsCount === 0 && files.length > 0) {
      setError("No items could be extracted from the uploaded files.");
    }
  };

  const handleReset = () => {
    setItems([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
               <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-600">
                Smart Invoice Extractor
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide">STUDENT UNION LIST GENERATOR</p>
            </div>
          </div>
          
          {items.length > 0 && (
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
            >
              <Trash2 className="w-4 h-4" />
              Clear List
            </button>
          )}
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div className={`${items.length > 0 ? 'hidden md:block' : ''} bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden`}>
            <Dropzone 
              onFilesSelect={handleFilesSelect} 
              isLoading={processing} 
              progress={progress}
            />
          </div>

          {/* Results Table */}
          {items.length > 0 && (
            <div className="animate-fade-in-up">
               {/* Mobile placeholder for dropzone when hidden */}
               <div className="md:hidden mb-6">
                 <button 
                   onClick={handleReset} 
                   className="w-full py-3 bg-white border border-dashed border-emerald-300 text-emerald-600 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50"
                 >
                   <ArrowLeft className="w-4 h-4" />
                   Start Over / Upload New
                 </button>
               </div>
               
               <InvoiceTable title="学生会大团建物口清单 (Student Union Item List)" items={items} />
            </div>
          )}

          {/* Introductory Text (only when empty) */}
          {items.length === 0 && !processing && (
             <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                 <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                    <div className="text-2xl mb-2">📂</div>
                    <h3 className="font-semibold text-sm mb-1">Batch Processing</h3>
                    <p className="text-xs text-slate-500">Upload multiple PDFs or select an entire folder at once.</p>
                 </div>
                 <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                    <div className="text-2xl mb-2">🤖</div>
                    <h3 className="font-semibold text-sm mb-1">AI Extraction</h3>
                    <p className="text-xs text-slate-500">Automatically categorizes items and sums up quantities.</p>
                 </div>
                 <div className="p-4 rounded-lg bg-white/50 border border-slate-200">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="font-semibold text-sm mb-1">Unified Output</h3>
                    <p className="text-xs text-slate-500">Generates a single consolidated list ready for Excel copy-paste.</p>
                 </div>
              </div>
          )}
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>Powered by Google Gemini 2.5 Flash</p>
        </footer>
      </div>
    </div>
  );
};

export default App;