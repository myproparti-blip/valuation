const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({
  size: 'A4',
  margin: 36,
  bufferPages: true
});

const stream = fs.createWriteStream('Valuation_Report.pdf');
doc.pipe(stream);

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN);

let y = MARGIN;

// Helper functions
function getY() {
  return y;
}

function setY(newY) {
  y = newY;
}

function addY(height) {
  y += height;
}

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
    lineGap: 2
  });

  return cellY + height;
}

function drawTable(rows, colWidths, options = {}) {
  const {
    headerBg = '#E8E8E8',
    headerTextColor = '#000000',
    rowHeight = 18,
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
        cell,
        {
          fontSize: fontSize,
          bold: isHeader,
          bgColor: isHeader ? headerBg : null,
          textColor: isHeader ? headerTextColor : '#000000',
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
  y += 18;
}

function newPage() {
  doc.addPage();
  y = MARGIN;
}

// PAGE 1: HEADER AND GENERAL SECTION

// Header
doc.font('Helvetica').fontSize(9).fillColor('#000000');
doc.text('To;', MARGIN, y);
y += 10;
doc.text('Gujarat Gramin Bank , Vadodara', MARGIN, y);
y += 10;
doc.text('Manjalpur Branch', MARGIN, y);

// Right align
doc.fontSize(9);
const headerY = y - 20;
doc.text('File No: 06GGB1025 10', MARGIN, headerY, { width: CONTENT_WIDTH, align: 'right' });
doc.text('Date: 31-Oct-2025', MARGIN, headerY + 10, { width: CONTENT_WIDTH, align: 'right' });

y += 10;
y += 30;

// Title
doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
doc.text('VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)', MARGIN, y, { 
  width: CONTENT_WIDTH, 
  align: 'center' 
});
y += 20;

// GENERAL Section
addSectionTitle('GENERAL');

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

const colWidths = [40, 280, 245];
drawTable(generalRows, colWidths, { rowHeight: 18, fontSize: 8 });

y += 10;

// PAGE 2
newPage();

// Rows 9-16
const rows916 = [
  ['9', 'Classification Of The Area', ''],
  ['', '(a) High/Middle/Poor', 'Middle Class Area'],
  ['', '(b) Urban/Semi Urban/Rural', 'Urban'],
  ['10', 'Coming under Corporation limits/Village Panchayat/Municipality', 'Vadodara Municipal Corporation'],
  ['11', 'Weather convered under any State/Central Govt.enactments(e.g. Urban land celling actior notified under agenc area/scheduled area/cantonment area', 'As Per General Development Control Regulation.'],
  ['12', 'Boundaries of the property', ''],
  ['', 'East', 'Tower B'],
  ['', 'West', 'Staircase, Passage'],
  ['', 'North', '36 Mt. Wide Road'],
  ['', 'South', 'Flat No. 501, Tower B'],
  ['13', 'Extent of the Site', ''],
  ['', 'Built Up Area (Sq.mt.):', 'NA'],
  ['', 'Carpet Area (Sq.mt.):', '68.93'],
  ['', 'UDSL (Sq.Mt.):', '20.49'],
  ['14', 'Latitude,Longitude & Co ordinates of flat', '22°16\'13.5"N 73°11\'41.8"E'],
  ['15', 'Extent of the Site Considered for valuation', ''],
  ['', 'Carpet Area (Sq.mt.):', '68.93'],
  ['16', 'Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month', 'Vacant'],
];

drawTable(rows916, colWidths, { rowHeight: 18, fontSize: 8 });

y += 10;

// II. APARTMENT BUILDING
addSectionTitle('II.APARTMENT BUILDING');

const apt_building = [
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
];

drawTable(apt_building, colWidths, { rowHeight: 18, fontSize: 8 });

y += 10;

// Facilities section continued
const facilities = [
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

drawTable(facilities, colWidths, { rowHeight: 18, fontSize: 8 });

y += 10;

// III. FLAT
addSectionTitle('III. Flat');

const flat_section = [
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

drawTable(flat_section, colWidths, { rowHeight: 18, fontSize: 8 });

// PAGE 3
newPage();

// IV MARKETIBILITY
addSectionTitle('IV MARKETIBILITY');

const marketibility = [
  ['1', 'How is marketability?', 'Good'],
  ['2', 'What are the factors favouring for an extra potential value?', 'Prposed Fully Developed Scheme'],
  ['3', 'Any negative factors are observed which affect the market value in general?', 'The Unforeseen Events'],
];

drawTable(marketibility, colWidths, { rowHeight: 18, fontSize: 8 });

y += 8;

// V RATE
addSectionTitle('V RATE');

const rate_section = [
  ['', '', 'The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Also necessary information has been collected from nearby occupant. Our market inquiry among nearby occupant has revealed that similar sized property in the vicinity of the subject property is available in a range from Rs. 60000-65000 per sq. Mt. based on Carpet area.'],
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

drawTable(rate_section, colWidths, { rowHeight: 20, fontSize: 8 });

y += 8;

// VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION
addSectionTitle('VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION');

const composite_rate = [
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

drawTable(composite_rate, colWidths, { rowHeight: 18, fontSize: 8 });

y += 8;

// DETAILS OF VALUATION
addSectionTitle('DETAILS OF VALUATION');

const details_cols = [40, 280, 130, 115];
const details_valuation = [
  ['No.', 'DESCRIPTION', 'Area in Sq. mt.', 'RATE'],
  ['1', 'Present value of the Flat - Carpet Area', '68.93', '₹ 64,580.00'],
  ['', 'Value Of The Flat', '', '₹ 44,51,499.40'],
  ['2', 'Fixed Furniture & Fixtures', '', '₹ 15,00,000.00'],
  ['', 'Total Value Of The Flat', '', '₹ 59,51,499.40'],
  ['', 'In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.', '', ''],
];

drawTable(details_valuation, details_cols, { rowHeight: 18, fontSize: 8 });

y += 15;

// As a result
doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
doc.text('As a result of my appraisal and analysis,', MARGIN, y);
y += 18;

const results = [
  ['Fair Market Market Value', '₹ 59,51,499.40'],
  ['Realizeable Value 95% of M.V', '₹ 56,63,924.43'],
  ['Distress value 80% of M.V', '₹ 47,61,199.52'],
  ['Sale Deed Value', 'NA'],
  ['Jantri Value', '₹ 16,12,962.00'],
  ['Insurable Value', '₹ 20,83,024.79'],
  ['Remarks: Rate is given on Carpet Area.', ''],
  ['Copy Of Document Shown To Us', 'Mortgage Deed, Approved Plan, Previous Valuation Report'],
];

const result_cols = [320, 225];
drawTable(results, result_cols, { rowHeight: 18, fontSize: 8 });

// PAGE 4
newPage();

// STATEMENT OF LIMITING CONDITIONS
doc.font('Helvetica-Bold').fontSize(10).fillColor('#0000FF');
doc.text('STATEMENT OF LIMITING CONDITIONS', MARGIN, y);
y += 18;

doc.font('Helvetica').fontSize(8).fillColor('#000000');

const conditions = [
  '• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.',
  '• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.',
  '• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.',
  '• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.',
  '• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.',
  '• If found any typo error in this report is not counted for any legal action and obligation.'
];

conditions.forEach(cond => {
  const h = doc.heightOfString(cond, { width: CONTENT_WIDTH });
  doc.text(cond, MARGIN, y, { width: CONTENT_WIDTH });
  y += h + 3;
});

y += 12;

// VIII DECLARATION
doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000');
doc.text('VIII DECLARATION', MARGIN, y);
y += 18;

const declaration = [
  ['', 'I hereby declare that-'],
  ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
  ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
  ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
  ['d', 'Future life of property is based on proper maintenance of the property'],
];

const decl_cols = [30, 535];
drawTable(declaration, decl_cols, { rowHeight: 20, fontSize: 8 });

y += 20;

// Signature section
doc.font('Helvetica').fontSize(9).fillColor('#000000');
doc.text('Place: Vadodara', MARGIN, y);
y += 15;
doc.text('Date: 31/10/2025', MARGIN, y);

const sigY = y - 15;
doc.font('Helvetica-Bold').fontSize(9);
doc.text('SIGNATURE OF THE VALUER', MARGIN + 320, sigY, { width: 200, align: 'center' });
doc.text('MAHIM ARCHITECTS', MARGIN + 320, sigY + 15, { width: 200, align: 'center' });

y += 40;

// Enclosure
doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000');
doc.text('Enclsd: 1. Declaration from the valuer', MARGIN, y);
y += 18;

doc.font('Helvetica').fontSize(8);
const enclText = 'The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only).';
const enclH = doc.heightOfString(enclText, { width: CONTENT_WIDTH });
doc.text(enclText, MARGIN, y, { width: CONTENT_WIDTH });
y += enclH + 20;

doc.font('Helvetica-Bold').fontSize(9);
doc.text('SIGNATURE', MARGIN + 320, y, { width: 200, align: 'center' });
y += 15;
doc.text('NAME OF BRANCH OFFICIAL WITH SEAL', MARGIN + 320, y, { width: 200, align: 'center' });

// Finalize
doc.end();

stream.on('finish', () => {
  console.log('✓ PDF generated successfully!');
  console.log('✓ File: Valuation_Report.pdf');
});

stream.on('error', (err) => {
  console.error('Error:', err);
  process.exit(1);
});
