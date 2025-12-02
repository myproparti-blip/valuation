const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
    size: 'A4',
    margin: 36 // 0.5 inch
});

const stream = fs.createWriteStream('Valuation_Report.pdf');
doc.pipe(stream);

// Set default font
doc.font('Helvetica');

// Header
doc.fontSize(9);
doc.text('To;', { width: 300, align: 'left' });
doc.text('Gujarat Gramin Bank , Vadodara', { width: 300, align: 'left' });
doc.text('Manjalpur Branch', { width: 300, align: 'left' });

// Align date on right - need to position differently
const pageWidth = doc.page.width;
doc.fontSize(9);
doc.text('File No: 06GGB1025 10', pageWidth - 200, doc.y - 27, { width: 150, align: 'right' });
doc.text('Date: 31-Oct-2025', pageWidth - 200, doc.y, { width: 150, align: 'right' });

doc.moveDown(0.5);

// Title
doc.fontSize(12).font('Helvetica-Bold');
doc.text('VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)', { align: 'center' });

doc.moveDown(0.3);
doc.fontSize(10).text('GENERAL', { underline: false });

doc.fontSize(9).font('Helvetica');

// Helper function to add a table
function addTable(startY, headers, rows, colWidths) {
    const tableStartY = doc.y;
    const rowHeight = 20;
    
    // Draw headers
    doc.font('Helvetica-Bold').fontSize(8);
    let x = doc.page.margins.left;
    headers.forEach((header, i) => {
        doc.rect(x, tableStartY, colWidths[i], rowHeight).fillAndStroke('#cccccc', '#000000');
        doc.text(header, x + 2, tableStartY + 2, { width: colWidths[i] - 4, height: rowHeight - 4, fontSize: 8 });
        x += colWidths[i];
    });
    
    doc.moveDown(1.5);
    
    // Draw rows
    doc.font('Helvetica').fontSize(7);
    rows.forEach(row => {
        let x = doc.page.margins.left;
        const currentY = doc.y;
        let maxHeight = rowHeight;
        
        row.forEach((cell, i) => {
            const cellHeight = rowHeight;
            doc.rect(x, currentY, colWidths[i], cellHeight).stroke('#000000');
            doc.text(String(cell || ''), x + 2, currentY + 2, { width: colWidths[i] - 4, height: cellHeight - 4, fontSize: 7 });
            x += colWidths[i];
        });
        
        doc.moveDown(1.3);
    });
}

// GENERAL Table Data
const generalHeaders = ['S.No', 'Description', 'Details'];
const generalRows = [
    ['1', 'Purpose for which valuation is made', 'Financial Assistance for loan from GGB Bank'],
    ['2', '(a) Date of inspection\n(b) Date on which valuation is made\nList of documents produced\n(1) Mortgage Deed:\n(2) Mortgage Deed Between:\n(3) Previous Valuation Report:\n(4) Previous Valuation Report In Favor of:\n(5) Approved Plan No:', '30-Oct-2025\n31-Oct-2025\n\nReg. No. 7204, Dated: 28/05/2025\nHemanshu Haribhai Patel & GGB Manjalpur Branch - Mr. Sanjaykumar\nIssued By I S Associates Pvt. Ltd. On Dated: 20/03/2025\nMr. Hemanshu Haribhai Patel\nApproved by Vadodara Municpal Corporation, Ward No. 4, Order No.: RAH-SHB/19/20-21, Date: 26/11/2020'],
    ['3', 'Name of the Owner/Applicant:', 'Hemanshu Haribhai Patel'],
    ['4', 'Brief description of Property', 'It is a 3bhk Residential Flat at 5th Floor of Tower A of Brookfieldz Devbhumi Residency, Flat No. A/503.'],
    ['5', 'Location of the property\n(a) Plot No/Survey No/Block No\n(b) Door/Shop No\n(c) TP Np/Village\n(d) Ward/Taluka\n(e) Mandal/District', 'R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.\nFlat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.\nManjalpur\nVadodara\nVadodara'],
    ['6', 'Postal address of the property', 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.'],
    ['7', 'City/Town\nResidential Area\nComercial Area\nIndustrial Area', 'Vadodara\nYes\nNo\nNo'],
];

const colWidths = [45, 200, 245];
addTable(doc.y, generalHeaders, generalRows, colWidths);

doc.moveDown(0.5);
doc.fontSize(10).font('Helvetica-Bold').text('II. APARTMENT BUILDING');
doc.moveDown(0.2);

// Apartment Building Table
const aptRows = [
    ['1', 'Nature of Apartment', 'Residential Flat'],
    ['2', 'Location\nSurvey/Block No.\nTP, FP No.\nVillage/Municipality/Corporation', 'Vadodara\nR.S. No. 101, 102/2, 106/2 Paiki 2\nT.P.S. No. 29, F.P. No. 3+24\nVadodara Municipal Corporation'],
    ['3', 'Description of the locality', 'Residential Flat in Developed Area.'],
    ['4', 'Commencement Year of construction', '2025'],
    ['5', 'Number of Floor', 'Basement + Ground Floor + 7 Upper Floors'],
    ['6', 'Type Of Structure', 'RCC Structure'],
    ['7', 'Number of Dwelling units in the building', 'As Per Plan'],
    ['8', 'Quality of Construction', 'Standard'],
    ['9', 'Appearance of the building', 'Good'],
    ['10', 'Maintenance of building', 'Good'],
    ['11', 'Facilities Available\nLift\nProtected Water Supply\nUnder ground sewerage\nCar parking\nCompound wall\nPavement around building', 'Yes\nYes\nYes\nYes\nYes\nYes'],
];

addTable(doc.y, generalHeaders, aptRows, colWidths);

doc.addPage();

doc.fontSize(10).font('Helvetica-Bold').text('III. FLAT');
doc.moveDown(0.2);

const flatRows = [
    ['1', 'The floor on which the Flat is situated', '5th Floor'],
    ['2', 'Door No, Of the Flat', 'Flat No. A-503'],
    ['3', 'Specification of the Flat\nRoof\nFlooring\nDoors\nWindows\nFittings\nFinishing', '3BHK Residential Flat\nRCC Slab\nVitrified Tiles\nWooden Framed Flush Door\nSection Windows\nGood\nInterior Finishing'],
    ['4', 'House Tax\nAssessment no\nTax paid in the name of\nTax amount', 'NA\nNA\nNA\nNA'],
    ['5', 'Electricity service\nMeter card', 'NA\nNA'],
    ['6', 'Maintenance of the Flat', 'Well Maintained'],
    ['7', 'Sale Deed in the name of', 'Hemanshu Haribhai Patel'],
    ['8', 'Undivided area of land (sq.mt.)', '20.49'],
    ['9', 'Plinth area of the Flat', 'Built Up Area: NA | Carpet Area: 68.93'],
    ['10', 'FSI', '2.7'],
    ['11', 'Carpet Area for valuation', '68.93'],
    ['12', 'Class', 'Medium'],
    ['13', 'Usage', 'Used As Residential Flat'],
    ['14', 'Owner occupied or Rent out', 'Vacant'],
    ['15', 'Monthly rent', 'Not Applicable'],
];

addTable(doc.y, generalHeaders, flatRows, colWidths);

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('IV MARKETIBILITY');
doc.moveDown(0.2);

const marketRows = [
    ['1', 'How is marketability?', 'Good'],
    ['2', 'Factors favouring extra potential value?', 'Proposed Fully Developed Scheme'],
    ['3', 'Any negative factors?', 'The Unforeseen Events'],
];

addTable(doc.y, generalHeaders, marketRows, colWidths);

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('V RATE');
doc.moveDown(0.2);

const rateText = 'The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Our market inquiry has revealed that similar sized property in the vicinity is available in a range from Rs. 60000-65000 per sq. Mt.';

doc.fontSize(8).font('Helvetica').text(rateText, { width: 490 });

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION');
doc.moveDown(0.2);

const deprRows = [
    ['', 'Depreciated building rate', 'Consider In Valuation'],
    ['', 'Replacement cost of Flat', 'Consider In Valuation'],
    ['', 'Age of the building', '0 Years'],
    ['', 'Life of the building estimated', '50 Years'],
    ['', 'Depreciation %', 'N.A.'],
    ['b', 'Total Composite rate arrived', '₹ 64,580.00 Per Sq.mt.'],
];

addTable(doc.y, generalHeaders, deprRows, colWidths);

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('DETAILS OF VALUATION');
doc.moveDown(0.2);

const detailsHeaders = ['No.', 'DESCRIPTION', 'Area (Sq.mt)', 'RATE'];
const detailsRows = [
    ['1', 'Present value of the Flat - Carpet Area', '68.93', '₹ 64,580.00'],
    ['', 'Value Of The Flat', '', '₹ 44,51,499.40'],
    ['2', 'Fixed Furniture & Fixtures', '', '₹ 15,00,000.00'],
    ['', 'Total Value Of The Flat', '', '₹ 59,51,499.40'],
    ['', 'In Words: Fifty Nine Lac Fifty One Thousand...', '', ''],
];

addTable(doc.y, detailsHeaders, detailsRows, [40, 200, 125, 125]);

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('As a result of my appraisal and analysis,');
doc.moveDown(0.2);

const resultRows = [
    ['Fair Market Market Value', '₹ 59,51,499.40'],
    ['Realizeable Value 95% of M.V', '₹ 56,63,924.43'],
    ['Distress value 80% of M.V', '₹ 47,61,199.52'],
    ['Sale Deed Value', 'NA'],
    ['Jantri Value', '₹ 16,12,962.00'],
    ['Insurable Value', '₹ 20,83,024.79'],
    ['Remarks', 'Rate is given on Carpet Area'],
];

addTable(doc.y, ['Description', 'Value'], resultRows, [300, 190]);

doc.addPage();

// STATEMENT OF LIMITING CONDITIONS
doc.fontSize(10).font('Helvetica-Bold').fillColor('#0000FF').text('STATEMENT OF LIMITING CONDITIONS');
doc.fillColor('#000000');
doc.fontSize(8).font('Helvetica');

const conditions = [
    '• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.',
    '• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.',
    '• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location.',
    '• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner.',
    '• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.',
    '• If found any typo error in this report is not counted for any legal action and obligation.'
];

conditions.forEach(condition => {
    doc.text(condition, { width: 490 });
    doc.moveDown(0.15);
});

doc.moveDown(0.3);
doc.fontSize(10).font('Helvetica-Bold').text('VIII DECLARATION');
doc.moveDown(0.2);

const declRows = [
    ['', 'I hereby declare that-'],
    ['a', 'I declare that I am not associated with the builder or with any of his associate companies and this report has been prepared by me with highest professional integrity.'],
    ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
    ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
    ['d', 'Future life of property is based on proper maintenance of the property'],
];

const declHeaders = ['', 'Declaration'];
addTable(doc.y, declHeaders, declRows, [30, 460]);

doc.moveDown(0.5);
doc.fontSize(9).font('Helvetica').text('Place: Vadodara', { align: 'left' });
doc.fontSize(9).font('Helvetica-Bold').text('SIGNATURE OF THE VALUER', { align: 'right' });
doc.fontSize(9).font('Helvetica').text('Date: 31/10/2025', { align: 'left' });
doc.fontSize(9).font('Helvetica-Bold').text('MAHIM ARCHITECTS', { align: 'right' });

doc.moveDown(0.5);
doc.fontSize(9).font('Helvetica-Bold').text('Enclsd: 1. Declaration from the valuer');
doc.fontSize(8).font('Helvetica').text('The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only).', { width: 490 });

doc.moveDown(0.5);
doc.fontSize(9).font('Helvetica-Bold').text('SIGNATURE', { align: 'right' });
doc.fontSize(9).font('Helvetica-Bold').text('NAME OF BRANCH OFFICIAL WITH SEAL', { align: 'right' });

// Finalize PDF
doc.end();

stream.on('finish', function() {
    console.log('PDF generated successfully: Valuation_Report.pdf');
});

stream.on('error', function(err) {
    console.error('Error generating PDF:', err);
});
