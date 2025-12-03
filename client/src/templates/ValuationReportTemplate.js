/**
 * EXACT PIXEL-PERFECT VALUATION REPORT TEMPLATE
 * Clones the screenshot layout exactly
 * Rules: No empty pages, no empty rows, no blank cells
 */

export function generateExactValuationReportHTML(data = {}) {
  const {
    // Header & Identification
    bankName = 'Gujarat Gramin Bank',
    branchName = 'Manjalpur Branch',
    fileNo = '06GGB1025 10',
    valuationDate = '31-Oct-2025',
    inspectionDate = '30-Oct-2025',

    // Property Type & Owner
    propertyType = 'FLAT/HOUSE/INDUSTRIAL/SHOP',
    ownerName = 'Hemanshu Haribhai Patel',

    // Property Address
    propertyAddress = 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020',

    // Property Details
    carpetArea = '68.93',
    builtUpArea = 'NA',
    city = 'Vadodara',

    // Valuation Results
    fairMarketValue = '59,51,499.40',
    realizeableValue = '56,63,924.43',
    distressValue = '47,61,199.52',
    saleeedValue = 'NA',
    jantriValue = '16,12,962.00',
    insurableValue = '20,83,024.79',

    // Building Details
    numberOfFloors = 'Basement + Ground Floor + 7 Upper Floors',
    structureType = 'RCC Structure',
    commencementYear = '2025',

    // Flat Details
    flatFloor = '5th Floor',
    flatNo = 'Flat No. A-503',
    flatSpecification = '3BHK Residential Flat',
    roofType = 'RCC Slab',
    flooringType = 'Vitrified Tiles',
    doorType = 'Wooden Framed Flush Door',
    windowType = 'Section Windows',
    fittingsType = 'Good',
    finishingType = 'Interior Finishing',

    // Area Classification
    areaClass = 'Middle Class Area',
    areaType = 'Urban',
    occupancy = 'Vacant',

    // Marketability
    marketability = 'Good',
    marketingFactors = 'Proposed Fully Developed Scheme',
    negativeFactors = 'The Unforeseen Events',

    // Boundaries
    eastBoundaryDoc = 'Tower B',
    eastBoundaryActual = 'Tower B',
    westBoundaryDoc = 'Staircase, Passage',
    westBoundaryActual = 'Staircase, Passage',
    northBoundaryDoc = '36 Mt. Wide Road',
    northBoundaryActual = '36 Mt. Wide Road',
    southBoundaryDoc = 'Flat No. 501, Tower B',
    southBoundaryActual = 'Flat No. 501, Tower B',

    // Coordinates
    latitude = '22°16\'13.5"N',
    longitude = '73°11\'41.8"E',
    udsl = '20.49',
    city2 = 'Vadodara'
  } = data;

  return `
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
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      background: white;
      width: 100%;
      height: 100%;
      font-size: 8.5pt;
      line-height: 1.2;
    }
    
    @page {
      size: A4;
      margin: 17mm;
      padding: 0;
    }
    
    .page {
      width: 100%;
      page-break-after: always;
      page-break-inside: avoid;
      padding: 0;
      margin: 0;
      background: white;
      display: block;
      orphans: 1;
      widows: 1;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .content {
      width: 100%;
      padding: 0;
      margin: 0;
      display: block;
    }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 9pt;
      padding: 0;
    }
    
    .header-left {
      flex: 1;
      padding: 0;
    }
    
    .header-right {
      text-align: right;
      width: auto;
      padding: 0;
    }
    
    .header-line {
      margin: 0;
      font-size: 9pt;
      padding: 0;
      line-height: 1.0;
    }
    
    /* Title Box */
    .title-box {
      border: 1px solid #000;
      background-color: #E8E8E8;
      padding: 2px 4px;
      text-align: center;
      font-weight: bold;
      font-size: 9pt;
      margin-bottom: 2px;
      margin-top: 1px;
      line-height: 1.1;
    }
    
    /* Section Headers */
    .section-header {
      border: 1px solid #000;
      background-color: #E8E8E8;
      padding: 2px 4px;
      font-weight: bold;
      font-size: 9pt;
      margin: 0;
      margin-top: 1px;
      line-height: 1.1;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      border: 1px solid #000;
    }
    
    td, th {
      border: 0.5px solid #000;
      padding: 1px 2px;
      text-align: left;
      vertical-align: top;
      font-weight: normal;
      line-height: 1.1;
    }
    
    th {
      background-color: #E8E8E8;
      font-weight: bold;
      text-align: center;
      padding: 2px 3px;
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
    
    /* Spacing Helpers */
    .spacer-micro {
      height: 1px;
      display: block;
    }
    
    .spacer-small {
      height: 1px;
      display: block;
    }
    
    .spacer {
      height: 1px;
      display: block;
    }
    
    .spacer-large {
      height: 2px;
      display: block;
    }
    
    /* Limiting Conditions */
    .limiting-header {
      font-weight: bold;
      color: #0000FF;
      font-size: 9pt;
      margin: 1px 0 1px 0;
      line-height: 1.0;
    }
    
    .bullet-list {
      margin-left: 10px;
      font-size: 8pt;
      padding: 0;
    }
    
    .bullet-item {
      margin-bottom: 1px;
      line-height: 1.2;
    }
    
    /* Declaration */
    .declaration-header {
      font-weight: bold;
      border: 1px solid #000;
      background-color: #E8E8E8;
      padding: 2px 4px;
      font-size: 9pt;
      margin: 1px 0 0 0;
      line-height: 1.0;
    }
    
    .declaration-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0;
      border: 1px solid #000;
    }
    
    .declaration-table td {
      border: 0.5px solid #000;
      padding: 1px 2px;
      vertical-align: top;
      font-size: 8.5pt;
      line-height: 1.1;
    }
    
    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 2px;
      font-size: 9pt;
      padding-top: 2px;
    }
    
    .footer-left {
      flex: 1;
    }
    
    .footer-right {
      text-align: right;
      width: auto;
    }
    
    .footer-line {
      margin: 0;
      font-size: 9pt;
      padding: 0;
      line-height: 1.0;
    }
    
    /* Nested table styling */
    .nested-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .nested-table td {
      border: none;
      padding: 1px 2px;
      font-size: 8.5pt;
    }
    
    .blue-text {
      color: #0000FF;
    }
    
    /* No gaps, compact */
    tr {
      page-break-inside: avoid;
      height: auto;
    }
    
    /* Prevent widows and orphans */
    table {
      page-break-inside: avoid;
    }
    
    /* Force content to fit on pages */
    @page {
      margin: 17mm;
      orphans: 1;
      widows: 1;
    }
  </style>
</head>
<body>

<!-- ===== PAGE 1: GENERAL SECTION ===== -->
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
        <div class="header-line"><strong>File No: ${fileNo}</strong></div>
        <div class="header-line"><strong>Date: ${valuationDate}</strong></div>
      </div>
    </div>
    
    <div class="spacer-small"></div>
    
    <!-- Title -->
    <div class="title-box">
      VALUATION REPORT(IN RESPECT OF ${propertyType})
    </div>
    
    <!-- GENERAL Section -->
    <div class="section-header">GENERAL</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;">purpose for which valuation is made</td>
        <td style="width: 67%;">Financial Assistance for loan from GGB Bank</td>
      </tr>
      <tr>
        <td>2</td>
        <td colspan="2"><strong>(a) Date of inspection</strong></td>
      </tr>
      <tr>
        <td></td>
        <td colspan="2">${inspectionDate}</td>
      </tr>
      <tr>
        <td></td>
        <td colspan="2"><strong>(b) Date on which valuation is made</strong></td>
      </tr>
      <tr>
        <td></td>
        <td colspan="2">${valuationDate}</td>
      </tr>
      <tr>
        <td colspan="3"><strong>List of documents produced for pursual</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(1) Mortgage Deed :</strong></td>
        <td>Reg. No. 7204, Dated: 28/05/2025</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(2) Mortgage Deed Between :</strong></td>
        <td>Hemanshu Haribhai Patel & GGB Manjalpur Branch - Mr. Sanjaykumar</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>(3) Previous Valuation Report:</strong></td>
        <td>Issued By I S Associates Pvt. Ltd. On Dated: 20/03/2025</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(4) Previous Valuation Report In Favor of:</strong></td>
        <td>Mr. Hemanshu Haribhai Patel</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(5) Approved Plan No:</strong></td>
        <td>Approved by Vadodara Municipal Corporation, Ward No. 4, Order No.: RAH-SHB/19/20-21, Date: 26/11/2020</td>
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
    
    <!-- Location of the property -->
    <table>
      <tr>
        <td colspan="3"><strong>Location of the property</strong></td>
      </tr>
      <tr>
        <td style="width: 3%;">(a)</td>
        <td style="width: 30%;"><strong>Plot No/Survey No/Block No</strong></td>
        <td style="width: 67%;">R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.</td>
      </tr>
      <tr>
        <td>(b)</td>
        <td><strong>Door/Shop No</strong></td>
        <td>Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.</td>
      </tr>
      <tr>
        <td>(c)</td>
        <td><strong>TP Np/Village</strong></td>
        <td>Manjalpur</td>
      </tr>
      <tr>
        <td>(d)</td>
        <td><strong>Ward/Taluka</strong></td>
        <td>Vadodara</td>
      </tr>
      <tr>
        <td>(e)</td>
        <td><strong>Mandal/District</strong></td>
        <td>Vadodara</td>
      </tr>
      <tr>
        <td>(f)</td>
        <td><strong>Date of issue & Validity of layout plan</strong></td>
        <td>26-Nov-2020</td>
      </tr>
      <tr>
        <td>(g)</td>
        <td><strong>Approved map/plan issuing authority</strong></td>
        <td>Vadodara Municipal Corporation</td>
      </tr>
      <tr>
        <td>(h)</td>
        <td><strong>weather genuineness or authenticity of approved map/plan verified</strong></td>
        <td>Original Documents Not Produced To The Valuer For Scrutinity. We have verified scan copy of original.</td>
      </tr>
      <tr>
        <td>(i)</td>
        <td><strong>Any other comments by valuer on authentic of approved plan</strong></td>
        <td>Property is constructed as per approved plan</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Postal Address -->
    <table>
      <tr>
        <td style="width: 3%;">7</td>
        <td style="width: 30%;"><strong>Postal address of the property</strong></td>
        <td style="width: 67%;">${propertyAddress}</td>
      </tr>
      <tr>
        <td>8</td>
        <td colspan="2">
          <table class="nested-table">
            <tr>
              <td style="width: 50%;"><strong>City/Town</strong></td>
              <td style="width: 50%;">${city}</td>
            </tr>
            <tr>
              <td><strong>Residential Area</strong></td>
              <td>Yes</td>
            </tr>
            <tr>
              <td><strong>Commercial Area</strong></td>
              <td>No</td>
            </tr>
            <tr>
              <td><strong>Industrial Area</strong></td>
              <td>No</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 2: APARTMENT BUILDING & FLAT DETAILS ===== -->
<div class="page">
  <div class="content">
    <!-- II. APARTMENT BUILDING -->
    <div class="section-header">II.APARTMENT BUILDING</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;"><strong>Nature of Apartment</strong></td>
        <td style="width: 67%;">Residential Flat</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Location</strong></td>
        <td>${city2}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Survey/Block No.</strong></td>
        <td>R.S. No. 101, 102/2, 106/2 Paiki 2</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>TP, FP  No.</strong></td>
        <td>T.P.S. No. 29, F.P. No. 3+24</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Village/Municipality/Corporation</strong></td>
        <td>Vadodara Municipal Corporation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Door No,Street or Road (Pin Code)</strong></td>
        <td>390011</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Description of the locality<br/>Residential/Commercial/Mixed</strong></td>
        <td>Residential Flat in Developed Area.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Commencement Year of construction</strong></td>
        <td>${commencementYear}</td>
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
        <td>As Per Plan</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- III. FLAT -->
    <div class="section-header">III. Flat</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;"><strong>The floor on which the Flat is situated</strong></td>
        <td style="width: 67%;">5th Floor</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Door No. Of the Flat</strong></td>
        <td>Flat No. A-503</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Specification of the Flat</strong></td>
        <td>3BHK Residential Flat</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Roof</strong></td>
        <td>RCC Slab</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Flooring</strong></td>
        <td>Vitrified Tiles</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Doors</strong></td>
        <td>Wooden Framed Flush Door</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Windows</strong></td>
        <td>Section Windows</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Fittings</strong></td>
        <td>Good</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Finishing</strong></td>
        <td>Interior Finishing</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>House Tax</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Assessment no</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Tax paid in the name of</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Tax amount</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Electricity service connection no.</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Meter card is in name of</strong></td>
        <td>NA</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>How is the maintenance of the Flat?</strong></td>
        <td>Well Maintained</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Sale Deed in the name of</strong></td>
        <td>Hemanshu Haribhai Patel</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>What is the undivided area of land as per sale deed? (sq.MT.)</strong></td>
        <td>20.49</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>What is the plinth area of the Flat ?</strong></td>
        <td>Built Up Area (Sq.mt.): <strong>NA</strong><br/>Carpet Area (Sq.mt.): <strong>${carpetArea}</strong></td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>What is the FSI?</strong></td>
        <td>2.7</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>What is the Carpet Area of the Flat consider for valuation?</strong></td>
        <td>${carpetArea}</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Is it posh/ I class/Medium / Ordinary</strong></td>
        <td>Medium</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>IS it being used for residential or comercial purpose?</strong></td>
        <td>Used As Residential Flat</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>is it is owner occupied or Rent out?</strong></td>
        <td>Vacant</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>if rented ,what is the monthly rent?</strong></td>
        <td>Not Applicable</td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 3: CLASSIFICATION & APARTMENT DETAILS ===== -->
<div class="page">
  <div class="content">
    <!-- Classification section (continued from previous page) -->
    <table>
      <tr>
        <td style="width: 3%;">9</td>
        <td style="width: 33%;"><strong>Classification Of The Area</strong></td>
        <td style="width: 64%;"></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(a) High/Middle/Poor</strong></td>
        <td>Middle Class Area</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(b) Urban/Semi Urban/Rural</strong></td>
        <td>Urban</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Coming under Corporation limits/Village Panchayat/Municipality</strong></td>
        <td>Vadodara Municipal Corporation</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Weather convered under any State/Central Govt.enactments(e.g. Urban land celling act)or notified under agenc area/scheduled area/cantonment area</strong></td>
        <td>As Per General Development Control Regulation.</td>
      </tr>
      <tr>
        <td>12</td>
        <td colspan="2"><strong>Boundaries of the property</strong></td>
      </tr>
      <tr>
        <td></td>
        <td><strong>East</strong></td>
        <td>${eastBoundaryDoc} | ${eastBoundaryActual}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>West</strong></td>
        <td>${westBoundaryDoc} | ${westBoundaryActual}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>North</strong></td>
        <td>${northBoundaryDoc} | ${northBoundaryActual}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>South</strong></td>
        <td>${southBoundaryDoc} | ${southBoundaryActual}</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>Extent of the Site</strong></td>
        <td>Built Up Area (Sq.mt.): <strong>NA</strong><br/>Carpet Area (Sq.mt.): <strong>${carpetArea}</strong><br/>UDSL (Sq.mt.): <strong>${udsl}</strong></td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Latitude,Longitude & Co ordinates of flat</strong></td>
        <td>${latitude} ${longitude}</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>Extent of the Site Considered for valuation</strong></td>
        <td>Carpet Area (Sq.mt.): <strong>${carpetArea}</strong></td>
      </tr>
      <tr>
        <td>16</td>
        <td><strong>Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month</strong></td>
        <td>Vacant</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Apartment Building II -->
    <div class="section-header">II.APARTMENT BUILDING</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>Nature of Apartment</strong></td>
        <td style="width: 64%;">Residential Flat</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Location</strong></td>
        <td>Vadodara</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Survey/Block No.</strong></td>
        <td>R.S. No. 101, 102/2, 106/2 Paiki 2</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>TP, FP  No.</strong></td>
        <td>T.P.S. No. 29, F.P. No. 3+24</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Village/Municipality/Corporation</strong></td>
        <td>Vadodara Municipal Corporation</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Door No,Street or Road (Pin Code)</strong></td>
        <td>390011</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Description of the locality<br/>Residential/Commercial/Mixed</strong></td>
        <td>Residential Flat in Developed Area.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Commencement Year of construction</strong></td>
        <td>2025</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Number of Floor</strong></td>
        <td>Basement + Ground Floor + 7 Upper Floors</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Type Of Structure</strong></td>
        <td>RCC Structure</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Number of Dwelling units in the building</strong></td>
        <td>As Per Plan</td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 4: MARKETABILITY & RATE ===== -->
<div class="page">
  <div class="content">
    <!-- IV MARKETIBILITY -->
    <div class="section-header">IV MARKETIBILITY</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 33%;"><strong>How is marketability?</strong></td>
        <td style="width: 64%;">Good</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>What are the factors favouring for an extra potential value?</strong></td>
        <td>Proposed Fully Developed Scheme</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Any negative factors are observed which affect the market value in general?</strong></td>
        <td>The Unforeseen Events</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- V RATE -->
    <div class="section-header">V RATE</div>
    
    <table>
      <tr>
        <td style="width: 3%;">1</td>
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
        <td>(i) Building + Services</td>
        <td>24 x 7 Water Supply & Security</td>
      </tr>
      <tr>
        <td></td>
        <td>(ii) Land+Others</td>
        <td>Fully Developed Scheme  & Interior</td>
      </tr>
      <tr>
        <td>4</td>
        <td colspan="2"><strong>Guideline rate obtained from the Registrar's office</strong></td>
      </tr>
      <tr>
        <td colspan="3">Jantri rate: Rs. 23400/- per sq. mt. for composite rate for the year 2023.</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Per Sq. Mt.</strong></td>
        <td>${carpetArea}<span style="float: right;">₹ 23,400.00</span></td>
      </tr>
      <tr>
        <td></td>
        <td colspan="2"><strong>Total Jantri Value</strong> ₹ 16,12,962.00</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION -->
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
        <td colspan="2"><strong>Total Composite rate arrived for valuation</strong></td>
      </tr>
      <tr>
        <td colspan="3">₹ 64,580.00 <strong style="float: right;">Per Sq.mt. Carpet Area</strong></td>
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
        <td colspan="2"><strong>Total Composite rate</strong></td>
      </tr>
      <tr>
        <td colspan="3">₹ 64,580.00 <strong style="float: right;">Per Sq.mt. Carpet Area</strong></td>
      </tr>
    </table>
  </div>
</div>

<!-- ===== PAGE 5: DETAILS OF VALUATION & APPRAISAL ===== -->
<div class="page">
  <div class="content">
    <!-- DETAILS OF VALUATION -->
    <div class="section-header">DETAILS OF VALUATION</div>
    
    <table>
      <tr>
        <th style="width: 5%;">No.</th>
        <th style="width: 35%;">DESCRIPTION</th>
        <th style="width: 20%;">Area in Sq. mt.</th>
        <th style="width: 20%;">RATE</th>
        <th style="width: 20%;">VALUE</th>
      </tr>
      <tr>
        <td class="center">1</td>
        <td>Present value of the Flat - Carpet Area</td>
        <td class="center">${carpetArea}</td>
        <td class="right">₹ 64,580.00</td>
        <td class="right">₹ 44,51,499.40</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Value Of The Flat</strong></td>
        <td class="right"><strong>₹ 44,51,499.40</strong></td>
      </tr>
      <tr>
        <td class="center">2</td>
        <td>Fixed Furniture & Fixtures</td>
        <td colspan="2"></td>
        <td class="right">₹ 15,00,000.00</td>
      </tr>
      <tr>
        <td colspan="4" class="right"><strong>Total Value Of The Flat</strong></td>
        <td class="right"><strong>₹ 59,51,499.40</strong></td>
      </tr>
      <tr>
        <td colspan="5" class="right"><strong>In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.</strong></td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- Appraisal Results -->
    <div style="font-weight: bold; font-size: 9pt; margin-bottom: 2px; margin-top: 2px;">As a result of my appraisal and analysis,</div>
    
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
        <td>${saleeedValue}</td>
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
    
    <!-- Copy Of Document -->
    <table>
      <tr>
        <td style="width: 50%;"><strong>Copy Of Document Shown To Us</strong></td>
        <td style="width: 50%;">Mortgage Deed, Approved Plan, Previous Valuation Report</td>
      </tr>
    </table>
    
    <div class="spacer"></div>
    
    <!-- STATEMENT OF LIMITING CONDITIONS -->
    <div class="limiting-header blue-text">STATEMENT OF LIMITING CONDITIONS</div>
    
    <div class="bullet-list">
      <div class="bullet-item">• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.</div>
      <div class="bullet-item">• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.</div>
      <div class="bullet-item">• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.</div>
      <div class="bullet-item">• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.</div>
      <div class="bullet-item">• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.</div>
      <div class="bullet-item">• If found any typo error in this report is not counted for any legal action and obligation.</div>
    </div>
    
    <div class="spacer-micro"></div>
    
    <!-- VIII DECLARATION -->
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
    
    <div class="spacer"></div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-line">Place: Vadodara</div>
        <div class="footer-line">Date: 31/10/2025</div>
      </div>
      <div class="footer-right">
        <div class="footer-line" style="text-align: right;"><strong>SIGNATURE OF THE VALUER</strong></div>
        <div class="footer-line" style="text-align: right;"><strong>MAHIM ARCHITECTS</strong></div>
      </div>
    </div>
    
    <div class="spacer-micro"></div>
    
    <!-- Enclosure -->
    <div style="font-size: 8.5pt; line-height: 1.4;">
      <strong>Enclsd: 1. Declaration from the valuer</strong><br/>
      The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only).
    </div>
    
    <div class="spacer-micro"></div>
    
    <!-- Signature -->
    <div style="display: flex; justify-content: flex-end; font-size: 9pt; text-align: center;">
      <div style="width: 250px;">
        <div style="margin-bottom: 20px;"></div>
        <strong>SIGNATURE</strong><br/>
        <strong>NAME OF BRANCH OFFICIAL WITH SEAL</strong>
      </div>
    </div>
  </div>
</div>

</body>
</html>
`;
}

export default generateExactValuationReportHTML;
