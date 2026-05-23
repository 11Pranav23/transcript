import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, PageBreak } from 'docx';
import fs from 'fs';
import path from 'path';

export const exportAsText = async (req, res, next) => {
  try {
    const { transcript, fileName = 'transcript' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const textContent = typeof transcript === 'string' ? transcript : 
                       Array.isArray(transcript) ? transcript.map(item => `[${formatTime(item.start)}] ${item.text}`).join('\n') :
                       JSON.stringify(transcript);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.txt"`);
    res.send(textContent);

  } catch (error) {
    next(error);
  }
};

export const exportAsPDF = async (req, res, next) => {
  try {
    const { transcript, fileName = 'transcript', title = 'Video Transcript', metadata = {} } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
    
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text(title, { underline: true });
    doc.moveDown();

    // Metadata
    if (metadata.videoTitle) {
      doc.fontSize(12).font('Helvetica').text(`Video: ${metadata.videoTitle}`);
    }
    if (metadata.channel) {
      doc.fontSize(10).text(`Channel: ${metadata.channel}`);
    }
    if (metadata.date) {
      doc.fontSize(10).text(`Generated: ${new Date(metadata.date).toLocaleDateString()}`);
    }
    
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Content
    if (Array.isArray(transcript)) {
      transcript.forEach(item => {
        doc.fontSize(9).font('Helvetica-Bold').text(`[${formatTime(item.start)}]`, {
          continued: true
        });
        doc.fontSize(10).font('Helvetica').text(` ${item.text}`);
        doc.moveDown(0.3);
      });
    } else {
      doc.fontSize(11).text(transcript);
    }

    doc.end();

  } catch (error) {
    next(error);
  }
};

export const exportAsDocx = async (req, res, next) => {
  try {
    const { transcript, fileName = 'transcript', title = 'Video Transcript', metadata = {} } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const sections = [];

    // Title
    sections.push(new Paragraph({
      text: title,
      bold: true,
      size: 32
    }));

    sections.push(new Paragraph({ text: '' }));

    // Metadata
    if (metadata.videoTitle) {
      sections.push(new Paragraph({
        text: `Video: ${metadata.videoTitle}`,
        size: 20
      }));
    }
    if (metadata.channel) {
      sections.push(new Paragraph({
        text: `Channel: ${metadata.channel}`,
        size: 20
      }));
    }
    if (metadata.date) {
      sections.push(new Paragraph({
        text: `Generated: ${new Date(metadata.date).toLocaleDateString()}`,
        size: 20
      }));
    }

    sections.push(new Paragraph({ text: '' }));
    sections.push(new PageBreak());

    // Content
    if (Array.isArray(transcript)) {
      transcript.forEach(item => {
        sections.push(new Paragraph({
          children: [
            new TextRun({
              text: `[${formatTime(item.start)}] `,
              bold: true
            }),
            new TextRun(item.text)
          ]
        }));
        sections.push(new Paragraph({ text: '' }));
      });
    } else {
      sections.push(new Paragraph(transcript));
    }

    const doc = new Document({ sections: [{ children: sections }] });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.docx"`);
    res.send(buffer);

  } catch (error) {
    next(error);
  }
};

function formatTime(seconds) {
  if (!seconds) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
