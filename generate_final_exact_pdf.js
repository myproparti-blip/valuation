const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true
});

const stream = fs.createWriteStream('Valuation_Report_Final.pdf');
doc.pipe(stream);

// ============ CONSTANTS ============
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

let y = MARGIN;

// ============ HELPER FUNCTIONS ============

function drawTableCell(x, cellY, width, height, text, options = {}) {
  const {
    fontSize = 8,
    bold = false,
    bgColor = null,
    textColor = '#000000',
    align = 'left',
    vertAlign = 'top'
  } = options;

  // Draw border
  doc.strokeColor('#000000').lineWidth(0.5);
  doc.rect(x, cellY, width, height).stroke();

  // Draw background if specified
  if (bgColor) {
    doc.fillColor(bgColor).rect(x, cellY, width, height).fill();
  }

  // Draw text
  doc.fillColor(textColor);
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize);

  const padding = 4;
  const textWidth = width - (2 * padding);

  const textHeight = doc.heightOfString(text, {
    width: textWidth,
    align: align
  });

  let textY = cellY;
  if (vertAlign === 'middle') {
    textY = cellY + (height - textHeight) / 2;
  } else if (vertAlign === 'top') {
    textY = cellY + padding;
  }

  doc.text(text, x + padding, textY, {
    width: textWidth,
    height: height - (2 * padding),
    align: align,
    lineGap: 1
  });
}

function drawTable(rows, colWidths, options = {}) {
  const {
    rowHeight = 16,
    fontSize = 8,
    hasHeader = false
  } = options;

  let tableY = y;
  const totalHeight = rows.length * rowHeight;

  rows.forEach((row, rowIdx) => {
    let x = MARGIN;

    row.forEach((cell, colIdx) => {
      const width = colWidths[colIdx];
      const isHeader = hasHeader && rowIdx === 0;

      drawTableCell(
        x,
        tableY + (rowIdx * rowHeight),
        width,
        rowHeight,
        String(cell || ''),
        {
          fontSize: fontSize,
          bold: isHeader,
          bgColor: isHeader ? '#E8E8E8' : null,
          textColor: '#000000',
          align: 'left',
          vertAlign: 'top'
        }
      );

      x += width;
    });
  });

  y = tableY + totalHeight;
}

function addSectionTitle(title) {
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
  doc.text(title, MARGIN, y, { width: CONTENT_WIDTH });
  y += 16;
}

function newPage() {
  doc.addPage();
  y = MARGIN;
}

function addBulletPoint(text) {
  doc.font('Helvetica').fontSize(8).fillColor('#000000');
  const bulletY = y;
  doc.text('●', MARGIN + 5, y, { width: 10 });
  doc.text(text, MARGIN + 20, bulletY, { width: CONTENT_WIDTH - 20 });
  const h = doc.heightOfString(text, { width: CONTENT_WIDTH - 20 });
  y += h + 4;
}

// ============ PAGE 1 ============

// Header
doc.font('Helvetica').fontSize(9).fillColor('#000000');
doc.text('To;', MARGIN, y);
y += 12;
doc.text('Gujarat Gramin Bank , Vadodara', MARGIN, y);
y += 12;
doc.text('Manjalpur Branch', MARGIN, y);

// Right-aligned header info
const rightY = y - 24;
doc.text('File No: [FILE_NUMBER]', MARGIN, rightY, { width: CONTENT_WIDTH - 10, align: 'right' });
doc.text('Date: [DATE]', MARGIN, rightY + 12, { width: CONTENT_WIDTH - 10, align: 'right' });

y += 18;
y += 8;

// Title
doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
doc.text('VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)', MARGIN, y, {
  width: CONTENT_WIDTH,
  align: 'center'
});
y += 16;

// GENERAL section
addSectionTitle('GENERAL');

const generalRows = [
  ['1', 'purpose for which valuation is made', '[PURPOSE_VALUE]'],
  ['2', '(a) Date of inspection', '[INSPECTION_DATE]'],
  ['', '(b) Date on which valuation is made', '[VALUATION_DATE]'],
  ['', 'List of documents produced for pursual', ''],
  ['', '(1) Mortgage Deed :', '[MORTGAGE_DEED_1]'],
  ['', '(2) Mortgage Deed Between :', '[MORTGAGE_DEED_2]'],
  ['3', '(3) Previous Valuation Report:', '[PREVIOUS_REPORT_1]'],
  ['', '(4) Previous Valuation Report In Favor of:', '[PREVIOUS_REPORT_2]'],
  ['', '(5) Approved Plan No:', '[APPROVED_PLAN]'],
  ['4', 'Name of the Owner/Applicant:', '[OWNER_NAME]'],
  ['5', 'Brief description of Property', '[PROPERTY_DESCRIPTION]'],
  ['', 'Location of the property', ''],
  ['', '(a) Plot No/Survey No/Block No', '[PLOT_SURVEY_BLOCK]'],
  ['', '(b) Door/Shop No', '[DOOR_SHOP_NUMBER]'],
  ['6', '(c) TP Np/Village', '[VILLAGE]'],
  ['', '(d) Ward/Taluka', '[TALUKA]'],
  ['', '(e) Mandal/District', '[DISTRICT]'],
  ['', '(f) Date of issue & Validity of layout plan', '[LAYOUT_VALIDITY_DATE]'],
  ['', '(g) Approved map/plan issuing authority', '[APPROVING_AUTHORITY]'],
  ['', '(h) weather genuineness or authenticity of approved map/plan verified', '[AUTHENTICITY_STATUS]'],
  ['', '(i) Any other comments by valuer on authentic of approved plan', '[VALUER_COMMENTS_PLAN]'],
  ['7', 'Postal address of the property', '[POSTAL_ADDRESS]'],
  ['8', 'City/Town', '[CITY_TOWN]'],
  ['', 'Residential Area', '[RES_AREA_YES_NO]'],
  ['', 'Commercial Area', '[COM_AREA_YES_NO]'],
  ['', 'Industrial Area', '[IND_AREA_YES_NO]'],
];

const colWidths = [40, 280, 245];
drawTable(generalRows, colWidths, { rowHeight: 16, fontSize: 8 });

y += 5;

// ============ PAGE 2 ============

newPage();

// Continuation of GENERAL (rows 9-16)
const rows916 = [
  ['9', 'Classification Of The Area', ''],
  ['', '(a) High/Middle/Poor', '[AREA_CLASSIFICATION]'],
  ['', '(b) Urban/Semi Urban/Rural', '[URBAN_RURAL_STATUS]'],
  ['10', 'Coming under Corporation limits/Village Panchayat/Municipality', '[MUNICIPAL_CORPORATION]'],
  ['11', 'Weather convered under any State/Central Govt.enactments(e.g. Urban land celling actior notified under agenc area/scheduled area/cantonment area', '[GOVT_ENACTMENTS]'],
  ['12', 'Boundaries of the property', ''],
  ['', 'East', '[EAST_BOUNDARY]'],
  ['', 'West', '[WEST_BOUNDARY]'],
  ['', 'North', '[NORTH_BOUNDARY]'],
  ['', 'South', '[SOUTH_BOUNDARY]'],
  ['13', 'Extent of the Site', ''],
  ['', 'Built Up Area (Sq.mt.):', '[BUILT_UP_AREA]'],
  ['', 'Carpet Area (Sq.mt.):', '[CARPET_AREA]'],
  ['', 'UDSL (Sq.Mt.):', '[UDSL_AREA]'],
  ['14', 'Latitude,Longitude & Co ordinates of flat', '[LATITUDE_LONGITUDE]'],
  ['15', 'Extent of the Site Considered for valuation', ''],
  ['', 'Carpet Area (Sq.mt.):', '[CARPET_AREA_VALUATION]'],
  ['16', 'Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month', '[OCCUPANCY_STATUS]'],
];

drawTable(rows916, colWidths, { rowHeight: 16, fontSize: 8 });

y += 8;

// II. APARTMENT BUILDING
addSectionTitle('II.APARTMENT BUILDING');

const apt_building = [
  ['1', 'Nature of Apartment', '[APARTMENT_TYPE]'],
  ['2', 'Location', '[LOCATION]'],
  ['', 'Survey/Block No.', '[SURVEY_BLOCK_NO]'],
  ['', 'TP, FP No.', '[TP_FP_NO]'],
  ['', 'Village/Municipality/Corporation', '[MUNICIPALITY_CORP]'],
  ['', 'Door No,Street or Road (Pin Code)', '[PIN_CODE]'],
  ['3', 'Description of the locality\nResidential/Commercial/Mixed', '[LOCALITY_DESCRIPTION]'],
  ['4', 'Commencement Year of construction', '[CONSTRUCTION_YEAR]'],
  ['5', 'Number of Floor', '[NO_OF_FLOORS]'],
  ['6', 'Type Of Structure', '[STRUCTURE_TYPE]'],
  ['7', 'Number of Dwelling units in the building', '[DWELLING_UNITS]'],
];

drawTable(apt_building, colWidths, { rowHeight: 16, fontSize: 8 });

y += 5;

// Facilities
const facilities = [
  ['8', 'Quality of Construction', '[CONSTRUCTION_QUALITY]'],
  ['9', 'Apperance of the building', '[BUILDING_APPEARANCE]'],
  ['10', 'Maintenance of building', '[BUILDING_MAINTENANCE]'],
  ['11', 'Facilities Available', ''],
  ['', 'Lift', '[LIFT_YES_NO]'],
  ['', 'Protected Water Supply', '[WATER_SUPPLY_YES_NO]'],
  ['', 'Under ground sewerage', '[SEWERAGE_YES_NO]'],
  ['', 'car parking-Open/Covered', '[PARKING_YES_NO]'],
  ['', 'is compound wall Existing?', '[COMPOUND_WALL_YES_NO]'],
  ['', 'Is pavement laid around the building?', '[PAVEMENT_YES_NO]'],
];

drawTable(facilities, colWidths, { rowHeight: 16, fontSize: 8 });

y += 5;

// Check if we need a new page
if (y > PAGE_HEIGHT - 300) {
  newPage();
}

// III. Flat
addSectionTitle('III. Flat');

const flat_section = [
  ['1', 'The floor on which the Flat is situated', '[FLOOR_NUMBER]'],
  ['2', 'Door No. Of the Flat', '[FLAT_DOOR_NUMBER]'],
  ['3', 'Specification of the Flat', '[FLAT_SPECIFICATION]'],
  ['', 'Roof', '[ROOF_MATERIAL]'],
  ['', 'Flooring', '[FLOORING_MATERIAL]'],
  ['', 'Doors', '[DOORS_TYPE]'],
  ['', 'Windows', '[WINDOWS_TYPE]'],
  ['', 'Fittings', '[FITTINGS]'],
  ['', 'Finishing', '[FINISHING]'],
  ['4', 'House Tax', '[HOUSE_TAX]'],
  ['', 'Assessment no', '[ASSESSMENT_NO]'],
  ['', 'Tax paid in the name of', '[TAX_NAME]'],
  ['', 'Tax amount', '[TAX_AMOUNT]'],
  ['5', 'Electricity service connection no.', '[ELECTRICITY_CONNECTION]'],
  ['', 'Meter card is in name of', '[METER_CARD_NAME]'],
  ['6', 'How is the maintenance of the Flat?', '[FLAT_MAINTENANCE]'],
  ['7', 'Sale Deed in the name of', '[SALE_DEED_NAME]'],
  ['8', 'What is the undivided area of land as per sale deed? (sq.mt.)', '[UNDIVIDED_LAND_AREA]'],
  ['9', 'What is the plinth area of the Flat ?', '[PLINTH_AREA]'],
  ['10', 'What is the FSI?', '[FSI_VALUE]'],
  ['11', 'What is the Carpet Area of the Flat consider for valuation?', '[CARPET_AREA_FLAT]'],
  ['12', 'Is it posh/ I class/Medium / Ordinary', '[FLAT_CLASS]'],
  ['13', 'IS It being used for residential or comercial purpose?', '[FLAT_PURPOSE]'],
  ['14', 'is it is owner occupied or Rent out?', '[OCCUPANCY_RENTED]'],
  ['15', 'If rented ,what is the monthly rent?', '[MONTHLY_RENT]'],
];

drawTable(flat_section, colWidths, { rowHeight: 16, fontSize: 8 });

y += 5;

// ============ PAGE 3 ============

newPage();

// IV MARKETIBILITY
addSectionTitle('IV MARKETIBILITY');

const marketibility = [
  ['1', 'How is marketability?', '[MARKETABILITY]'],
  ['2', 'What are the factors favouring for an extra potential value?', '[POSITIVE_FACTORS]'],
  ['3', 'Any negative factors are observed which affect the market value in general?', '[NEGATIVE_FACTORS]'],
];

drawTable(marketibility, colWidths, { rowHeight: 16, fontSize: 8 });

y += 8;

// V RATE
addSectionTitle('V RATE');

const rate_section = [
  ['1', 'After analysing the comparable sale instances, what is the composite rate for a similar flat with same specifications in the adjoining locality?', '[COMPARABLE_RATE_ANALYSIS]'],
  ['2', 'Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison', '[ADOPTED_COMPOSITE_RATE_METHOD]'],
  ['3', 'Break up for the rate', ''],
  ['', '(i) Building + Services', '[BUILDING_SERVICES_RATE]'],
  ['', '(ii) Land+Others', '[LAND_OTHERS_RATE]'],
  ['4', 'Guideline rate obtained from the Registrar\'s office', '[GUIDELINE_RATE_INFO]'],
  ['', 'Per Sq. Mt.', '[CARPET_AREA_SQ_MT] | [GUIDELINE_RATE_VALUE]'],
  ['', 'Total Jantri Value', '[TOTAL_JANTRI_VALUE]'],
];

drawTable(rate_section, colWidths, { rowHeight: 18, fontSize: 8 });

y += 8;

// VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION
addSectionTitle('VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION');

const composite_rate = [
  ['a', 'Depreciated building rate', '[DEPRECIATED_BUILDING_RATE]'],
  ['', 'Replacement cost of Flat with services', '[REPLACEMENT_COST]'],
  ['', 'Age of the building', '[BUILDING_AGE]'],
  ['', 'Life of the building estimated', '[BUILDING_LIFE]'],
  ['', 'Depreciation % assuming the salvage value as 10%', '[DEPRECIATION_PERCENTAGE]'],
  ['', 'Depreciated ratio of the building', '[DEPRECIATED_RATIO]'],
  ['b', 'Total Composite rate arrived for valuation', '[TOTAL_COMPOSITE_RATE] | Per Sq.mt. Carpet Area'],
  ['', 'Depreciated building rate VI (a)', '[DEPRECIATED_RATE_VI_A]'],
  ['', 'Rate of land & Other VI (3) ii', '[RATE_LAND_OTHER]'],
  ['', 'Total Composite rate', '[FINAL_COMPOSITE_RATE] | Per Sq.mt. Carpet Area'],
];

drawTable(composite_rate, colWidths, { rowHeight: 16, fontSize: 8 });

y += 8;

// DETAILS OF VALUATION
addSectionTitle('DETAILS OF VALUATION');

const details_cols = [40, 280, 130, 115];
const details_valuation = [
  ['No.', 'DESCRIPTION', 'Area in Sq. mt.', 'RATE'],
  ['1', 'Present value of the Flat - Carpet Area', '[CARPET_AREA_VALUE]', '[RATE_PER_SQMT]'],
  ['', 'Value Of The Flat', '', '[FLAT_VALUE]'],
  ['2', 'Fixed Furniture & Fixtures', '', '[FURNITURE_FIXTURES_VALUE]'],
  ['', 'Total Value Of The Flat', '', '[TOTAL_FLAT_VALUE]'],
  ['', 'In Words [TOTAL_VALUE_IN_WORDS]', '', ''],
];

drawTable(details_valuation, details_cols, { rowHeight: 16, fontSize: 8 });

y += 12;

// As a result of my appraisal and analysis
doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
doc.text('As a result of my appraisal and analysis,', MARGIN, y);
y += 14;

const results = [
  ['Fair Market Market Value', '[FAIR_MARKET_VALUE]'],
  ['Realizeable Value 95% of M.V', '[REALIZABLE_VALUE]'],
  ['Distress value 80% of M.V', '[DISTRESS_VALUE]'],
  ['Sale Deed Value', '[SALE_DEED_VALUE]'],
  ['Jantri Value', '[JANTRI_VALUE]'],
  ['Insurable Value', '[INSURABLE_VALUE]'],
  ['Remarks: Rate is given on Carpet Area.', ''],
  ['Copy Of Document Shown To Us', '[DOCUMENTS_SHOWN]'],
];

const result_cols = [320, 225];
drawTable(results, result_cols, { rowHeight: 16, fontSize: 8 });

// ============ PAGE 4 ============

newPage();

// STATEMENT OF LIMITING CONDITIONS
doc.font('Helvetica-Bold').fontSize(10).fillColor('#0000FF');
doc.text('STATEMENT OF LIMITING CONDITIONS', MARGIN, y);
y += 14;

doc.font('Helvetica').fontSize(8).fillColor('#000000');

const conditions = [
  'If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.',
  'No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.',
  'Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.',
  'Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.',
  'Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.',
  'If found any typo error in this report is not counted for any legal action and obligation.'
];

conditions.forEach(cond => {
  addBulletPoint(cond);
});

y += 8;

// VIII DECLARATION
doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
doc.text('VIII DECLARATION', MARGIN, y);
y += 14;

const declaration = [
  ['', 'I hereby declare that-'],
  ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
  ['b', 'I further declare that I have personally inspected the site and building on [INSPECTION_DATE_FULL].'],
  ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
  ['d', 'Future life of property is based on proper maintenance of the property'],
];

const decl_cols = [30, 535];
drawTable(declaration, decl_cols, { rowHeight: 18, fontSize: 8 });

y += 18;

// Signature section
doc.font('Helvetica').fontSize(9).fillColor('#000000');
doc.text('Place: [PLACE]', MARGIN, y);
y += 12;
doc.text('Date: [SIGNATURE_DATE]', MARGIN, y);

const sigY = y;
doc.font('Helvetica-Bold').fontSize(9);
doc.text('SIGNATURE OF THE VALUER', MARGIN + 320, sigY, { width: 200, align: 'center' });
doc.text('[VALUER_ORGANIZATION]', MARGIN + 320, sigY + 14, { width: 200, align: 'center' });

y += 35;

// Enclosure
doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
doc.text('Enclsd: 1. Declaration from the valuer', MARGIN, y);
y += 14;

doc.font('Helvetica').fontSize(8);
const enclText = 'The undersigned has inspected the property detailed in the Valuation report dated-[REPORT_DATE]. We are satisfied that the fair and reasonable market value of the property is [FINAL_VALUE_TEXT].';
const enclH = doc.heightOfString(enclText, { width: CONTENT_WIDTH });
doc.text(enclText, MARGIN, y, { width: CONTENT_WIDTH });
y += enclH + 18;

doc.font('Helvetica-Bold').fontSize(9);
doc.text('SIGNATURE', MARGIN + 320, y, { width: 200, align: 'center' });
y += 12;
doc.text('NAME OF BRANCH OFFICIAL WITH SEAL', MARGIN + 320, y, { width: 200, align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF template generated successfully!');
  console.log('✓ File: Valuation_Report_Final.pdf');
  console.log('✓ All content uses placeholders for values');
});

stream.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
