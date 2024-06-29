"use client"
import React, { useState, ChangeEvent } from 'react';
// import './App.css';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist';

// Define the type for the pdfjsLib document and page objects
interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPage>;
}

interface PdfPage {
  getTextContent: () => Promise<PdfTextContent>;
}

interface PdfTextContent {
  items: { str: string }[];
}

const PlotFromCsv: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf: PdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const textContent = await extractTextFromPDF(pdf);

      // Simple parsing logic (customize based on your PDF structure)
      const rows = textContent.split('\n').map(row => row.split(/\s+/));
      const csv = Papa.unparse(rows);

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'converted.csv';
      link.click();
    } else {
      alert('Please upload a PDF file first.');
    }
  };

  const extractTextFromPDF = async (pdf: PdfDocument) => {
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    return text;
  };

  return (
    <div className="PlotFromCsv">
      <header className="App-header">
        
      </header>
    </div>
  );
}

export default PlotFromCsv;
