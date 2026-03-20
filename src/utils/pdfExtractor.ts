import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker - using the minified worker from the build



export async function extractTextFromPDF(file: File): Promise<string> {
  // Configure the worker lazily
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const pdfWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with worker disabled
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
