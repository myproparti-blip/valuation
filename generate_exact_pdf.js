const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create PDF document
const pdfPath = path.join(__dirname, 'Valuation_Report.pdf');
const doc = new PDFDocument({
  size: 'A4',
  margin: 36, // 0.5 inch
  bufferPages: true
});

// Pipe to file
const stream = fs.createWriteStream(pdfPath);
doc.pipe(stream);

// Constants
const PAGE_WIDTH = 595; // A4 width in points
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

// Helper: Add a cell with border
function addCell(x, y, width, height, text, options = {}) {
  const {
    fontSize = 8,
    bold = false,
    align = 'left',
    bgColor = null,
    borderColor = '#000000',
    borderWidth = 0.5,
    fontName = bold ? 'Helvetica-Bold' : 'Helvetica'
  } = options;

  // Draw border
  if (borderColor) {
    doc.strokeColor(borderColor).lineWidth(borderWidth);
    doc.rect(x, y, width, height).stroke();
  }

  // Fill background if specified
  if (bgColor) {
    doc.fillColor(bgColor).rect(x, y, width, height).fill();
  }

  // Draw text
  doc.fillColor('#000000').font(fontName).fontSize(fontSize);
  const textOptions = {
    width: width - 8,
    height: height - 6,
    align: align,
    ellipsis: false,
    lineGap: 2
  };

  const textHeight = doc.heightOfString(text, textOptions);
  const verticalOffset = (height - textHeight) / 2;

  doc.text(text, x + 4, y + Math.max(3, verticalOffset), textOptions);
}

// Helper: Add table row
function addTableRow(y, colWidths, data, options = {}) {
  const { borderColor = '#000000', fontSize = 8, bgColor = null } = options;
  let x = MARGIN;
  let rowHeight = 20;

  // Calculate actual row height needed for text
  doc.fontSize(fontSize);
  let maxHeight = rowHeight;
  data.forEach((cell, i) => {
    const textHeight = doc.heightOfString(cell, { width: colWidths[i] - 8 });
    maxHeight = Math.max(maxHeight, textHeight + 10);
  });

  // Draw cells
  data.forEach((cell, i) => {
    addCell(x, y, colWidths[i], maxHeight, cell, {
      fontSize: fontSize,
      bgColor: bgColor,
      borderColor: borderColor,
      align: 'left'
    });
    x += colWidths[i];
  });

  return maxHeight;
}

// PAGE 1 SETUP
let yPosition = 72;

// Header
doc.font('Helvetica', 9).fillColor('#000000');
doc.text('To;', MARGIN, yPosition);
doc.text('Gujarat Gramin Bank , Vadodara', MARGIN, yPosition + 12);
doc.text('Manjalpur Branch', MARGIN, yPosition + 24);

doc.text('File No: 06GGB1025 10', PAGE_WIDTH - 200, yPosition, { align: 'right', width: 150 });
doc.text('Date: 31-Oct-2025', PAGE_WIDTH - 200, yPosition + 12, { align: 'right', width: 150 });

yPosition += 60;

// Title
doc.font('Helvetica-Bold', 10).text('VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)', {
  align: 'center',
  width: CONTENT_WIDTH
});

yPosition += 30;

// GENERAL SECTION TABLE
const colWidths = [40, 260, 259];

// Table header
addCell(MARGIN, yPosition, 40, 20, 'GENERAL', { 
  fontSize: 10, 
  bold: true, 
  bgColor: '#003366',
  fontName: 'Helvetica-Bold'
});
addCell(MARGIN + 40, yPosition, 260, 20, '', { bgColor: '#003366' });
addCell(MARGIN + 300, yPosition, 259, 20, '', { bgColor: '#003366' });

yPosition += 20;

// General data rows
const generalRows = [
  ['1', 'purpose for which valuation is made', 'Financial Assistance for loan from GGB Bank'],
  ['2', '(a) Date of inspection', '30-Oct-2025'],
  ['', '(b) Date on which valuation is made', '31-Oct-2025'],
  ['', 'List of documents produced for pursual', ''],
  ['', '(1) Mortgage Deed :', 'Reg. No. 7204, Dated: 28/05/2025'],
  ['', '(2) Mortgage Deed Between :', 'Hemanshu Haribhai Patel & GGB Manjalpur Branch - Mr. Sanjaykumar'],
  ['3', '(3) Previous Valuation Report:', 'Issued By I S Associates Pvt. Ltd. On Dated: 20/03/2025'],
  ['', '(4) Previous Valuation Report In Favor of:', 'Mr. Hemanshu Haribhai Patel'],
  ['', '(5) Approved Plan No:', 'Approved by Vadodara Municpal Corporation, Ward No. 4, Order No.: RAH-SHB/19/20-21, Date: 26/11/2020'],
  ['4', 'Name of the Owner/Applicant:', 'Hemanshu Haribhai Patel'],
  ['5', 'Brief description of Property', 'It is a 3bhk Residential Flat at 5th Floor of Tower A of Brookfieldz Devbhumi Residency, Flat No. A/503.'],
  ['', 'Location of the property', ''],
  ['', '(a) Plot No/Survey No/Block No', 'R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.'],
  ['', '(b) Door/Shop No', 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.'],
  ['6', '(c) TP Np/Village', 'Manjalpur'],
  ['', '(d) Ward/Taluka', 'Vadodara'],
  ['', '(e) Mandal/District', 'Vadodara'],
  ['', '(f) Date of issue & Validity of layout plan', '26-Nov-2020'],
  ['', '(g) Approved map/plan issuing authority', 'Vadodara Municipal Corporation'],
  ['', '(h) weather genuineness or authenticity of approved map/plan verified', 'Original Documents Not Produced To the Valuer For Scrutinity. We have verified scan copy of original.'],
  ['', '(i) Any other comments by valuer on authentic of approved plan', 'Property is constructed as per approved plan'],
  ['7', 'Postal address of the property', 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.'],
  ['8', 'City/Town', 'Vadodara'],
  ['', 'Residential Area', 'Yes'],
  ['', 'Commercial Area', 'No'],
  ['', 'Industrial Area', 'No'],
];

// Draw general rows
generalRows.forEach(row => {
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

yPosition += 20;

// PAGE 2 - II. APARTMENT BUILDING
if (yPosition > 700) {
  doc.addPage();
  yPosition = MARGIN;
}

doc.font('Helvetica-Bold', 10).text('II. APARTMENT BUILDING', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const apartmentRows = [
  ['1', 'Nature of Apartment', 'Residential Flat'],
  ['2', 'Location', 'Vadodara'],
  ['', 'Survey/Block No.', 'R.S. No. 101, 102/2, 106/2 Paiki 2'],
  ['', 'TP, FP No.', 'T.P.S. No. 29, F.P. No. 3+24'],
  ['', 'Village/Municipality/Corporation', 'Vadodara Municipal Corporation'],
  ['', 'Door No,Street or Road (Pin Code)', '390011'],
  ['3', 'Description of the locality\nResidential/Commercial/Mixed', 'Residential Flat in Developed Area.'],
  ['4', 'Commencement Year of construction', '2025'],
  ['5', 'Number of Floor', 'Basement + Ground Floor + 7 Upper Floors'],
  ['6', 'Type Of Structure', 'RCC Structure'],
  ['7', 'Number of Dwelling units in the building', 'As Per Plan'],
  ['8', 'Quality of Construction', 'Standard'],
  ['9', 'Apperance of the building', 'Good'],
  ['10', 'Maintenance of building', 'Good'],
  ['11', 'Facilities Available', ''],
  ['', 'Lift', 'Yes'],
  ['', 'Protected Water Supply', 'Yes'],
  ['', 'Under ground sewerage', 'Yes'],
  ['', 'car parking-Open/Covered', 'Yes'],
  ['', 'is compound wall Existing?', 'Yes'],
  ['', 'Is pavement laid around the building?', 'Yes'],
];

apartmentRows.forEach(row => {
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

yPosition += 20;

// III. FLAT
doc.font('Helvetica-Bold', 10).text('III. FLAT', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const flatRows = [
  ['1', 'The floor on which the Flat is situated', '5th Floor'],
  ['2', 'Door No, Of the Flat', 'Flat No. A-503'],
  ['3', 'Specification of the Flat', '3BHK Residential Flat'],
  ['', 'Roof', 'RCC Slab'],
  ['', 'Flooring', 'Vitrified Tiles'],
  ['', 'Doors', 'Wooden Framed Flush Door'],
  ['', 'Windows', 'Section Windows'],
  ['', 'Fittings', 'Good'],
  ['', 'Finishing', 'Interior Finishing'],
  ['4', 'House Tax', 'NA'],
  ['', 'Assessment no', 'NA'],
  ['', 'Tax paid in the name of', 'NA'],
  ['', 'Tax amount', 'NA'],
  ['5', 'Electricity service connection no.', 'NA'],
  ['', 'Meter card is in name of', 'NA'],
  ['6', 'How is the maintenance of the Flat?', 'Well Maintained'],
  ['7', 'Sale Deed in the name of', 'Hemanshu Haribhai Patel'],
  ['8', 'What is the undivided area of land as per sale deed? (sq.mt.)', '20.49'],
  ['9', 'What is the plinth area of the Flat ?', 'Built Up Area (Sq.mt.): NA\nCarpet Area (Sq.mt.): 68.93'],
  ['10', 'What is the FSI?', '2.7'],
  ['11', 'What is the Carpet Area of the Flat consider for valuation?', '68.93'],
  ['12', 'Is it posh/ I class/Medium / Ordinary', 'Medium'],
  ['13', 'IS It being used for residential or comercial purpose?', 'Used As Residential Flat'],
  ['14', 'is it is owner occupied or Rent out?', 'Vacant'],
  ['15', 'If rented ,what is the monthly rent?', 'Not Applicable'],
];

flatRows.forEach(row => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

// New page for remaining sections
doc.addPage();
yPosition = MARGIN;

// IV MARKETIBILITY & V RATE
doc.font('Helvetica-Bold', 10).text('IV MARKETIBILITY', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const marketRows = [
  ['1', 'How is marketability?', 'Good'],
  ['2', 'What are the factors favouring for an extra potential value?', 'Prposed Fully Developed Scheme'],
  ['3', 'Any negative factors are observed which affect the market value in general?', 'The Unforeseen Events'],
];

marketRows.forEach(row => {
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

yPosition += 10;

doc.font('Helvetica-Bold', 10).text('V RATE', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const rateRows = [
  ['1', 'After analysing the comparable sale instances, what is the composite rate for a similar flat with same specifications in the adjoining locality?', 'The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Also necessary information has been collected from nearby occupant. Our market inquiry among nearby occupant has revealed that similar sized property in the vicinity of the subject property is available in a range from Rs. 60000-65000 per sq. Mt. based on Carpet area.'],
  ['2', 'Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison', 'I have adopted market approach method for valuation of the property. Local Inquiry as well as market Survey'],
  ['3', 'Break up for the rate', ''],
  ['', '(i) Building + Services', '24 x 7 Water Supply & Security'],
  ['', '(ii) Land+Others', 'Fully Developed Scheme & Interior'],
  ['4', 'Guideline rate obtained from the Registrar\'s office', 'Jantri rate: Rs. 23400/- per sq. mt. for composite rate for the year 2023.'],
  ['', 'Per Sq. Mt.', '68.93'],
  ['', '', '₹ 23,400.00'],
  ['', 'Total Jantri Value', '₹ 16,12,962.00'],
];

rateRows.forEach(row => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

yPosition += 10;

// VI COMPOSITE RATE & DETAILS
doc.font('Helvetica-Bold', 10).text('VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const compositeRows = [
  ['a', 'Depreciated building rate', 'Consider In Valuation'],
  ['', 'Replacement cost of Flat with services', 'Consider In Valuation'],
  ['', 'Age of the building', '0 Years'],
  ['', 'Life of the building estimated', '50 Years'],
  ['', 'Depreciation % assuming the salvage value as 10%', 'N.A.'],
  ['', 'Depreciated ratio of the building', 'N.A.'],
  ['b', 'Total Composite rate arrived for valuation', '₹ 64,580.00 | Per Sq.mt. Carpet Area'],
  ['', 'Depreciated building rate VI (a)', 'Consider In Valuation'],
  ['', 'Rate of land & Other VI (3) ii', 'Composite Rate Method Of Valuation'],
  ['', 'Total Composite rate', '₹ 64,580.00 | Per Sq.mt. Carpet Area'],
];

compositeRows.forEach(row => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += addTableRow(yPosition, colWidths, row, { fontSize: 8 });
});

yPosition += 10;

doc.font('Helvetica-Bold', 10).text('DETAILS OF VALUATION', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const detailsRows = [
  ['No.', 'DESCRIPTION', 'Area in Sq. mt. | RATE'],
  ['1', 'Present value of the Flat - Carpet Area', '68.93 | ₹ 64,580.00'],
  ['', 'Value Of The Flat', '₹ 44,51,499.40'],
  ['2', 'Fixed Furniture & Fixtures', '₹ 15,00,000.00'],
  ['', 'Total Value Of The Flat', '₹ 59,51,499.40'],
  ['', 'In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.', ''],
];

detailsRows.forEach((row, idx) => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  const options = (idx === 0) ? { bgColor: '#cccccc', fontSize: 9 } : { fontSize: 8 };
  yPosition += addTableRow(yPosition, colWidths, row, options);
});

yPosition += 20;

// Final appraisal
doc.font('Helvetica-Bold', 9).text('As a result of my appraisal and analysis,', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 15;

const finalRows = [
  ['Fair Market Market Value', '₹ 59,51,499.40'],
  ['Realizeable Value 95% of M.V', '₹ 56,63,924.43'],
  ['Distress value 80% of M.V', '₹ 47,61,199.52'],
  ['Sale Deed Value', 'NA'],
  ['Jantri Value', '₹ 16,12,962.00'],
  ['Insurable Value', '₹ 20,83,024.79'],
  ['Remarks: Rate is given on Carpet Area.', ''],
  ['Copy Of Document Shown To Us', 'Mortgage Deed, Approved Plan, Previous Valuation Report'],
];

const col2Widths = [300, 195];
finalRows.forEach(row => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += addTableRow(yPosition, col2Widths, row, { fontSize: 8 });
});

// New page for declarations
doc.addPage();
yPosition = MARGIN;

// Statement of Limiting Conditions
doc.font('Helvetica-Bold', 10).fillColor('#0000FF').text('STATEMENT OF LIMITING CONDITIONS', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

doc.font('Helvetica', 8).fillColor('#000000');
const conditions = [
  '• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.',
  '• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.',
  '• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.',
  '• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.',
  '• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.',
  '• If found any typo error in this report is not counted for any legal action and obligation.'
];

conditions.forEach(condition => {
  if (yPosition > 750) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += doc.text(condition, MARGIN, yPosition, { width: CONTENT_WIDTH }).height + 5;
});

yPosition += 15;

// Declaration
doc.font('Helvetica-Bold', 10).text('VIII DECLARATION', {
  align: 'left',
  width: CONTENT_WIDTH
});

yPosition += 20;

const declRows = [
  ['', 'I hereby declare that-'],
  ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
  ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
  ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
  ['d', 'Future life of property is based on proper maintenance of the property'],
];

const declColWidths = [30, 535];
declRows.forEach(row => {
  if (yPosition > 700) {
    doc.addPage();
    yPosition = MARGIN;
  }
  yPosition += addTableRow(yPosition, declColWidths, row, { fontSize: 8 });
});

yPosition += 20;

// Signature
doc.font('Helvetica', 9);
doc.text('Place: Vadodara', MARGIN, yPosition);
doc.text('Date: 31/10/2025', MARGIN, yPosition + 20);

doc.font('Helvetica-Bold', 9);
doc.text('SIGNATURE OF THE VALUER', PAGE_WIDTH - 250, yPosition, { width: 200, align: 'center' });
doc.text('MAHIM ARCHITECTS', PAGE_WIDTH - 250, yPosition + 20, { width: 200, align: 'center' });

yPosition += 50;

// Enclosure
doc.font('Helvetica-Bold', 9).text('Enclsd: 1. Declaration from the valuer', MARGIN, yPosition);

yPosition += 20;

doc.font('Helvetica', 8);
doc.text('The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only).', MARGIN, yPosition, { width: CONTENT_WIDTH });

yPosition += 60;

doc.font('Helvetica-Bold', 9);
doc.text('SIGNATURE', PAGE_WIDTH - 250, yPosition, { width: 200, align: 'center' });
doc.text('NAME OF BRANCH OFFICIAL WITH SEAL', PAGE_WIDTH - 250, yPosition + 20, { width: 200, align: 'center' });

// Finalize PDF
doc.end();

// Handle completion
stream.on('finish', () => {
  console.log('✓ PDF generated successfully!');
  console.log(`✓ File: ${pdfPath}`);
  console.log('✓ The PDF is an exact replica of the valuation report');
});

stream.on('error', (err) => {
  console.error('✗ Error generating PDF:', err);
  process.exit(1);
});
