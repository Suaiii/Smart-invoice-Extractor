import React, { useRef, useState } from 'react';
import { Upload, FileType, FileText, Loader2, FolderOpen } from 'lucide-react';

interface DropzoneProps {
  onFilesSelect: (files: File[]) => void;
  isLoading: boolean;
  progress?: { current: number; total: number; filename: string };
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelect, isLoading, progress }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(Array.from(e.target.files));
    }
    // Reset input value to allow re-uploading the same files if needed
    e.target.value = '';
  };

  const validateAndPass = (files: File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    // Filter for valid files
    const validFiles = files.filter(f => validTypes.includes(f.type));
    
    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    } else {
      alert('Please upload PDF or Image files.');
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center cursor-pointer
        ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-gray-300 hover:border-emerald-400 hover:bg-slate-50'}
        ${isLoading ? 'bg-slate-50 cursor-wait' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
      />
      
      {/* Folder input */}
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        {...({ webkitdirectory: "", directory: "" } as any)}
        multiple
        onChange={handleFileChange}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center animate-pulse py-8">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-xl font-medium text-slate-800">
            {progress ? `Processing ${progress.current}/${progress.total}` : 'Analyzing...'}
          </p>
          <p className="text-sm text-slate-500 mt-2 max-w-md truncate px-4">
            {progress?.filename || 'Preparing files...'}
          </p>
        </div>
      ) : (
        <div className="py-4" onClick={() => fileInputRef.current?.click()}>
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Upload Invoices or Receipts
          </h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            Drag & drop files here, or select multiple files.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Select Files
            </button>
            <span className="text-slate-400 text-sm">or</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                folderInputRef.current?.click();
              }}
              className="px-6 py-2.5 bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              Select Folder
            </button>
          </div>

          <div className="flex gap-4 text-xs text-slate-400 uppercase tracking-wider font-medium justify-center mt-10">
            <span className="flex items-center gap-1"><FileType className="w-4 h-4" /> PDF</span>
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> JPG / PNG</span>
          </div>
        </div>
      )}
    </div>
  );
};