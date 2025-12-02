import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generates an exact 1:1 clone PDF from HTML using Chromium/Puppeteer
 * This creates a production-quality, pixel-perfect PDF matching the screenshots
 */

export async function generateValuationReportPDF(data = {}, outputPath) {
    let browser;
    try {
        console.log('📄 [PDF] Starting PDF generation...');

        // Import puppeteer dynamically (will need to be installed)
        let puppeteer;
        try {
            puppeteer = (await import('puppeteer')).default;
            console.log('✅ [PDF] Puppeteer loaded successfully');
        } catch (err) {
            console.error('❌ [PDF] Puppeteer not installed. Install with: npm install puppeteer');
            throw new Error('Puppeteer is required for PDF generation');
        }

        const html = generateHTMLContent(data);
        console.log('✅ [PDF] HTML content generated');

        console.log('📂 [PDF] Launching browser...');
        
        // Determine launch options based on environment
        const launchOptions = {
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        };
        
        // For Vercel serverless, use executablePath if available
        if (process.env.VERCEL && process.env.NODE_ENV === 'production') {
            console.log('🔧 [PDF] Vercel environment detected, adjusting launch options');
            launchOptions.args.push('--single-process');
        }
        
        browser = await puppeteer.launch(launchOptions);
        console.log('✅ [PDF] Browser launched');

        const page = await browser.newPage();
        console.log('✅ [PDF] Page created');

        // Set viewport for A4 size
        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 1
        });
        console.log('✅ [PDF] Viewport set');

        console.log('📝 [PDF] Setting page content...');
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        console.log('✅ [PDF] Page content loaded');

        // Add small delay for rendering
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Ensure output directory exists for Vercel /tmp
        const filename = outputPath || path.join(process.cwd(), `valuation_${data.uniqueId || Date.now()}.pdf`);
        console.log('📄 [PDF] Output path:', filename);
        
        // Create directory if it doesn't exist
        const dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            console.log('📂 [PDF] Creating output directory:', dir);
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log('🖨️ [PDF] Generating PDF...');
        await page.pdf({
            path: filename,
            format: 'A4',
            margin: {
                top: '17mm',
                right: '17mm',
                bottom: '17mm',
                left: '17mm'
            },
            printBackground: true,
            preferCSSPageBreak: true
        });
        console.log('✅ [PDF] PDF generated successfully');

        await browser.close();
        console.log('✅ [PDF] Browser closed');

        return filename;
    } catch (error) {
        console.error('❌ [PDF] PDF Generation Error:', error.message);
        console.error('❌ [PDF] Stack:', error.stack);

        // Try to close browser if it exists
        if (browser) {
            try {
                await browser.close();
            } catch (closeErr) {
                console.error('❌ [PDF] Error closing browser:', closeErr.message);
            }
        }

        throw error;
    }
}

/**
 * Generate the complete HTML content for the PDF
 */
function generateHTMLContent(data = {}) {
    // Extract pdfDetails if available, otherwise use root level
    const pdf = data.pdfDetails || data;

    // Extract data directly from API - NO STATIC DEFAULTS
    // If field is missing, it will show as empty in PDF
    const bankName = data.bankName || '';
    const branchName = pdf.branch || '';
    const fileNo = pdf.formId || '';
    const valuationDate = pdf.valuationMadeDate || '';
    const inspectionDate = pdf.inspectionDate || '';
    const propertyType = pdf.apartmentNature || '';
    const ownerName = pdf.ownerName || '';
    const propertyAddress = pdf.postalAddress || pdf.doorShopNo || '';

    // Mortgage Details
    const mortgageDeedNo = pdf.mortgageDeed || '';
    const mortgageBetween = pdf.mortgageDeedBetween || '';
    const previousValuationReport = pdf.previousValuationReport || '';
    const previousValuationInFavorOf = pdf.previousValuationInFavorOf || '';
    const approvedPlanNo = pdf.approvedPlanNo || '';

    // Location Details
    const plotSurveyNo = pdf.plotSurveyBlockNo || '';
    const doorShopNo = pdf.doorShopNo || '';
    const tpVillage = pdf.tpVillage || '';
    const wardTaluka = pdf.wardTaluka || '';
    const mandlDistrict = pdf.mandalDistrict || '';
    const layoutPlanDate = pdf.layoutPlanIssueDate || '';
    const planAuthority = pdf.approvedMapAuthority || '';

    // Building Details
    const natureOfApartment = pdf.apartmentNature || '';
    const location = pdf.apartmentLocation || '';
    const surveyBlockNo = pdf.surveyBlockNo || '';
    const ageOfBuilding = pdf.buildingAge || '';
    const totalStories = pdf.numberOfFloors || '';
    const cityTown = pdf.cityTown || '';
    const residentialArea = pdf.residentialArea || '';
    const commercialArea = pdf.commercialArea || '';
    const industrialArea = pdf.industrialArea || '';
    const natureOfConstruction = pdf.structureType || '';
    const qualityOfConstruction = pdf.qualityOfConstruction || '';
    const appearanceOfBuilding = pdf.buildingAppearance || '';
    const maintenanceOfBuilding = pdf.buildingMaintenance || '';
    const lift = (pdf.facilities && pdf.facilities.lift) ? 'Yes' : '';
    const waterSupply = (pdf.facilities && pdf.facilities.waterSupply) ? 'Yes' : '';
    const undergroundSewerage = (pdf.facilities && pdf.facilities.sewerage) ? 'Yes' : '';
    const carParking = (pdf.facilities && pdf.facilities.parking) ? 'Yes' : '';
    const compoundWall = (pdf.facilities && pdf.facilities.compoundWall) ? 'Yes' : '';
    const pavementLaid = (pdf.facilities && pdf.facilities.pavement) ? 'Yes' : '';

    // Flat Details
    const flatFloor = pdf.flatFloor || '';
    const flatDoorNo = pdf.flatDoorNo || '';
    const flatSpecification = (pdf.flatSpecifications && pdf.flatSpecifications.specifications) || '';
    const roof = (pdf.flatSpecifications && pdf.flatSpecifications.roof) || '';
    const flooring = (pdf.flatSpecifications && pdf.flatSpecifications.flooring) || '';
    const doors = (pdf.flatSpecifications && pdf.flatSpecifications.doors) || '';
    const windows = (pdf.flatSpecifications && pdf.flatSpecifications.windows) || '';
    const fittings = (pdf.flatSpecifications && pdf.flatSpecifications.fittings) || '';
    const finishing = (pdf.flatSpecifications && pdf.flatSpecifications.finishing) || '';
    const houseTax = pdf.houseTax || '';
    const assessmentNo = (pdf.houseTax && pdf.houseTax.assessmentNo) || '';
    const taxPaidName = (pdf.houseTax && pdf.houseTax.taxPaidBy) || '';
    const taxAmount = (pdf.houseTax && pdf.houseTax.taxAmount) || '';
    const electricityConnectionNo = (pdf.electricityConnection && pdf.electricityConnection.connectionNo) || '';
    const meterCardName = (pdf.electricityConnection && pdf.electricityConnection.meterName) || '';
    const flatMaintenance = pdf.flatMaintenance || '';
    const saleDeedName = pdf.saleDeedName || '';
    const undividedArea = pdf.undividedLandArea || '';
    const carpetArea = pdf.carpetArea || '';
    const builtUpArea = pdf.builtUpArea || '';
    const fsi = pdf.fsi || '';
    const flatClass = pdf.flatClass || '';
    const flatUsage = pdf.usage || '';
    const occupancyStatus = pdf.occupancy || '';
    const monthlyRent = pdf.rent || '';

    // Marketability
    const marketability = pdf.marketability || '';
    const positiveFactors = pdf.positiveFactors || '';
    const negativeFactors = pdf.negativeFactors || '';

    // Rate Details
    const marketRange = pdf.marketRange || '';
    const adoptedRate = pdf.compositeRate ? '₹ ' + pdf.compositeRate : '';
    const jantriRate = pdf.jantriRate ? 'Rs. ' + pdf.jantriRate + '/- per sq. mt.' : '';
    const buildingServices = pdf.buildingServiceRate || '';
    const landOthers = pdf.landOtherRate || '';

    // Valuation Values
    const flatValue = pdf.presentValue ? '₹ ' + pdf.presentValue : '';
    const furnitureFixtures = pdf.furnitureFixtureValue ? '₹ ' + pdf.furnitureFixtureValue : '';
    const totalFlatValue = pdf.totalValue ? '₹ ' + pdf.totalValue : '';
    const totalFlatValueWords = pdf.fairMarketValueWords || '';
    const fairMarketValue = pdf.fairMarketValue || '';
    const realizeableValue = pdf.realizableValue || '';
    const distressValue = pdf.distressValue || '';
    const jantriValue = pdf.totalJantriValue || '';
    const insurableValue = pdf.insurableValue || '';
    const saleDeadValue = pdf.saleDeedValue || '';

    // Documents
    const documentsCopies = pdf.documentsCopies || '';

    // Declaration
    const inspectionDate2 = pdf.inspectionDate ? new Date(pdf.inspectionDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) + ',' : '';
    const place = pdf.place || '';
    const reportDate = pdf.reportDate || '';
    const valuationDate2 = pdf.valuationMadeDate || '';
    const valuationAmount = pdf.fairMarketValue ? 'Rs. ' + pdf.fairMarketValue + '/-' : '';
    const valuationAmountWords = pdf.fairMarketValueWords || '';
    const valuationCompany = pdf.signerName || '';

    // Replace escaped template literals in the HTML string
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valuation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #000000;
      background: white;
      padding: 0;
      margin: 0;
    }
    
    @page {
      size: A4;
      margin: 17mm;
      padding: 0;
    }
    
    .page {
      width: 100%;
      background: white;
      padding: 0;
      margin: 0;
      display: block;
      page-break-after: always;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    /* Header and main content */
    .content {
      width: 100%;
      padding: 0;
      margin: 0;
    }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      margin: 0 0 2px 0;
      font-size: 9pt;
      font-family: Helvetica, Arial, sans-serif;
      page-break-after: avoid;
    }
    
    .header-left {
      flex: 1;
    }
    
    .header-right {
      text-align: right;
      width: 150px;
    }
    
    .header-line {
      font-size: 9pt;
      margin: 0;
      line-height: 1.1;
    }
    
    /* Title Section */
    .title-box {
      border: 1px solid black;
      background-color: #E8E8E8;
      padding: 6px;
      text-align: center;
      font-weight: bold;
      font-size: 9pt;
      margin: 2px 0;
      page-break-after: avoid;
    }
    
    .section-header {
      border: 1px solid black;
      background-color: #E8E8E8;
      padding: 6px;
      font-weight: bold;
      font-size: 9pt;
      margin: 0;
      page-break-after: avoid;
      page-break-before: avoid;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
      margin-bottom: 0;
      margin-top: 0;
    }
    
    td, th {
      border: 0.5px solid black;
      padding: 3px 4px;
      text-align: left;
      vertical-align: top;
      font-weight: normal;
    }
    
    th {
      background-color: #E8E8E8;
      font-weight: bold;
      text-align: center;
    }
    
    .center {
      text-align: center;
    }
    
    .right {
      text-align: right;
    }
    
    .bold {
      font-weight: bold;
    }
    
    /* Limiting Conditions */
    .limiting-conditions {
      font-size: 8pt;
      margin: 0;
      padding: 0;
      page-break-inside: avoid;
    }
    
    .limiting-header {
      font-weight: bold;
      color: #0000FF;
      font-size: 9pt;
      margin: 0 0 2px 0;
      page-break-after: avoid;
    }
    
    .bullet-list {
      margin: 0;
      padding-left: 15px;
      page-break-inside: avoid;
    }
    
    .bullet-item {
      margin: 1px 0;
      line-height: 1.2;
      page-break-inside: avoid;
    }
    
    /* Declaration Section */
    .declaration-header {
      font-weight: bold;
      border: 1px solid black;
      background-color: #E8E8E8;
      padding: 6px;
      font-size: 9pt;
      margin: 0;
      page-break-after: avoid;
      page-break-before: avoid;
    }
    
    .declaration-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      page-break-inside: avoid;
    }
    
    .declaration-table td {
      border: 0.5px solid black;
      padding: 3px 4px;
      vertical-align: top;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }
    
    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      margin: 0;
      font-size: 9pt;
      padding: 0;
      page-break-inside: avoid;
    }
    
    .footer-left {
      flex: 1;
    }
    
    .footer-right {
      text-align: right;
      width: 200px;
    }
    
    .footer-line {
      margin: 1px 0;
      line-height: 1.1;
    }
    
    /* Spacing helpers - DISABLED for compact layout */
    .spacer-small {
      display: none;
    }
    
    .spacer {
      display: none;
    }
    
    .spacer-large {
      display: none;
    }
    
    /* Data values */
    .value {
      font-family: 'Courier New', monospace;
    }
    
    .blue-text {
      color: #0000FF;
    }
    
    /* Nested table styling */
    .nested-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .nested-table td {
      border: none;
      padding: 0;
      font-size: 8.5pt;
    }
  </style>
</head>
<body>

<!-- ===== PAGE 1 ===== -->
<div class="page">
  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
         <div class="header-line"><strong>To;</strong></div>
         <div class="header-line">${bankName} , Vadodara</div>
         <div class="header-line">${branchName}</div>
       </div>
       <div class="header-right">
         <div class="header-line"><strong>File No:</strong> ${fileNo}</div>
         <div class="header-line"><strong>Date:</strong> ${valuationDate}</div>
       </div>
    </div>
    
    <div class="spacer-small"></div>
    
    <!-- Title -->
     <div class="title-box">
       VALUATION REPORT(IN RESPECT OF ${propertyType})
     </div>
    
    <!-- General Section Header -->
    <div class="section-header">GENERAL</div>
    
    <!-- General Section Table -->
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;">Purpose for which valuation is made</td>
        <td style="width: 67%;">Financial Assistance for loan from GGB Bank</td>
      </tr>
      <tr>
        <td rowspan="5">2</td>
        <td colspan="2"><strong>(a) Date of inspection</strong></td>
      </tr>
      <tr>
        <td colspan="2">${inspectionDate}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>(b) Date on which valuation is made</strong></td>
      </tr>
      <tr>
        <td colspan="2">${valuationDate}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>List of documents produced for pursual</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(1) Mortgage Deed :</strong></td>
        <td>${mortgageDeedNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(2) Mortgage Deed Between :</strong></td>
        <td>${mortgageBetween}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>(3) Previous Valuation Report:</strong></td>
        <td>${previousValuationReport}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(4) Previous Valuation Report In Favor of:</strong></td>
        <td>${previousValuationInFavorOf}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(5) Approved Plan No:</strong></td>
        <td>${approvedPlanNo}</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Name of the Owner/Applicant:</strong></td>
        <td>${ownerName}</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Brief description of Property</strong></td>
        <td>It is a 3bhk Residential Flat at 5th Floor of Tower A of Brookfieldz Devbhumi Residency, Flat No. A/503.</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Location Section -->
    <table>
      <tr>
        <td style="width: 27%;"><strong>Location of the property</strong></td>
        <td style="width: 36%;"></td>
        <td style="width: 37%;"></td>
      </tr>
      <tr>
        <td><strong>(a) Plot No/Survey No/Block No</strong></td>
        <td></td>
        <td>${plotSurveyNo}</td>
      </tr>
      <tr>
        <td><strong>(b) Door/Shop No</strong></td>
        <td></td>
        <td>${doorShopNo}</td>
      </tr>
      <tr>
        <td><strong>(c) TP Np/Village</strong></td>
        <td></td>
        <td>${tpVillage}</td>
      </tr>
      <tr>
        <td><strong>(d) Ward/Taluka</strong></td>
        <td></td>
        <td>${wardTaluka}</td>
      </tr>
      <tr>
        <td><strong>(e) Mandal/District</strong></td>
        <td></td>
        <td>${mandlDistrict}</td>
      </tr>
      <tr>
        <td><strong>(f) Date of issue & Validity of layout plan</strong></td>
        <td></td>
        <td>${layoutPlanDate}</td>
      </tr>
      <tr>
        <td><strong>(g) Approved map/plan issuing authority</strong></td>
        <td></td>
        <td>${planAuthority}</td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 2 ===== -->
<div class="page">
  <div class="content">
    <!-- Apartment Building Section -->
    <div class="section-header">II.APARTMENT BUILDING</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>Nature of Apartment</strong></td>
        <td style="width: 64%;">${natureOfApartment}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Location</strong></td>
        <td>${location}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Survey/Block No.</strong></td>
        <td>${surveyBlockNo}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Age of the building when valued</strong></td>
        <td>${ageOfBuilding}</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Total number of stories in the building</strong></td>
        <td>${totalStories}</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Area Classification</strong></td>
        <td>
          <table class="nested-table">
            <tr>
              <td><strong>City/Town</strong></td>
              <td>${cityTown}</td>
            </tr>
            <tr>
              <td><strong>Residential Area</strong></td>
              <td>${residentialArea}</td>
            </tr>
            <tr>
              <td><strong>Comercial Area</strong></td>
              <td>${commercialArea}</td>
            </tr>
            <tr>
              <td><strong>Industrial Area</strong></td>
              <td>${industrialArea}</td>
            </tr>
          </table>
        </td>
      </tr>
      </table>
      
      <div class="spacer"></div>
      
      <!-- Quality of Construction Section -->
      <div class="section-header">II. QUALITY OF CONSTRUCTION/APARTMENT DESCRIPTION</div>
      
      <table>
      <tr>
        <td style="width: 3%;">6</td>
        <td style="width: 33%;"><strong>Nature of construction</strong></td>
        <td style="width: 64%;">${natureOfConstruction}</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Quality of Construction</strong></td>
        <td>${qualityOfConstruction}</td>
        </tr>
        <tr>
        <td>8</td>
        <td><strong>Apperance of the building</strong></td>
        <td>${appearanceOfBuilding}</td>
        </tr>
        <tr>
        <td>9</td>
        <td><strong>Maintenance of building</strong></td>
        <td>${maintenanceOfBuilding}</td>
        </tr>
        <tr>
        <td>10</td>
        <td><strong>Facilities Available</strong></td>
        <td></td>
        </tr>
        <tr>
        <td></td>
        <td><strong>Lift</strong></td>
        <td>${lift}</td>
        </tr>
        <tr>
        <td></td>
        <td><strong>Protected Water Supply</strong></td>
        <td>${waterSupply}</td>
        </tr>
        <tr>
        <td></td>
        <td><strong>Under ground sewerage</strong></td>
        <td>${undergroundSewerage}</td>
        </tr>
        <tr>
        <td></td>
        <td><strong>car parking-Open/Covered</strong></td>
        <td>${carParking}</td>
        </tr>
        <tr>
        <td></td>
        <td><strong>is compound wall Existing?</strong></td>
        <td>${compoundWall}</td>
        </tr>
        <tr>
        <td></td>
        <td><strong>is pavement laid around the building?</strong></td>
        <td>${pavementLaid}</td>
        </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Flat Section -->
    <div class="section-header">III. Flat</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>The floor on which the Flat is situated</strong></td>
        <td style="width: 64%;">${flatFloor}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Door No. Of the Flat</strong></td>
        <td>${flatDoorNo}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Specification of the Flat</strong></td>
        <td>${flatSpecification}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Roof</strong></td>
        <td>${roof}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Flooring</strong></td>
        <td>${flooring}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Doors</strong></td>
        <td>${doors}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Windows</strong></td>
        <td>${windows}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Fittings</strong></td>
        <td>${fittings}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Finishing</strong></td>
        <td>${finishing}</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>House Tax</strong></td>
        <td>${houseTax}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Assessment no</strong></td>
        <td>${assessmentNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Tax paid in the name of</strong></td>
        <td>${taxPaidName}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Tax amount</strong></td>
        <td>${taxAmount}</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Electricity service connection no.</strong></td>
        <td>${electricityConnectionNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Meter card is in name of</strong></td>
        <td>${meterCardName}</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>How is the maintenance of the Flat?</strong></td>
        <td>${flatMaintenance}</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Sale Deed in the name of</strong></td>
        <td>${saleDeedName}</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>What is the undivided area of land as per sale deed? (sq.MT.)</strong></td>
        <td>${undividedArea}</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>What is the plinth area of the Flat ?</strong></td>
        <td>Built Up Area (Sq.mt.): <strong>${builtUpArea}</strong><br/>Carpet Area (Sq.mt.): <strong>${carpetArea}</strong></td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>What is the FSI?</strong></td>
        <td>${fsi}</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>What is the Carpet Area of the Flat consider for valuation?</strong></td>
        <td>${carpetArea}</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Is it posh/ I class/Medium / Ordinary</strong></td>
        <td>${flatClass}</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>IS it being used for residential or comercial purpose?</strong></td>
        <td>${flatUsage}</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>is it is owner occupied or Rent out?</strong></td>
        <td>${occupancyStatus}</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>if rented ,what is the monthly rent?</strong></td>
        <td>${monthlyRent}</td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 3 ===== -->
<div class="page">
  <div class="content">
    <!-- Marketability Section -->
    <div class="section-header">IV. MARKETIBILITY</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>How is marketability?</strong></td>
        <td style="width: 64%;">${marketability}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>What are the factors favouring for an extra potential value?</strong></td>
        <td>${positiveFactors}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Any negative factors are observed which affect the market value in general?</strong></td>
        <td>${negativeFactors}</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Rate Section -->
    <div class="section-header">V. RATE</div>
    
    <table>
      <tr>
        <td style="width: 3%;"><br/></td>
        <td style="width: 33%;" colspan="1"></td>
        <td style="width: 64%;"></td>
      </tr>
      <tr>
        <td>1</td>
        <td colspan="2">After analysing the comparable sale instances, what is the composite rate for a similar flat with same specifications in the adjoining locality?</td>
      </tr>
      <tr>
        <td colspan="3">The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Also necessary information has been collected from nearby occupant. Our market inquiry among nearby occupant has revealed that similar sized property in the vicinity of the subject property is available in a range from ${marketRange} based on Carpet area.</td>
      </tr>
      <tr>
        <td>2</td>
        <td colspan="2">Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison</td>
      </tr>
      <tr>
        <td colspan="3">I have adopted market approach method for valuation of the property. Local Inquiry as well as market Survey</td>
      </tr>
      <tr>
        <td>3</td>
        <td colspan="2"><strong>Break up for the rate</strong></td>
      </tr>
      <tr>
        <td></td>
        <td>(i) Building + Services</td>
        <td>${buildingServices}</td>
      </tr>
      <tr>
        <td></td>
        <td>(ii) Land+Others</td>
        <td>${landOthers}</td>
      </tr>
      <tr>
        <td>4</td>
        <td colspan="2">Guideline rate obtained from the Registrar's office</td>
      </tr>
      <tr>
        <td colspan="3">Jantri rate: ${jantriRate} for composite rate for the year 2023.</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Per Sq. Mt.</strong></td>
        <td>${carpetArea}<span style="float: right;">${adoptedRate}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Total Jantri Value</strong></td>
        <td>₹ ${jantriValue}</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Composite Rate Section -->
    <div class="section-header">VI. COMPOSITE RATE ADOPTED AFTER DEPRECIATION</div>
    
    <table>
      <tr>
        <td style="width: 3%;">a</td>
        <td style="width: 50%;"><strong>Depreciated building rate</strong></td>
        <td style="width: 47%;">Consider In Valuation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Replacement cost of Flat with services</strong></td>
        <td>Consider In Valuation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Age of the building</strong></td>
        <td>${ageOfBuilding}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Life of the building estimated</strong></td>
        <td>50 Years</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Depreciation % assuming the salvage value as 10%</strong></td>
        <td>N.A.</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Depreciated ratio of the building</strong></td>
        <td>N.A.</td>
      </tr>
      <tr>
        <td>b</td>
        <td><strong>Total Composite rate arrived for valuation</strong></td>
        <td>${adoptedRate}<br/><strong>Per Sq.mt. Carpet Area</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Depreciated building rate VI (a)</strong></td>
        <td>Consider In Valuation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Rate of land & Other VI (3) ii</strong></td>
        <td>Composite Rate Method Of Valuation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Total Composite rate</strong></td>
        <td>${adoptedRate}<br/><strong>Per Sq.mt. Carpet Area</strong></td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Details of Valuation -->
    <div class="section-header">DETAILS OF VALUATION</div>
    
    <table>
      <tr>
        <th style="width: 5%;">No.</th>
        <th style="width: 30%;">DESCRIPTION</th>
        <th style="width: 25%;">Area in Sq. mt.</th>
        <th style="width: 20%;">RATE</th>
        <th style="width: 20%;">VALUE</th>
      </tr>
      <tr>
        <td class="center">1</td>
        <td>Present value of the Flat - Carpet Area</td>
        <td class="center">${carpetArea}</td>
        <td class="right">${adoptedRate}</td>
        <td class="right">${flatValue}</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Value Of The Flat</strong></td>
        <td class="right"><strong>${flatValue}</strong></td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td>Fixed Furniture & Fixtures</td>
        <td colspan="2"></td>
        <td class="right">${furnitureFixtures}</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Total Value Of The Flat</strong></td>
        <td class="right"><strong>${totalFlatValue}</strong></td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>In Words ${totalFlatValueWords}.</strong></td>
        <td></td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 4 (Final Page) ===== -->
<div class="page">
  <div class="content">
    <!-- Appraisal Results -->
    <div style="font-weight: bold; font-size: 9pt; margin-bottom: 6px;">As a result of my appraisal and analysis,</div>
    
    <table>
      <tr>
        <td style="width: 50%;"><strong>Fair Market Market Value</strong></td>
        <td style="width: 50%;">₹ ${fairMarketValue}</td>
      </tr>
      <tr>
        <td><strong>Realizeable Value 95% of M.V</strong></td>
        <td>₹ ${realizeableValue}</td>
      </tr>
      <tr>
        <td><strong>Distress value 80% of M.V</strong></td>
        <td>₹ ${distressValue}</td>
      </tr>
      <tr>
        <td><strong>Sale Deed Value</strong></td>
        <td>${saleDeadValue}</td>
      </tr>
      <tr>
        <td><strong>Jantri Value</strong></td>
        <td>₹ ${jantriValue}</td>
      </tr>
      <tr>
        <td><strong>Insurable Value</strong></td>
        <td>₹ ${insurableValue}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Remarks: Rate is given on Carpet Area.</strong></td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Documents -->
    <table>
      <tr>
        <td style="width: 50%;"><strong>Copy Of Document Shown To Us</strong></td>
        <td style="width: 50%;">${documentsCopies}</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Limiting Conditions -->
    <div class="limiting-header blue-text">STATEMENT OF LIMITING CONDITIONS</div>
    
    <div class="bullet-list">
      <div class="bullet-item">• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.</div>
      <div class="bullet-item">• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.</div>
      <div class="bullet-item">• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.</div>
      <div class="bullet-item">• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.</div>
      <div class="bullet-item">• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.</div>
      <div class="bullet-item">• If found any typo error in this report is not counted for any legal action and obligation.</div>
    </div>
    
    <div class="spacer"></div>
    
    <!-- Declaration -->
    <div class="declaration-header">VIII DECLARATION</div>
    
    <table class="declaration-table">
      <tr>
        <td colspan="2">I hereby declare that-</td>
      </tr>
      <tr>
        <td style="width: 5%; font-weight: bold;">a</td>
        <td>I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">b</td>
        <td>I further declare that I have personally inspected the site and building on ${inspectionDate2}.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">c</td>
        <td>I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">d</td>
        <td>Future life of property is based on proper maintenance of the property</td>
      </tr>
    </table>
    
    <div class="spacer-large"></div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-line">Place: ${place}</div>
        <div class="footer-line">Date: ${reportDate}</div>
      </div>
      <div class="footer-right">
        <div class="footer-line" style="text-align: right;"><strong>SIGNATURE OF THE VALUER</strong></div>
        <div class="footer-line" style="text-align: right;"><strong>${valuationCompany}</strong></div>
      </div>
    </div>
    
    <div class="spacer"></div>
    
    <!-- Enclosure -->
    <div style="font-size: 8.5pt; line-height: 1.4;">
      <strong>Enclsd: 1. Declaration from the valuer</strong><br/>
      The undersigned has inspected the property detailed in the Valuation report dated-${valuationDate2}. We are satisfied that the fair and reasonable market value of the property is ${valuationAmount} (In Words ${valuationAmountWords}).
    </div>
    
    <div class="spacer"></div>
    
    <!-- Signature -->
    <div style="display: flex; justify-content: space-between; font-size: 9pt; text-align: center;">
      <div style="flex: 1;"></div>
      <div style="flex: 1;"></div>
      <div style="flex: 1;">
        <div style="margin-bottom: 30px;"></div>
        <strong>SIGNATURE</strong><br/>
        <strong>NAME OF BRANCH OFFICIAL WITH SEAL</strong>
      </div>
    </div>
  </div>
</div>

</body>
</html>
`;
    return html;
}

export default {
    generateValuationReportPDF,
    generateHTMLContent
};
