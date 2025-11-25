export interface InvoiceItem {
  category: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  remarks: string;
}

export interface ExtractedData {
  title: string;
  items: InvoiceItem[];
}

// Global definition for PDF.js loaded via script tag
declare global {
  interface Window {
    pdfjsLib: any;
  }
}
