/**
 * PDF Generation Routes
 * Real-time PDF generation API for valuation reports
 * Supports both pdfGeneratorHTML (legacy) and pdfGeneratorExact (new exact clone)
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateValuationReportPDF as generateExactPDF } from '../utils/pdfGeneratorExact.js';
import { generateValuationReportPDF } from '../utils/pdfGeneratorHTML.js';
import ValuationModel from '../models/valuationModel.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * POST /api/pdf/generate
 * Generate PDF from valuation data
 * Returns: PDF file for download
 * 
 * Note: On Vercel serverless, we skip Puppeteer and let client handle PDF generation
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('📡 [Route] POST /generate request received');
    
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      console.warn('⚠️ [Route] No data provided');
      return res.status(400).json({
        success: false,
        message: 'No data provided for PDF generation'
      });
    }

    console.log('✅ [Route] Data received:', Object.keys(data).length, 'fields');
    console.log('📂 [Route] Environment:', { VERCEL: process.env.VERCEL, NODE_ENV: process.env.NODE_ENV });

    // If on Vercel serverless, return error instructing client to use client-side generation
    if (process.env.VERCEL) {
      console.log('ℹ️ [Route] Vercel environment detected - using client-side PDF generation');
      return res.status(503).json({
        success: false,
        message: 'Server-side PDF generation unavailable on Vercel. Please use client-side generation.',
        code: 'USE_CLIENT_PDF',
        fallback: true
      });
    }

    // Local development: Use Puppeteer
    try {
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
      console.log('📂 [Route] Uploads directory:', uploadsDir);
      
      if (!fs.existsSync(uploadsDir)) {
        console.log('📂 [Route] Creating uploads directory...');
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ [Route] Directory created');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueId = data.uniqueId || `valuation_${timestamp}`;
      const filename = `${uniqueId}_${timestamp}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      console.log('📄 [Route] Output file:', filepath);

      // Generate PDF
      console.log('🖨️ [Route] Calling generateValuationReportPDF...');
      const result = await generateValuationReportPDF(data, filepath);
      console.log('✅ [Route] PDF generation completed:', result);

      // Verify file exists
      if (!fs.existsSync(filepath)) {
        throw new Error(`PDF file was not created at ${filepath}`);
      }
      
      const stats = fs.statSync(filepath);
      console.log('📊 [Route] PDF file size:', stats.size, 'bytes');

      // Send file
      console.log('📤 [Route] Sending PDF file to client...');
      res.download(filepath, `valuation_${uniqueId}.pdf`, (err) => {
        if (err) {
          console.error('❌ [Route] Error during download:', err.message);
        } else {
          console.log('✅ [Route] File sent successfully');
        }
      });
    } catch (puppeteerError) {
      console.warn('⚠️ [Route] Puppeteer error, falling back to client-side PDF');
      res.status(503).json({
        success: false,
        message: 'Server-side PDF generation failed. Use client-side PDF generation instead.',
        code: 'PUPPETEER_ERROR',
        fallback: true,
        error: puppeteerError.message
      });
    }
  } catch (error) {
    console.error('❌ [Route] PDF generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

/**
 * POST /api/pdf/preview
 * Generate PDF and return as stream for preview
 * Returns: PDF as inline stream
 */
router.post('/preview', async (req, res) => {
  try {
    console.log('📡 [Preview] POST /preview request received');
    
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      console.warn('⚠️ [Preview] No data provided');
      return res.status(400).json({
        success: false,
        message: 'No data provided'
      });
    }

    console.log('✅ [Preview] Data received:', Object.keys(data).length, 'fields');
    console.log('📂 [Preview] Environment:', { VERCEL: process.env.VERCEL, NODE_ENV: process.env.NODE_ENV });

    // If on Vercel, use client-side PDF generation
    if (process.env.VERCEL) {
      console.log('ℹ️ [Preview] Vercel environment detected - client-side PDF generation required');
      return res.status(503).json({
        success: false,
        message: 'Server-side PDF generation unavailable on Vercel. Please use client-side preview.',
        code: 'USE_CLIENT_PDF',
        fallback: true
      });
    }

    // Local development: Use Puppeteer
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      console.log('📂 [Preview] Temp directory:', tempDir);
      
      if (!fs.existsSync(tempDir)) {
        console.log('📂 [Preview] Creating temp directory...');
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilepath = path.join(tempDir, `preview_${Date.now()}.pdf`);
      console.log('📄 [Preview] Temp file:', tempFilepath);

      // Generate PDF
      console.log('🖨️ [Preview] Generating preview PDF...');
      await generateValuationReportPDF(data, tempFilepath);
      console.log('✅ [Preview] PDF generation completed');

      // Verify file exists
      if (!fs.existsSync(tempFilepath)) {
        throw new Error(`Preview PDF file was not created at ${tempFilepath}`);
      }
      
      const stats = fs.statSync(tempFilepath);
      console.log('📊 [Preview] PDF file size:', stats.size, 'bytes');

      // Set headers for PDF preview
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Content-Length', stats.size);

      // Stream the file
      console.log('📤 [Preview] Streaming PDF file...');
      const fileStream = fs.createReadStream(tempFilepath);
      fileStream.pipe(res);

      // Cleanup after streaming
      fileStream.on('end', () => {
        console.log('✅ [Preview] File stream ended, cleaning up...');
        setTimeout(() => {
          if (fs.existsSync(tempFilepath)) {
            try {
              fs.unlinkSync(tempFilepath);
              console.log('✅ [Preview] Temp file deleted');
            } catch (err) {
              console.error('❌ [Preview] Error deleting temp file:', err.message);
            }
          }
        }, 1000);
      });

      fileStream.on('error', (err) => {
        console.error('❌ [Preview] Stream error:', err.message);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error streaming PDF'
          });
        }
      });
    } catch (puppeteerError) {
      console.warn('⚠️ [Preview] Puppeteer error, falling back to client-side');
      res.status(503).json({
        success: false,
        message: 'Server-side PDF preview failed. Use client-side PDF generation instead.',
        code: 'PUPPETEER_ERROR',
        fallback: true,
        error: puppeteerError.message
      });
    }
  } catch (error) {
    console.error('❌ [Preview] PDF preview error:', error.message);
    res.status(500).json({
      success: false,
      message: 'PDF preview failed',
      error: error.message
    });
  }
});

/**
 * GET /api/pdf/:id/exact
 * Generate EXACT PDF from valuation ID (new exact clone)
 * Fetches valuation data from database and generates pixel-perfect PDF
 */
router.get('/:id/exact', async (req, res) => {
  try {
    console.log('📡 [Route] GET /exact request for ID:', req.params.id);
    
    const { id } = req.params;
    
    // Fetch valuation from database
    console.log('📂 [Route] Fetching valuation data for ID:', id);
    const valuation = await ValuationModel.findOne({ uniqueId: id });
    
    if (!valuation) {
      console.warn('⚠️ [Route] Valuation not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Valuation not found'
      });
    }

    console.log('✅ [Route] Valuation found, generating exact PDF...');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      console.log('📂 [Route] Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${id}_${timestamp}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    console.log('📄 [Route] Output file:', filepath);

    // Generate EXACT PDF with valuation data
    console.log('🖨️ [Route] Calling generateExactPDF...');
    const result = await generateExactPDF(valuation.toObject(), filepath);
    console.log('✅ [Route] Exact PDF generation completed:', result);

    // Verify file exists
    if (!fs.existsSync(filepath)) {
      throw new Error(`PDF file was not created at ${filepath}`);
    }
    
    const stats = fs.statSync(filepath);
    console.log('📊 [Route] PDF file size:', stats.size, 'bytes');

    // Send file
    console.log('📤 [Route] Sending PDF file to client...');
    res.download(filepath, `valuation_${id}.pdf`, (err) => {
      if (err) {
        console.error('❌ [Route] Error during download:', err.message);
      } else {
        console.log('✅ [Route] File sent successfully');
      }
    });
  } catch (error) {
    console.error('❌ [Route] PDF generation error:', error.message);
    console.error('❌ [Route] Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

/**
 * POST /api/pdf/exact
 * Generate EXACT PDF from POST data
 * For testing or direct data submission
 */
router.post('/exact', async (req, res) => {
  try {
    console.log('📡 [Route] POST /exact request received');
    
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
      console.warn('⚠️ [Route] No data provided');
      return res.status(400).json({
        success: false,
        message: 'No data provided for PDF generation'
      });
    }

    console.log('✅ [Route] Data received:', Object.keys(data).length, 'fields');

    // Create uploads directory if it doesn't exist
    // For Vercel: use /tmp directory (writable)
    const uploadsDir = process.env.VERCEL 
      ? path.join('/tmp', 'uploads', 'pdfs')
      : path.join(process.cwd(), 'uploads', 'pdfs');
    if (!fs.existsSync(uploadsDir)) {
      console.log('📂 [Route] Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = data.uniqueId || data.formId || `valuation_${timestamp}`;
    const filename = `${uniqueId}_${timestamp}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    console.log('📄 [Route] Output file:', filepath);
    console.log('📂 [Route] Environment:', { VERCEL: process.env.VERCEL, NODE_ENV: process.env.NODE_ENV });

    // Generate EXACT PDF
    console.log('🖨️ [Route] Calling generateExactPDF...');
    const result = await generateExactPDF(data, filepath);
    console.log('✅ [Route] Exact PDF generation completed:', result);

    // Verify file exists
    if (!fs.existsSync(filepath)) {
      throw new Error(`PDF file was not created at ${filepath}`);
    }
    
    const stats = fs.statSync(filepath);
    console.log('📊 [Route] PDF file size:', stats.size, 'bytes');

    // Send file
    console.log('📤 [Route] Sending PDF file to client...');
    res.download(filepath, `valuation_${uniqueId}.pdf`, (err) => {
      if (err) {
        console.error('❌ [Route] Error during download:', err.message);
      } else {
        console.log('✅ [Route] File sent successfully');
      }
    });
  } catch (error) {
    console.error('❌ [Route] PDF generation error:', error.message);
    console.error('❌ [Route] Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

/**
 * GET /api/pdf/status/:id
 * Check if PDF generation is complete
 */
router.get('/status/:id', (req, res) => {
  try {
    const { id } = req.params;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');
    
    // Look for file with this ID
    const files = fs.readdirSync(uploadsDir);
    const file = files.find(f => f.startsWith(id));

    if (file) {
      const filepath = path.join(uploadsDir, file);
      const stats = fs.statSync(filepath);
      
      res.json({
        success: true,
        exists: true,
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'PDF not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking PDF status',
      error: error.message
    });
  }
});

export default router;
