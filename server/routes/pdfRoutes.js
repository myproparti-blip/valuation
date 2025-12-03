/**
 * PDF Generation Routes (Client-side Only)
 * Server-side PDF generation is not supported on Vercel
 * All PDF generation is handled on the client using jsPDF + html2canvas
 */

import express from 'express';

const router = express.Router();

/**
 * POST /api/pdf/generate
 * Endpoint to signal client-side PDF generation should be used
 * Returns: Fallback message
 */
router.post('/generate', (req, res) => {
  try {
    res.status(503).json({
      success: false,
      message: 'Server-side PDF generation unavailable. Please use client-side generation.',
      code: 'USE_CLIENT_PDF',
      fallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

/**
 * POST /api/pdf/preview
 * Endpoint to signal client-side PDF preview should be used
 * Returns: Fallback message
 */
router.post('/preview', (req, res) => {
  try {
    res.status(503).json({
      success: false,
      message: 'Server-side PDF preview unavailable. Please use client-side generation.',
      code: 'USE_CLIENT_PDF',
      fallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PDF preview failed',
      error: error.message
    });
  }
});

/**
 * GET /api/pdf/:id/exact
 * Endpoint to signal client-side PDF generation should be used
 * Returns: Fallback message
 */
router.get('/:id/exact', (req, res) => {
  try {
    res.status(503).json({
      success: false,
      message: 'Server-side PDF generation unavailable. Please use client-side generation.',
      code: 'USE_CLIENT_PDF',
      fallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

/**
 * POST /api/pdf/exact
 * Endpoint to signal client-side PDF generation should be used
 * Returns: Fallback message
 */
router.post('/exact', (req, res) => {
  try {
    res.status(503).json({
      success: false,
      message: 'Server-side PDF generation unavailable. Please use client-side generation.',
      code: 'USE_CLIENT_PDF',
      fallback: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: error.message
    });
  }
});

export default router;
