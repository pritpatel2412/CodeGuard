
import fs from 'fs';
import PDFDocument from 'pdfkit';

try {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('test-output.pdf'));

    doc.text('Hello World');
    doc.end();

    console.log('PDF generated successfully');
} catch (error) {
    console.error('Error generating PDF:', error);
}
