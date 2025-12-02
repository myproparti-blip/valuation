import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generates an EXACT 1:1 clone PDF matching screenshots
 * All 5 pages with pixel-perfect layout and dynamic data binding
 */

export async function generateValuationReportPDF(data = {}, outputPath) {
    let browser;
    try {
        console.log('📄 [PDF] Starting exact PDF generation...');

        // Import puppeteer dynamically
        let puppeteer;
        try {
            puppeteer = (await import('puppeteer')).default;
            console.log('✅ [PDF] Puppeteer loaded successfully');
        } catch (err) {
            console.error('❌ [PDF] Puppeteer not installed. Install with: npm install puppeteer');
            throw new Error('Puppeteer is required for PDF generation');
        }

        const html = generateHTMLContent(data);
        console.log('✅ [PDF] HTML content generated (5 pages)');

        console.log('📂 [PDF] Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        });
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

        // Add delay for rendering
        await new Promise(resolve => setTimeout(resolve, 1500));

        const filename = outputPath || path.join(process.cwd(), `valuation_${data.pdfDetails?.formId || data.uniqueId || Date.now()}.pdf`);
        console.log('📄 [PDF] Output path:', filename);

        console.log('🖨️ [PDF] Generating PDF with 5 pages...');
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
 * Maps dynamic data from valuations API response
 */
function generateHTMLContent(data = {}) {
    // Extract data with fallbacks - supports both pdfDetails object and flat structure
    const pdfDetails = data.pdfDetails || data;
    
    const extractValue = (key, defaultVal = '') => {
        return pdfDetails[key] || data[key] || defaultVal;
    };

    const {
        // Header & General Info
        bankName = 'Gujarat Gramin Bank',
        branchName = 'Manjalpur Branch',
        formId = '06GGB1025 10',
        valuationMadeDate = '31-Oct-2025',
        inspectionDate = '30-Oct-2025',
        ownerName = 'Hemanshu Haribhai Patel',
        
        // Mortgage
        mortgageDeed = 'Reg. No. 7204, Dated: 28/05/2025',
        mortgageDeedBetween = 'Hemanshu Haribhai Patel & GGB Manjalpur Branch - Mr. Sanjaykumar',
        previousValuationReport = 'Issued By I S Associates Pvt. Ltd. On Dated: 20/03/2025',
        previousValuationInFavorOf = 'Mr. Hemanshu Haribhai Patel',
        approvedPlanNo = 'Approved by Vadodara Municipal Corporation, Ward No. 4, Order No.: RAH-SHB/19/20-21, Date: 26/11/2020',
        
        // Location Details
        plotSurveyBlockNo = 'R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.',
        doorShopNo = 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.',
        tpVillage = 'Manjalpur',
        wardTaluka = 'Vadodara',
        mandalDistrict = 'Vadodara',
        layoutPlanIssueDate = '26-Nov-2020',
        approvedMapAuthority = 'Vadodara Municipal Corporation',
        postalAddress = 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.',
        cityTown = 'Vadodara',
        residentialArea = 'Yes',
        commercialArea = 'No',
        industrialArea = 'No',
        classificationArea = 'Middle Class Area',
        urbanType = 'Urban',
        underCorporation = 'Vadodara Municipal Corporation',
        
        // Boundaries
        boundaryDocEast = 'Tower B',
        boundaryDocWest = 'Staircase, Passage',
        boundaryDocNorth = '36 Mt. Wide Road',
        boundaryDocSouth = 'Flat No. 501, Tower B',
        boundaryActEast = 'Tower B',
        boundaryActWest = 'Staircase, Passage',
        boundaryActNorth = '36 Mt. Wide Road',
        boundaryActSouth = 'Flat No. 501, Tower B',
        
        // Areas
        builtUpArea = 'NA',
        carpetArea = '68.93',
        udsLand = '20.49',
        siteConsideredArea = '68.93',
        latitudeLongitude = '22°16\'13.5"N 73°11\'41.8"E',
        
        // Building Details
        apartmentNature = 'Residential Flat',
        apartmentLocation = 'Vadodara',
        surveyBlockNo = 'R.S. No. 101, 102/2, 106/2 Paiki 2',
        tpFpNo = 'T.P.S. No. 29, F.P. No. 3+24',
        villageMunicipality = 'Vadodara Municipal Corporation',
        doorStreet = '390011',
        localityDescription = 'Residential Flat in Developed Area.',
        constructionYear = '2025',
        numberOfFloors = 'Basement + Ground Floor + 7 Upper Floors',
        structureType = 'RCC Structure',
        dwellingUnits = 'As Per Plan',
        qualityOfConstruction = 'Standard',
        buildingAppearance = 'Good',
        buildingMaintenance = 'Good',
        
        // Facilities
        lift = 'Yes',
        waterSupply = 'Yes',
        sewerage = 'Yes',
        parking = 'Yes',
        compoundWall = 'Yes',
        pavement = 'Yes',
        
        // Flat Details
        flatFloor = '5th Floor',
        flatDoorNo = 'Flat No. A-503',
        flatSpecifications = '3BHK Residential Flat',
        roof = 'RCC Slab',
        flooring = 'Vitrified Tiles',
        doors = 'Wooden Framed Flush Door',
        windows = 'Section Windows',
        fittings = 'Good',
        finishing = 'Interior Finishing',
        
        // House Tax
        houseTax = 'NA',
        assessmentNo = 'NA',
        taxPaidName = 'NA',
        taxAmount = 'NA',
        
        // Electricity
        electricityConnectionNo = 'NA',
        meterCardName = 'NA',
        
        // Flat Additional
        flatMaintenance = 'Well Maintained',
        saleDeedName = 'Hemanshu Haribhai Patel',
        undividedLandArea = '20.49',
        fsi = '2.7',
        flatClass = 'Medium',
        usage = 'Used As Residential Flat',
        occupancy = 'Vacant',
        rent = 'Not Applicable',
        
        // Marketability
        marketability = 'Good',
        positiveFactors = 'Proposed Fully Developed Scheme',
        negativeFactors = 'The Unforeseen Events',
        
        // Rate Analysis
        jantriRate = 'Rs. 23400/- per sq. mt. for composite rate for the year 2023.',
        buildingServices = '24 x 7 Water Supply & Security',
        landOthers = 'Fully Developed Scheme  & Interior',
        compositeRate = '₹ 64,580.00',
        
        // Valuation
        carpetAreaValuation = '68.93',
        finalCompositeRate = '₹ 64,580.00',
        presentValue = '₹ 44,51,499.40',
        furnitureFixtureValue = '₹ 15,00,000.00',
        totalValue = '₹ 59,51,499.40',
        totalValueWords = 'Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only',
        
        // Appraisal Values
        fairMarketValue = '59,51,499.40',
        realizableValue = '56,63,924.43',
        distressValue = '47,61,199.52',
        saleDeedValue = 'NA',
        totalJantriValue = '16,12,962.00',
        insurableValue = '20,83,024.79',
        
        // Declaration
        place = 'Vadodara',
        signatureDate = '31/10/2025',
        valuationCompany = 'MAHIM ARCHITECTS',
        valuationAmount = 'Rs. 59,51,499.40/-',
        valuationAmountWords = 'Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only'
    } = extractValue('bankName') ? pdfDetails : data;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exact Valuation Report</title>
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
      font-size: 8.5pt;
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
      page-break-inside: avoid;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .content {
      width: 100%;
      padding: 0;
      margin: 0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      margin: 0 0 2px 0;
      font-size: 9pt;
      page-break-after: avoid;
    }
    
    .header-left { flex: 1; }
    .header-right { text-align: right; width: 150px; }
    .header-line { font-size: 9pt; margin: 0; line-height: 1.1; }
    
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
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
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
    
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .blue { color: #0000FF; }
    
    .limiting-header {
      font-weight: bold;
      color: #0000FF;
      font-size: 9pt;
      margin: 2px 0;
      page-break-after: avoid;
    }
    
    .bullet-list { margin: 0; padding-left: 15px; }
    .bullet-item { margin: 1px 0; line-height: 1.2; page-break-inside: avoid; }
    
    .declaration-header {
      font-weight: bold;
      border: 1px solid black;
      background-color: #E8E8E8;
      padding: 6px;
      font-size: 9pt;
      margin: 0;
      page-break-after: avoid;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      margin: 0;
      font-size: 9pt;
      padding: 0;
      page-break-inside: avoid;
    }
    
    .footer-left { flex: 1; }
    .footer-right { text-align: right; width: 200px; }
    .footer-line { margin: 1px 0; line-height: 1.1; }
  </style>
</head>
<body>

<!-- =============== PAGE 1: GENERAL SECTION =============== -->
<div class="page">
  <div class="content">
    <div class="header">
      <div class="header-left">
        <div class="header-line"><strong>To;</strong></div>
        <div class="header-line">${bankName} , Vadodara</div>
        <div class="header-line">${branchName}</div>
      </div>
      <div class="header-right">
        <div class="header-line"><strong>File No:</strong> ${formId}</div>
        <div class="header-line"><strong>Date:</strong> ${valuationMadeDate}</div>
      </div>
    </div>
    
    <div class="title-box">
      VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)
    </div>
    
    <div class="section-header">GENERAL</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;"><strong>purpose for which valuation is made</strong></td>
        <td style="width: 67%;">Financial Assistance for loan from GGB Bank</td>
      </tr>
      <tr>
        <td rowspan="3">2</td>
        <td><strong>(a) Date of inspection</strong></td>
        <td>${inspectionDate}</td>
      </tr>
      <tr>
        <td><strong>(b) Date on which valuation is made</strong></td>
        <td>${valuationMadeDate}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>List of documents produced for pursuant</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(1) Mortgage Deed :</strong></td>
        <td>${mortgageDeed}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(2) Mortgage Deed Between :</strong></td>
        <td>${mortgageDeedBetween}</td>
      </tr>
      <tr>
        <td rowspan="4">3</td>
        <td><strong>(3) Previous Valuation Report:</strong></td>
        <td>${previousValuationReport}</td>
      </tr>
      <tr>
        <td><strong>(4) Previous Valuation Report In Favor of:</strong></td>
        <td>${previousValuationInFavorOf}</td>
      </tr>
      <tr>
        <td><strong>(5) Approved Plan No:</strong></td>
        <td>${approvedPlanNo}</td>
      </tr>
      <tr>
        <td></td>
        <td></td>
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
      <tr>
        <td rowspan="7">6</td>
        <td colspan="2"><strong>Location of the property</strong></td>
      </tr>
      <tr>
        <td><strong>(a) Plot No/Survey No/Block No</strong></td>
        <td>${plotSurveyBlockNo}</td>
      </tr>
      <tr>
        <td><strong>(b) Door/Shop No</strong></td>
        <td>${doorShopNo}</td>
      </tr>
      <tr>
        <td><strong>(c) TP Np/Village</strong></td>
        <td>${tpVillage}</td>
      </tr>
      <tr>
        <td><strong>(d) Ward/Taluka</strong></td>
        <td>${wardTaluka}</td>
      </tr>
      <tr>
        <td><strong>(e) Mandal/District</strong></td>
        <td>${mandalDistrict}</td>
      </tr>
      <tr>
        <td><strong>(f) Date of issue & Validity of layout plan</strong></td>
        <td>${layoutPlanIssueDate}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(g) Approved map/plan issuing authority</strong></td>
        <td>${approvedMapAuthority}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(h) weather genuineness or authenticity of approved map/plan verified</strong></td>
        <td>Original Documents Not Produced To The Valuer For Scrutinity. We have verified scan copy of original.</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(i) Any other comments by valuer on authentic of approved plan</strong></td>
        <td>Property is constructed as per approved plan</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Postal address of the property</strong></td>
        <td>${postalAddress}</td>
      </tr>
      <tr>
        <td rowspan="3">8</td>
        <td><strong>City/Town</strong></td>
        <td>${cityTown}</td>
      </tr>
      <tr>
        <td><strong>Residential Area</strong></td>
        <td>${residentialArea}</td>
      </tr>
      <tr>
        <td><strong>Commercial Area</strong></td>
        <td>${commercialArea}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Industrial Area</strong></td>
        <td>${industrialArea}</td>
      </tr>
    </table>
  </div>
</div>

<!-- =============== PAGE 2: BUILDING & APARTMENT DETAILS =============== -->
<div class="page">
  <div class="content">
    <!-- Continuation from Page 1 -->
    <table>
      <tr>
        <td style="width: 3%;">9</td>
        <td style="width: 33%;"><strong>Classification Of The Area</strong></td>
        <td style="width: 64%;"></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(a) High/Middle/Poor</strong></td>
        <td>${classificationArea}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(b) Urban/Semi Urban/Rural</strong></td>
        <td>${urbanType}</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Coming under Corporation limits/Village Panchayat/Municipality</strong></td>
        <td>${underCorporation}</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Weather convered under any State/Central Govt.enactments(e.g. Urban land ceiling act)or notified under agenc area/scheduled area/cantonment area</strong></td>
        <td>As Per General Development Control Regulation.</td>
      </tr>
      <tr>
        <td>12</td>
        <td colspan="2"><strong>Boundaries of the property</strong></td>
      </tr>
      <tr>
        <td></td>
        <td colspan="2"><strong>As per Document</strong><span style="float:right;"><strong>As per Actual</strong></span></td>
      </tr>
      <tr>
        <td></td>
        <td style="width: 50%;"><strong>East</strong></td>
        <td>${boundaryDocEast}<span style="float:right;">${boundaryActEast}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>West</strong></td>
        <td>${boundaryDocWest}<span style="float:right;">${boundaryActWest}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>North</strong></td>
        <td>${boundaryDocNorth}<span style="float:right;">${boundaryActNorth}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>South</strong></td>
        <td>${boundaryDocSouth}<span style="float:right;">${boundaryActSouth}</span></td>
      </tr>
      <tr>
        <td>13</td>
        <td colspan="2"><strong>Extent of the Site</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Built Up Area (Sq.mt.):</strong></td>
        <td>${builtUpArea}<span style="float:right;"><strong>Carpet Area (Sq.mt.):</strong></span><span style="float:right;">${carpetArea}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>UDSL (Sq.Mt.):</strong></td>
        <td>${udsLand}</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Latitude,Longitude & Co-ordinates of flat</strong></td>
        <td>${latitudeLongitude}</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>Extent of the Site Considered for valuation</strong></td>
        <td><strong>Carpet Area (Sq.mt.):</strong> ${siteConsideredArea}</td>
      </tr>
      <tr>
        <td>16</td>
        <td><strong>Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month</strong></td>
        <td>${occupancy}</td>
      </tr>
    </table>
    
    <div class="section-header">II.APARTMENT BUILDING</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>Nature of Apartment</strong></td>
        <td style="width: 64%;">${apartmentNature}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Location</strong></td>
        <td>${apartmentLocation}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Survey/Block No.</strong></td>
        <td>${surveyBlockNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>TP, FP No.</strong></td>
        <td>${tpFpNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Village/Municipality/Corporation</strong></td>
        <td>${villageMunicipality}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Door No,Street or Road (Pin Code)</strong></td>
        <td>${doorStreet}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Description of the locality</strong></td>
        <td>${localityDescription}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Residential/Commercial/Mixed</strong></td>
        <td>Residential</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Commencement Year of construction</strong></td>
        <td>${constructionYear}</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Number of Floor</strong></td>
        <td>${numberOfFloors}</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Type Of Structure</strong></td>
        <td>${structureType}</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Number of Dwelling units in the building</strong></td>
        <td>${dwellingUnits}</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Quality of Construction</strong></td>
        <td>${qualityOfConstruction}</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Apperance of the building</strong></td>
        <td>${buildingAppearance}</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Maintenance of building</strong></td>
        <td>${buildingMaintenance}</td>
      </tr>
      <tr>
        <td>11</td>
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
        <td>${sewerage}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>car parking-Open/Covered</strong></td>
        <td>${parking}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>is compound wall Existing?</strong></td>
        <td>${compoundWall}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>is pavement laid around the building?</strong></td>
        <td>${pavement}</td>
      </tr>
    </table>
    
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
        <td>${flatSpecifications}</td>
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
        <td>${undividedLandArea}</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>What is the plinth area of the Flat ?</strong></td>
        <td><strong>Built Up Area (Sq.mt.):</strong> ${builtUpArea}<br/><strong>Carpet Area (Sq.mt.):</strong> ${carpetArea}</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>What is the FSI?</strong></td>
        <td>${fsi}</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>What is the Carpet Area of the Flat consider for valuation?</strong></td>
        <td>${carpetAreaValuation}</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Is it posh/ I class/Medium / Ordinary</strong></td>
        <td>${flatClass}</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>IS it being used for residential or comercial purpose?</strong></td>
        <td>${usage}</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>is it is owner occupied or Rent out?</strong></td>
        <td>${occupancy}</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>if rented ,what is the monthly rent?</strong></td>
        <td>${rent}</td>
      </tr>
    </table>
  </div>
</div>

<!-- =============== PAGE 3: MARKETABILITY & RATE ANALYSIS =============== -->
<div class="page">
  <div class="content">
    <div class="section-header">IV MARKETIBILITY</div>
    
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
    
    <div class="section-header">V RATE</div>
    
    <table>
      <tr>
        <td style="width: 3%;"></td>
        <td style="width: 33%;"></td>
        <td style="width: 64%;"></td>
      </tr>
      <tr>
        <td>1</td>
        <td colspan="2"><strong>After analysing the comparable sale instances, what is the composite rate for a similar flat with same specifications in the adjoining locality?</strong></td>
      </tr>
      <tr>
        <td colspan="3">The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Also necessary information has been collected from nearby occupant. Our market inquiry among nearby occupant has revealed that similar sized property in the vicinity of the subject property is available in a range from Rs. 60000-65000 per sq. Mt. based on Carpet area.</td>
      </tr>
      <tr>
        <td>2</td>
        <td colspan="2"><strong>Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison</strong></td>
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
        <td><strong>(i) Building + Services</strong></td>
        <td>${buildingServices}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(ii) Land+Others</strong></td>
        <td>${landOthers}</td>
      </tr>
      <tr>
        <td>4</td>
        <td colspan="2"><strong>Guideline rate obtained from the Registrar's office</strong></td>
      </tr>
      <tr>
        <td colspan="3">${jantriRate}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Per Sq. Mt.</strong></td>
        <td>${carpetAreaValuation}<span style="float:right;">${compositeRate}</span></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Total Jantri Value</strong></td>
        <td>₹ ${totalJantriValue}</td>
      </tr>
    </table>
    
    <div class="section-header">VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION</div>
    
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
        <td>0 Years</td>
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
        <td>${finalCompositeRate}<br/><strong>Per Sq.mt. Carpet Area</strong></td>
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
        <td>${finalCompositeRate}<br/><strong>Per Sq.mt. Carpet Area</strong></td>
      </tr>
    </table>
    
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
        <td class="center">${carpetAreaValuation}</td>
        <td class="right">${compositeRate}</td>
        <td class="right">${presentValue}</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Value Of The Flat</strong></td>
        <td class="right"><strong>${presentValue}</strong></td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td>Fixed Furniture & Fixtures</td>
        <td colspan="2"></td>
        <td class="right">${furnitureFixtureValue}</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Total Value Of The Flat</strong></td>
        <td class="right"><strong>${totalValue}</strong></td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>In Words ${totalValueWords}.</strong></td>
        <td></td>
      </tr>
    </table>
  </div>
</div>

<!-- =============== PAGE 4: APPRAISAL & LIMITING CONDITIONS =============== -->
<div class="page">
  <div class="content">
    <div style="font-weight: bold; font-size: 9pt; margin-bottom: 6px;">As a result of my appraisal and analysis,</div>
    
    <table>
      <tr>
        <td style="width: 50%;"><strong>Fair Market Market Value</strong></td>
        <td style="width: 50%;">₹ ${fairMarketValue}</td>
      </tr>
      <tr>
        <td><strong>Realizeable Value 95% of M.V</strong></td>
        <td>₹ ${realizableValue}</td>
      </tr>
      <tr>
        <td><strong>Distress value 80% of M.V</strong></td>
        <td>₹ ${distressValue}</td>
      </tr>
      <tr>
        <td><strong>Sale Deed Value</strong></td>
        <td>${saleDeedValue}</td>
      </tr>
      <tr>
        <td><strong>Jantri Value</strong></td>
        <td>₹ ${totalJantriValue}</td>
      </tr>
      <tr>
        <td><strong>Insurable Value</strong></td>
        <td>₹ ${insurableValue}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>Remarks: Rate is given on Carpet Area.</strong></td>
      </tr>
    </table>
    
    <table style="margin-top: 6px;">
      <tr>
        <td style="width: 50%;"><strong>Copy Of Document Shown To Us</strong></td>
        <td style="width: 50%;">Mortgage Deed, Approved Plan, Previous Valuation Report</td>
      </tr>
    </table>
    
    <div class="limiting-header blue">STATEMENT OF LIMITING CONDITIONS</div>
    
    <div class="bullet-list">
      <div class="bullet-item">● If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.</div>
      <div class="bullet-item">● No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.</div>
      <div class="bullet-item">● Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.</div>
      <div class="bullet-item">● Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.</div>
      <div class="bullet-item">● Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.</div>
      <div class="bullet-item">● If found any typo error in this report is not counted for any legal action and obligation.</div>
    </div>
    
    <div class="declaration-header" style="margin-top: 6px;">VIII DECLARATION</div>
    
    <table style="margin: 0;">
      <tr>
        <td colspan="2">I hereby declare that-</td>
      </tr>
      <tr>
        <td style="width: 5%; font-weight: bold;">a</td>
        <td>I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">b</td>
        <td>I further declare that I have personally inspected the site and building on 30th October, 2025.</td>
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
    
    <div class="footer" style="margin-top: 6px;">
      <div class="footer-left">
        <div class="footer-line">Place: ${place}</div>
        <div class="footer-line">Date: ${signatureDate}</div>
      </div>
      <div class="footer-right">
        <div class="footer-line" style="text-align: right;"><strong>SIGNATURE OF THE VALUER</strong></div>
        <div class="footer-line" style="text-align: right;"><strong>${valuationCompany}</strong></div>
      </div>
    </div>
    
    <div style="font-size: 8.5pt; line-height: 1.4; margin-top: 6px;">
      <strong>Enclsd: 1. Declaration from the valuer</strong><br/>
      The undersigned has inspected the property detailed in the Valuation report dated-${valuationMadeDate}. We are satisfied that the fair and reasonable market value of the property is ${valuationAmount} (In Words ${valuationAmountWords}).
    </div>
    
    <div style="display: flex; justify-content: space-between; font-size: 9pt; text-align: center; margin-top: 20px;">
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

<!-- =============== PAGE 5: ADDITIONAL DETAILS (Continuation if needed) =============== -->
<div class="page">
  <div class="content">
    <div style="font-size: 9pt; padding: 6px; background: #F5F5F5; border: 1px solid #999;">
      <strong>NOTE:</strong> This PDF contains all required sections from the valuation report. Additional pages can be added as needed for specific property details or extended analysis.
    </div>
  </div>
</div>

</body>
</html>
`;
}

export default {
    generateValuationReportPDF,
    generateHTMLContent
};
