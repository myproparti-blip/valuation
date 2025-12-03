/**
 * PDF Export Service for Valuation Report
 * Main service file - handles PDF generation logic only
 * HTML templates are imported from separate template modules
 */

import { PDF_STYLES } from '../templates/pdfStyles.js';
import { generatePage1General } from '../templates/page1General.js';
import { generatePage2AreaBoundaries } from '../templates/page2AreaBoundaries.js';
import { generatePage3FlatDetails } from '../templates/page3FlatDetails.js';
import { generatePage4MarketabilityRate } from '../templates/page4MarketabilityRate.js';
import { generatePage5Declaration } from '../templates/page5Declaration.js';
import { generatePage6Location } from '../templates/page6Location.js';
import { generatePage7PropertyImages } from '../templates/page7PropertyImages.js';

/**
 * Generate complete HTML for valuation report PDF
 * Composes all page templates into a single HTML document
 */
export function generateValuationReportHTML(data = {}) {
  const pdfData = data?.pdfDetails || {};
  
  const extractedData = {
    // Header & Identification
    bankName: data?.bankName || pdfData?.branch || 'NA',
    branchName: pdfData?.branch || 'NA',
    fileNo: pdfData?.formId || 'NA',
    valuationDate: pdfData?.valuationMadeDate || 'NA',
    inspectionDate: pdfData?.inspectionDate || 'NA',
    
    // Property Type & Owner
    propertyType: data?.propertyType || 'NA',
    ownerName: pdfData?.ownerName || 'NA',
    
    // Property Address
    propertyAddress: data?.address || pdfData?.postalAddress || 'NA',
    plotSurveyNo: pdfData?.plotSurveyBlockNo || 'NA',
    
    // Property Details
    carpetArea: pdfData?.carpetArea || 'NA',
    builtUpArea: pdfData?.builtUpArea || 'NA',
    city: data?.city || pdfData?.cityTown || 'NA',
    
    // Valuation Results
    fairMarketValue: pdfData?.fairMarketValue || 'NA',
    realizeableValue: pdfData?.realizableValue || 'NA',
    distressValue: pdfData?.distressValue || 'NA',
    saleDeadValue: pdfData?.saleDeedValue || 'NA',
    jantriValue: pdfData?.totalJantriValue || 'NA',
    insurableValue: pdfData?.insurableValue || 'NA',
    
    // Building Details
    numberOfFloors: pdfData?.numberOfFloors || 'NA',
    structureType: pdfData?.structureType || 'NA',
    commencementYear: pdfData?.constructionYear || 'NA',
    constructionYear: pdfData?.constructionYear || 'NA',
    qualityOfConstruction: pdfData?.qualityOfConstruction || 'NA',
    appearanceOfBuilding: pdfData?.buildingAppearance || 'NA',
    buildingMaintenance: pdfData?.buildingMaintenance || 'NA',
    maintenanceOfBuilding: pdfData?.buildingMaintenance || 'NA',
    
    // Flat Details
    flatFloor: pdfData?.flatFloor || 'NA',
    flatNo: pdfData?.flatDoorNo || 'NA',
    flatSpecification: pdfData?.flatSpecifications?.specifications || 'NA',
    roofType: pdfData?.flatSpecifications?.roof || 'NA',
    flooringType: pdfData?.flatSpecifications?.flooring || 'NA',
    doorType: pdfData?.flatSpecifications?.doors || 'NA',
    windowType: pdfData?.flatSpecifications?.windows || 'NA',
    fittingsType: pdfData?.flatSpecifications?.fittings || 'NA',
    finishingType: pdfData?.flatSpecifications?.finishing || 'NA',
    
    // Area Classification
    areaClass: pdfData?.classificationArea || 'NA',
    areaType: pdfData?.urbanType || 'NA',
    occupancy: pdfData?.occupancyStatus || 'NA',
    classificationArea: pdfData?.classificationArea || 'NA',
    municipality: pdfData?.villageMunicipality || 'NA',
    
    // Marketability
    marketability: pdfData?.marketability || 'NA',
    positiveFactors: pdfData?.positiveFactors || 'NA',
    negativeFactors: pdfData?.negativeFactors || 'NA',
    
    // Rate Details
    marketRange: 'NA',
    adoptedRate: pdfData?.compositeRate || 'NA',
    jantriRate: pdfData?.jantriRate || 'NA',
    buildingServices: pdfData?.buildingServiceRate || 'NA',
    landOthers: pdfData?.landOtherRate || 'NA',
    
    // Valuation Calculation
    flatValue: pdfData?.presentValue || 'NA',
    furnitureFixtures: pdfData?.furnitureFixtureValue || 'NA',
    totalFlatValue: pdfData?.totalValue || 'NA',
    totalFlatValueWords: pdfData?.totalValueWords || pdfData?.fairMarketValueWords || 'NA',
    
    // Tax & Utility Details
    assessmentNo: pdfData?.houseTax?.assessmentNo || 'NA',
    taxPaidBy: pdfData?.houseTax?.taxPaidBy || 'NA',
    taxAmount: pdfData?.houseTax?.taxAmount || 'NA',
    connectionNo: pdfData?.electricityConnection?.connectionNo || 'NA',
    meterName: pdfData?.electricityConnection?.meterName || 'NA',
    
    // Documents & Deeds
    mortgageDeed: pdfData?.mortgageDeed || 'NA',
    previousValuationIssuedBy: pdfData?.previousValuationIssuedBy || 'NA',
    previousValuationDate: pdfData?.previousValuationDate || 'NA',
    approvedPlanNo: pdfData?.approvedPlanNo || 'NA',
    planIssueDate: pdfData?.planIssueDate || 'NA',
    planValidity: pdfData?.planValidity || 'NA',
    authenticityVerified: pdfData?.authenticityVerified || 'NA',
    valuerCommentOnAuthenticity: pdfData?.valuerCommentOnAuthenticity || 'NA',
    residentialArea: pdfData?.residentialArea || 'NA',
    commercialArea: pdfData?.commercialArea || 'NA',
    industrialArea: pdfData?.industrialArea || 'NA',
    
    // Documents
    documentsCopies: pdfData?.documentsShownToUs?.length > 0 
      ? pdfData.documentsShownToUs.join(', ') 
      : (pdfData?.customDocuments?.length > 0 ? pdfData.customDocuments.join(', ') : 'NA'),
    signerName: pdfData?.signerName || 'NA',
    
    // Declaration Details
    inspectionDateDecl: pdfData?.inspectionDate || 'NA',
    place: pdfData?.place || data?.city || 'NA',
    reportDate: pdfData?.reportDate || 'NA',
    valuationCompany: data?.valuationCompany || 'NA',
    
    // Boundary & Location Details
    eastBoundaryDoc: pdfData?.boundariesDocument?.east || 'NA',
    eastBoundaryActual: pdfData?.boundariesActual?.east || 'NA',
    westBoundaryDoc: pdfData?.boundariesDocument?.west || 'NA',
    westBoundaryActual: pdfData?.boundariesActual?.west || 'NA',
    northBoundaryDoc: pdfData?.boundariesDocument?.north || 'NA',
    northBoundaryActual: pdfData?.boundariesActual?.north || 'NA',
    southBoundaryDoc: pdfData?.boundariesDocument?.south || 'NA',
    southBoundaryActual: pdfData?.boundariesActual?.south || 'NA',
    udsl: pdfData?.udsLand || 'NA',
    latitude: data?.coordinates?.latitude || 'NA',
    longitude: data?.coordinates?.longitude || 'NA',
    
    // PAGE 2: APARTMENT BUILDING DETAILS (Location, Nature, Survey, TP, FP, Municipality, Door, Pin, Locality)
    apartmentNature: pdfData?.apartmentNature || 'NA',
    apartmentLocation: pdfData?.apartmentLocation || 'NA',
    surveyBlockNo: pdfData?.surveyBlockNo || 'NA',
    tpFpNo: pdfData?.tpFpNo || 'NA',
    villageMunicipalityCorp: pdfData?.villageMunicipality || 'NA',
    doorStreetPinCode: pdfData?.doorStreet || 'NA',
    localityDescription: pdfData?.localityDescription || 'NA',
    
    // Facilities & Additional Flat Details
    facilities: pdfData?.facilities || {},
    flatMaintenance: pdfData?.flatMaintenance || 'NA',
    saleDeedName: pdfData?.saleDeedName || 'NA',
    undividedLandArea: pdfData?.undividedLandArea || 'NA',
    fsi: pdfData?.fsi || 'NA',
    flatClass: pdfData?.flatClass || 'NA',
    usage: pdfData?.usage || 'NA',
    rent: pdfData?.rent || 'NA',
    
    // Location & Images
    locationImages: data?.locationImages || [],
    propertyImages: data?.propertyImages || [],
  };

  // Generate all pages using separated templates
  const page1 = generatePage1General(extractedData);
  const page2 = generatePage2AreaBoundaries(extractedData);
  const page3 = generatePage3FlatDetails(extractedData);
  const page4 = generatePage4MarketabilityRate(extractedData);
  const page5 = generatePage5Declaration(extractedData);
  const page6 = generatePage6Location(extractedData);
  const page7 = generatePage7PropertyImages(extractedData);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valuation Report</title>
  <style>
    ${PDF_STYLES}
  </style>
</head>
<body>

${page1}
${page2}
${page3}
${page4}
${page5}
${page6}
${page7}

</body>
</html>
`;
}


/**
 * Get backend API URL
 * Handles both development and production environments
 */
function getBackendURL() {
    if (typeof window !== 'undefined' && window.REACT_APP_API_URL) {
        return window.REACT_APP_API_URL;
    }

    if (typeof window !== 'undefined' && typeof process !== 'undefined') {
        if (process.env.REACT_APP_API_URL) {
            return process.env.REACT_APP_API_URL;
        }
    }

    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return origin.replace(':3000', ':5000').replace(':3001', ':5000') + '/api';
        }
    }

    if (typeof window !== 'undefined') {
        return window.location.origin + '/api';
    }

    return 'http://localhost:5000/api';
}

/**
 * Generate PDF from a record object
 * Uses client-side generation (jsPDF + html2canvas) for Vercel compatibility
 * Falls back to server-side if available in local development
 */
export async function generateRecordPDF(record) {
    try {
        console.log('📄 Generating PDF for record:', record?.uniqueId || 'new');

        // Check if running on Vercel
        const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

        // On Vercel, always use client-side generation
        if (isVercel) {
            console.log('ℹ️ Vercel environment detected - using client-side PDF generation');
            return await generateRecordPDFOffline(record);
        }

        // In local development, try server-side first
        const apiUrl = getBackendURL();
        const pdfEndpoint = `${apiUrl}/pdf/generate`;

        console.log('🔗 API Endpoint:', pdfEndpoint);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let response;
        try {
            response = await fetch(pdfEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(record),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.log('⚠️ Server-side PDF generation failed, falling back to client-side');
            return await generateRecordPDFOffline(record);
        }

        if (!response.ok) {
            console.log('⚠️ Server returned error, falling back to client-side');
            return await generateRecordPDFOffline(record);
        }

        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
            ? contentDisposition.split('filename=')[1].replace(/"/g, '')
            : `valuation_${record?.uniqueId || Date.now()}.pdf`;

        // Create blob and trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('✅ PDF downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ PDF generation error:', error);
        console.log('⚠️ Falling back to client-side PDF generation');
        try {
            return await generateRecordPDFOffline(record);
        } catch (fallbackError) {
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }
}

/**
 * Preview PDF in a new tab
 * Uses client-side generation for Vercel compatibility
 */
export async function previewValuationPDF(record) {
    try {
        console.log('👁️ Generating PDF preview for:', record?.uniqueId || 'new');

        // Check if running on Vercel
        const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

        // On Vercel, use client-side generation with blob URL preview
        if (isVercel) {
            console.log('ℹ️ Vercel environment detected - using client-side PDF preview');

            // Dynamically import jsPDF and html2canvas
            const { jsPDF } = await import('jspdf');
            const html2canvas = (await import('html2canvas')).default;

            // Generate HTML from the record data
            const htmlContent = generateValuationReportHTML(record);

            // Create a temporary container
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = '210mm';
            container.style.backgroundColor = '#ffffff';
            container.style.fontSize = '9pt';
            container.style.fontFamily = "'Calibri', 'Arial', sans-serif";
            document.body.appendChild(container);

            // Convert HTML to canvas
            const canvas = await html2canvas(container, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
              allowTaint: true,
              windowHeight: container.scrollHeight,
              windowWidth: 793
            });

            // Remove temporary container
            document.body.removeChild(container);

            // Create PDF from canvas
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'A4');
            let heightLeft = imgHeight;
            let position = 0;

            // Add pages to PDF
            while (heightLeft >= 0) {
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                position -= pageHeight;
                if (heightLeft > 0) {
                    pdf.addPage();
                }
            }

            // Create blob URL and open in new tab
            const blob = pdf.output('blob');
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');

            console.log('✅ PDF preview opened');
            return url;
        }

        // In local development, try server-side preview
        const apiUrl = getBackendURL();
        const pdfEndpoint = `${apiUrl}/pdf/preview`;

        console.log('🔗 API Endpoint:', pdfEndpoint);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let response;
        try {
            response = await fetch(pdfEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify(record),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.log('⚠️ Server-side PDF preview failed, falling back to client-side');
            return await previewValuationPDF(record);
        }

        if (!response.ok) {
            console.log('⚠️ Server returned error, falling back to client-side');
            return await previewValuationPDF(record);
        }

        // Create blob URL for preview
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Open in new tab
        window.open(url, '_blank');

        console.log('✅ PDF preview opened');
        return url;
    } catch (error) {
        console.error('❌ PDF preview error:', error);
        throw error;
    }
}

/**
 * Client-side PDF generation using jsPDF + html2canvas
 * Works on Vercel without server-side dependencies
 */
export async function generateRecordPDFOffline(record) {
    try {
        console.log('📠 Generating PDF (client-side mode)');

        // Dynamically import jsPDF and html2canvas to avoid SSR issues
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        // Generate HTML from the record data
        const htmlContent = generateValuationReportHTML(record);

        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        container.style.width = '210mm';
        container.style.height = 'auto';
        container.style.backgroundColor = '#ffffff';
        container.style.fontSize = '9pt';
        container.style.fontFamily = "'Calibri', 'Arial', sans-serif";
        document.body.appendChild(container);

        // Convert HTML to canvas
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            windowHeight: container.scrollHeight,
            windowWidth: 793
        });

        // Remove temporary container
        document.body.removeChild(container);

        // Create PDF from canvas
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'A4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add pages to PDF
        while (heightLeft >= 0) {
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
            if (heightLeft > 0) {
                pdf.addPage();
            }
        }

        // Download PDF
        const filename = `valuation_${record?.uniqueId || Date.now()}.pdf`;
        pdf.save(filename);

        console.log('✅ PDF generated and downloaded:', filename);
        return filename;
    } catch (error) {
        console.error('❌ Client-side PDF generation error:', error);
        throw error;
    }
}


const pdfExportService = {
    generateValuationReportHTML,
    generateRecordPDF,
    previewValuationPDF,
    generateRecordPDFOffline
};

export default pdfExportService;
