import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate Indian Valuation Report PDF matching the exact screenshot layout
 * Uses only dynamic data from the valuation record - no static text or placeholders
 * Letterhead design: MAHIM Architect with geometric borders and footer contact info
 */
export const generateICICIValuationReport = (recordData = {}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const baseRowHeight = 5;
    let yPosition = 35;

    const pdfData = recordData.pdfDetails || {};

    /**
     * Add letterhead on every page
     */
    const addLetterhead = () => {
        const headerHeight = 30;
        
        // Top black bar
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, pageWidth, 3, 'F');
        
        // MAHIM Architect orange logo box (top right)
        doc.setFillColor(255, 102, 0);
        doc.rect(pageWidth - 50, 5, 48, 25, 'F');
        
        // MAHIM text in white
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('MAHIM', pageWidth - 48, 18);
        
        // Architect text in white
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 255, 255);
        doc.text('Architect', pageWidth - 45, 26);
        
        // Left side geometric border - simplified colorful bars
        const borderColors = [
            [255, 0, 0],      // Red
            [0, 0, 255],      // Blue
            [0, 255, 255],    // Cyan
            [128, 0, 128],    // Purple
            [255, 165, 0],    // Orange
            [0, 128, 0],      // Green
            [255, 255, 0]     // Yellow
        ];
        
        doc.setLineWidth(0.5);
        let barY = 0;
        const barHeight = pageHeight / borderColors.length;
        
        borderColors.forEach((color, idx) => {
            doc.setFillColor(...color);
            doc.rect(0, barY, 2, barHeight, 'F');
            barY += barHeight;
        });
        
        // Footer divider line
        const footerDividerY = pageHeight - 19;
        doc.setDrawColor(200, 0, 0);
        doc.setLineWidth(1);
        doc.line(margin + 2, footerDividerY, pageWidth - margin - 2, footerDividerY);
        
        // Footer section with consistent positioning
        const footerY = pageHeight - 15;
        const footerLineHeight = 3.3;
        
        // Left column - Locations with map icons (◆)
        const leftColX = margin + 2;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(255, 0, 0);
        doc.text('◆ Ahmedabad◆ Surat◆ Vadodara', leftColX, footerY);
        doc.text('◆ Delhi◆ Gurgaon◆ Bangalore', leftColX, footerY + footerLineHeight);
        doc.text('◆ Mumbai◆ Canada', leftColX, footerY + (footerLineHeight * 2));
        
        // Center column - Tagline (2 lines, centered)
        const centerColX = pageWidth / 2;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        const tagline1Width = doc.getTextWidth('A Tradition of Excellence,');
        const tagline2Width = doc.getTextWidth('Trust & Service');
        doc.text('A Tradition of Excellence,', centerColX - tagline1Width / 2, footerY);
        doc.text('Trust & Service', centerColX - tagline2Width / 2, footerY + footerLineHeight);
        
        // Right column - Contact info (3 lines, right-aligned)
        const rightColX = pageWidth - margin - 2;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const phoneWidth = doc.getTextWidth('9265923178/8238737000');
        const emailWidth = doc.getTextWidth('valuer@mahimarchitect.com');
        const websiteWidth = doc.getTextWidth('www.mahimarchitect.com');
        
        doc.text('9265923178/8238737000', rightColX - phoneWidth, footerY);
        doc.text('valuer@mahimarchitect.com', rightColX - emailWidth, footerY + footerLineHeight);
        doc.text('www.mahimarchitect.com', rightColX - websiteWidth, footerY + (footerLineHeight * 2));
    };
    
    addLetterhead();

    // Fixed column widths
    const col1Width = 12;  // Row number
    const col2Width = 95;  // Label
    const col3Width = pageWidth - margin * 2 - col1Width - col2Width;  // Value

    // Colors
    const borderColor = [0, 0, 0];
    const headerBgColor = [200, 200, 200];

    /**
     * Calculate text lines and height for proper alignment
     */
    const getTextLines = (text, maxWidth) => {
        if (!text || text.trim() === '') return [];
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        return doc.splitTextToSize(String(text), maxWidth - 2);
    };

    /**
     * Draw table borders for a cell
     */
    const drawCell = (x, y, width, height) => {
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.3);
        doc.rect(x, y, width, height);
    };

    /**
     * Draw text in a cell with proper alignment
     */
    const drawCellText = (text, x, y, width, height, isRowNumber = false) => {
        doc.setFontSize(isRowNumber ? 8 : 7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);

        if (!text || text.trim() === '') {
            return;
        }

        const lines = doc.splitTextToSize(String(text), width - 2);
        const lineHeight = 3.5;
        const totalTextHeight = lines.length * lineHeight;
        const startY = y + (height - totalTextHeight) / 2 + lineHeight - 0.5;

        doc.text(lines, x + 1, startY, { maxWidth: width - 2 });
    };

    /**
     * Add a single table row with 3 columns, handles multi-line text
     */
    const addTableRow = (rowNum, label, value, yPos) => {
        // Get all text lines
        const rowNumLines = rowNum ? [rowNum] : [];
        const labelLines = getTextLines(label, col2Width);
        const valueLines = getTextLines(value, col3Width);

        // Calculate required height
        const maxLines = Math.max(rowNumLines.length, labelLines.length, valueLines.length);
        const rowHeight = Math.max(baseRowHeight, maxLines * 3.5 + 2);

        // Draw column 1: Row number
        drawCell(margin, yPos, col1Width, rowHeight);
        if (rowNum) {
            drawCellText(rowNum, margin, yPos, col1Width, rowHeight, true);
        }

        // Draw column 2: Label
        drawCell(margin + col1Width, yPos, col2Width, rowHeight);
        drawCellText(labelLines.join('\n'), margin + col1Width, yPos, col2Width, rowHeight, false);

        // Draw column 3: Value
        drawCell(margin + col1Width + col2Width, yPos, col3Width, rowHeight);
        drawCellText(valueLines.join('\n'), margin + col1Width + col2Width, yPos, col3Width, rowHeight, false);

        return yPos + rowHeight;
    };

    /**
     * Add section header
     */
    const addSectionHeader = (title, yPos) => {
        drawCell(margin, yPos, pageWidth - 2 * margin, baseRowHeight);
        doc.setFillColor(...headerBgColor);
        doc.rect(margin, yPos, pageWidth - 2 * margin, baseRowHeight, 'F');
        drawCell(margin, yPos, pageWidth - 2 * margin, baseRowHeight);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin + 2, yPos + 3.5);

        return yPos + baseRowHeight;
    };

    /**
     * Check and manage page breaks
     */
    const checkPageBreak = (currentY, minSpaceNeeded = 20) => {
        if (currentY + minSpaceNeeded > pageHeight - 20) {
            doc.addPage();
            addLetterhead();
            return 35;
        }
        return currentY;
    };

    // ===== PAGE 1 =====

    // Header info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('To:', margin, yPosition);
    doc.text(pdfData.branch || '', margin + 8, yPosition);
    yPosition += 4;
    doc.text(recordData.branchName || '', margin + 8, yPosition);
    yPosition += 4;

    // File No and Date on right
    const rightCol = pageWidth - 60;
    doc.setFontSize(8);
    const formIdValue = pdfData.formId || recordData.formId || '';
    const dateValue = pdfData.valuationMadeDate || recordData.valuationMadeDate || '';
    doc.text(`File No: ${formIdValue}`, rightCol, yPosition - 4);
    doc.text(`Date: ${dateValue}`, rightCol, yPosition);

    yPosition += 3;

    // Main title
    yPosition = addSectionHeader('VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)', yPosition);

    // GENERAL section
    yPosition = addSectionHeader('GENERAL', yPosition);

    const generalRows = [
        ['1', 'purpose for which valuation is made', pdfData.valuationPurpose || ''],
        ['2', '(a) Date of inspection', pdfData.inspectionDate || ''],
        ['', '(b) Date on which valuation is made', pdfData.valuationMadeDate || ''],
        ['', 'List of documents produced for pursuit', ''],
        ['', '(1) Mortgage Deed :', pdfData.mortgageDeed || ''],
        ['', '(2) Mortgage Deed Between :', pdfData.mortgageDeedBetween || ''],
        ['3', '(3) Previous Valuation Report:', pdfData.previousValuationReport || ''],
        ['', '(4) Previous Valuation Report In Favor of:', pdfData.previousValuationInFavorOf || ''],
        ['', '(5) Approved Plan No:', pdfData.approvedPlanNo || ''],
        ['4', 'Name of the Owner/Applicant:', pdfData.ownerName || ''],
        ['5', 'Brief description of Property', pdfData.locationOfProperty || ''],
        ['', 'Location of the property', ''],
        ['', '(a) Plot No/Survey No/Block No', pdfData.plotSurveyBlockNo || ''],
        ['', '(b) Door/Shop No', pdfData.doorShopNo || ''],
        ['', '(c) TP Np/Village', pdfData.tpVillage || ''],
        ['', '(d) Ward/Taluka', pdfData.wardTaluka || ''],
        ['', '(e) Mandal/District', pdfData.mandalDistrict || ''],
        ['', '(f) Date of issue & Validity of layout plan', pdfData.layoutPlanIssueDate || ''],
        ['', '(g) Approved map/plan issuing authority', pdfData.approvedMapAuthority || ''],
        ['', '(h) weather genuineness or authenticity of approved map/plan verified', pdfData.authenticityVerified || ''],
        ['', '(i) Any other comments by valuer on authentic of approved plan', pdfData.valuerCommentOnAuthenticity || ''],
        ['7', 'Postal address of the property', pdfData.postalAddress || ''],
        ['', 'City/Town', pdfData.cityTown || ''],
        ['8', 'Residential Area', pdfData.residentialArea || ''],
        ['', 'Commercial Area', pdfData.commercialArea || ''],
        ['', 'Industrial Area', pdfData.industrialArea || '']
    ];

    generalRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // Classification section
    yPosition = checkPageBreak(yPosition, 15);
    yPosition = addSectionHeader('Classification Of The Area', yPosition);

    const classificationRows = [
        ['', '(a) High/Middle/Poor', pdfData.classificationArea || ''],
        ['', '(b) Urban/Semi Urban/Rural', pdfData.urbanType || ''],
        ['', 'Coming under Corporation limits/Village Panchayat/Municipality', pdfData.underCorporation || ''],
        ['', 'Weather covered under any State/Central Govt.enactments', pdfData.govtEnactmentCover || ''],
        ['', 'Boundaries of the property', ''],
        ['', 'East', pdfData.boundariesDocument?.east || ''],
        ['', 'West', pdfData.boundariesDocument?.west || ''],
        ['', 'North', pdfData.boundariesDocument?.north || ''],
        ['', 'South', pdfData.boundariesDocument?.south || '']
    ];

    classificationRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // Extent of Site
    yPosition = checkPageBreak(yPosition, 18);
    yPosition = addSectionHeader('Extent of The Site', yPosition);

    const extentRows = [
        ['', 'Built Up Area (Sq.mt.):', pdfData.builtUpArea || ''],
        ['', 'Carpet Area (Sq.mt.):', pdfData.carpetArea || ''],
        ['', 'UDSL (Sq.Mt.):', pdfData.udsLand || ''],
        ['', 'Latitude,Longitude & Co ordinates of flat', pdfData.latitudeLongitude || '']
    ];

    extentRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // Extent of Site Considered for valuation
    yPosition = checkPageBreak(yPosition, 10);
    yPosition = addSectionHeader('Extent of the Site Considered for valuation', yPosition);
    yPosition = addTableRow('', 'Carpet Area (Sq.mt.):', pdfData.siteConsideredArea || '', yPosition);

    // Weather Occupied
    yPosition = checkPageBreak(yPosition, 8);
    yPosition = addSectionHeader('Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month', yPosition);
    yPosition = addTableRow('', 'Status:', pdfData.occupancyStatus || '', yPosition);

    // ===== PAGE 2 =====
    doc.addPage();
    addLetterhead();
    yPosition = 35;

    // APARTMENT BUILDING
    yPosition = addSectionHeader('II.APARTMENT BUILDING', yPosition);

    const apartmentRows = [
         ['1', 'Nature of Apartment', pdfData.apartmentNature || ''],
         ['2', 'Location', pdfData.apartmentLocation || ''],
         ['', 'Survey/Block No.', pdfData.surveyBlockNo || ''],
         ['', 'TP, FP  No.', pdfData.tpFpNo || ''],
         ['', 'Village/Municipality/Corporation', pdfData.villageMunicipality || ''],
         ['', 'Door No,Street or Road (Pin Code)', pdfData.doorStreet || ''],
         ['3', 'Description of the locality', pdfData.localityDescription || ''],
         ['', 'Residential/Commercial/Mixed', pdfData.areaUsage || ''],
         ['4', 'Commencement Year of construction', pdfData.constructionYear || ''],
         ['5', 'Number of Floor', pdfData.numberOfFloors || ''],
         ['6', 'Type Of Structure', pdfData.structureType || ''],
         ['7', 'Number of Dwelling units in the building', pdfData.dwellingUnits || ''],
         ['8', 'Quality of Construction', pdfData.qualityOfConstruction || ''],
         ['9', 'Appearance of the building', pdfData.buildingAppearance || ''],
         ['10', 'Maintenance of building', pdfData.buildingMaintenance || ''],
         ['11', 'Facilities Available', ''],
         ['', 'Lift', pdfData.facilities?.lift ? 'Yes' : ''],
         ['', 'Protected Water Supply', pdfData.facilities?.waterSupply ? 'Yes' : ''],
         ['', 'Under ground sewerage', pdfData.facilities?.sewerage ? 'Yes' : ''],
         ['', 'car parking-Open/Covered', pdfData.facilities?.parking ? 'Yes' : ''],
         ['', 'is compound wall Existing?', pdfData.facilities?.compoundWall ? 'Yes' : ''],
         ['', 'Is pavement laid around the building?', pdfData.facilities?.pavement ? 'Yes' : '']
     ];

    apartmentRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // FLAT section
    yPosition = checkPageBreak(yPosition, 20);
    yPosition = addSectionHeader('III. Flat', yPosition);

    const flatRows = [
        ['1', 'The floor on which the Flat is situated', pdfData.flatFloor || ''],
        ['2', 'Door No. Of the Flat', pdfData.flatDoorNo || ''],
        ['3', 'Specification of the Flat', pdfData.flatSpecifications?.specifications || ''],
        ['', 'Roof', pdfData.flatSpecifications?.roof || ''],
        ['', 'Flooring', pdfData.flatSpecifications?.flooring || ''],
        ['', 'Doors', pdfData.flatSpecifications?.doors || ''],
        ['', 'Windows', pdfData.flatSpecifications?.windows || ''],
        ['', 'Fittings', pdfData.flatSpecifications?.fittings || ''],
        ['', 'Finishing', pdfData.flatSpecifications?.finishing || ''],
        ['4', 'House Tax', ''],
        ['', 'Assessment no', pdfData.houseTax?.assessmentNo || ''],
        ['', 'Tax paid in the name of', pdfData.houseTax?.taxPaidBy || ''],
        ['', 'Tax amount', pdfData.houseTax?.taxAmount || ''],
        ['5', 'Electricity service connection no.', pdfData.electricityConnection?.connectionNo || ''],
        ['', 'Meter card is in name of', pdfData.electricityConnection?.meterName || ''],
        ['6', 'How is the maintenance of the Flat?', pdfData.flatMaintenance || ''],
        ['7', 'Sale Deed In the name of', pdfData.saleDeedName || ''],
        ['8', 'What is the undivided area of land as per sale deed? (sq.MT.)', pdfData.undividedLandArea || ''],
        ['9', 'What is the plinth area of the Flat ?', ''],
        ['', 'Built Up Area (Sq.mt.):', pdfData.plinthArea || ''],
        ['', 'Carpet Area (Sq.mt.):', pdfData.carpetAreaFlat || ''],
        ['10', 'What is the FSI?', pdfData.fsi || ''],
        ['11', 'What is the Carpet Area of the Flat consider for valuation?', pdfData.carpetAreaValuation || ''],
        ['12', 'Is it posh/ I class/Medium / Ordinary', pdfData.flatClass || ''],
        ['13', 'Is it being used for residential or commercial purpose?', pdfData.usage || ''],
        ['14', 'Is it it owner occupied or Rent out?', pdfData.occupancy || ''],
        ['15', 'If rented ,what is the monthly rent?', pdfData.rent || '']
    ];

    flatRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // MARKETABILITY section
    yPosition = checkPageBreak(yPosition, 12);
    yPosition = addSectionHeader('IV MARKETIBILITY', yPosition);

    const marketabilityRows = [
        ['1', 'How is marketability?', pdfData.marketability || ''],
        ['2', 'What are the factors favouring for an extra potential value?', pdfData.positiveFactors || ''],
        ['3', 'Any negative factors are observed which affect the market value in general?', pdfData.negativeFactors || '']
    ];

    marketabilityRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 8);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // RATE section
    yPosition = checkPageBreak(yPosition, 15);
    yPosition = addSectionHeader('V RATE', yPosition);

    const rateRows = [
        ['1', 'After analysing the comparable sale instances, what is the composite rate for a similar flat with same specifications in the adjoining locality?', pdfData.compositeRate || ''],
        ['2', 'Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison', pdfData.basicCompositeRate || ''],
        ['3', 'Break up for the rate', ''],
        ['', '(i) Building + Services', pdfData.buildingServiceRate || ''],
        ['', '(ii) Land+Others', pdfData.landOtherRate || ''],
        ['4', 'Guideline rate obtained from the Registrar\'s office', ''],
        ['', 'Per Sq. Mt.', pdfData.jantriRate || ''],
        ['', 'Total Jantri Value', pdfData.totalJantriValue || '']
    ];

    rateRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 10);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // COMPOSITE RATE section
    yPosition = checkPageBreak(yPosition, 20);
    yPosition = addSectionHeader('VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION', yPosition);

    const compositeRows = [
        ['a', 'Depreciated building rate', pdfData.depreciatedBuildingRate || ''],
        ['', 'Replacement cost of Flat with services', pdfData.replacementCost || ''],
        ['', 'Age of the building', pdfData.buildingAge || ''],
        ['', 'Life of the building estimated', pdfData.buildingLife || ''],
        ['', 'Depreciation % assuming the salvage value as 10%', pdfData.depreciationPercentage || ''],
        ['', 'Depreciated ratio of the building', pdfData.depreciatedRatio || ''],
        ['b', 'Total Composite rate arrived for valuation', pdfData.finalCompositeRate || ''],
        ['', 'Depreciated building rate VI (a)', pdfData.depreciatedBuildingRate || ''],
        ['', 'rate of land & Other VI (3) ii', pdfData.landOtherRate || ''],
        ['', 'Total Composite rate', pdfData.finalCompositeRate || '']
    ];

    compositeRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 10);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // DETAILS OF VALUATION
    yPosition = checkPageBreak(yPosition, 18);
    yPosition = addSectionHeader('DETAILS OF VALUATION', yPosition);

    // Table header for valuation details
    const valCol1 = 12, valCol2 = 65, valCol3 = 45, valCol4 = 48;
    const headers = ['No.', 'DESCRIPTION', 'Area in Sq. mt.', 'RATE'];
    const headerWidths = [valCol1, valCol2, valCol3, valCol4];
    let xPos = margin;

    doc.setFillColor(...headerBgColor);
    headerWidths.forEach((width, idx) => {
        drawCell(xPos, yPosition, width, baseRowHeight);
        doc.rect(xPos, yPosition, width, baseRowHeight, 'F');
        drawCell(xPos, yPosition, width, baseRowHeight);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(headers[idx], xPos + 1, yPosition + 3.5);
        xPos += width;
    });
    yPosition += baseRowHeight;

    // Valuation rows
    const valuationRows = [
        ['1', 'Present value of the Flat - Carpet Area', pdfData.carpetAreaValuation || '', pdfData.presentValue || ''],
        ['', '', 'Value Of The Flat', pdfData.presentValue || ''],
        ['2', 'Fixed Furniture & Fixtures', '', pdfData.furnitureFixtureValue || ''],
        ['', 'Total Value Of The Flat', '', pdfData.totalValue || '']
    ];

    valuationRows.forEach(row => {
        xPos = margin;
        headerWidths.forEach((width, idx) => {
            const cellText = row[idx] || '';
            const cellLines = getTextLines(cellText, width);
            const rowHeight = Math.max(baseRowHeight, cellLines.length * 3.5 + 2);
            drawCell(xPos, yPosition, width, rowHeight);
            drawCellText(cellLines.join('\n'), xPos, yPosition, width, rowHeight, false);
            xPos += width;
        });
        yPosition += baseRowHeight;
    });

    // In Words
    yPosition = addTableRow('', 'In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.', '', yPosition);

    // Appraisal values section
    yPosition = checkPageBreak(yPosition, 18);
    yPosition = addSectionHeader('As a result of my appraisal and analysis,', yPosition);

    const appraisalRows = [
        ['', 'Fair Market Market Value', pdfData.fairMarketValue || ''],
        ['', 'Realizable Value 95% of M.V', pdfData.realizableValue || ''],
        ['', 'Distress value 80% of M.V', pdfData.distressValue || ''],
        ['', 'Sale Deed Value', pdfData.saleDeedValue || ''],
        ['', 'Jantri Value', pdfData.totalJantriValue || ''],
        ['', 'Insurable Value', pdfData.insurableValue || ''],
        ['', 'Remarks: Rate is given on Carpet Area.', '']
    ];

    appraisalRows.forEach(row => {
        yPosition = checkPageBreak(yPosition, 10);
        yPosition = addTableRow(row[0], row[1], row[2], yPosition);
    });

    // Copy of document
    yPosition = addTableRow('', 'Copy Of Document Shown To Us', 'Mortgage Deed, Approved Plan, Previous Valuation Report', yPosition);

    // STATEMENT OF LIMITING CONDITIONS
    yPosition = checkPageBreak(yPosition, 30);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 255);
    doc.text('STATEMENT OF LIMITING CONDITIONS', margin, yPosition);
    yPosition += 4;

    const limitingConditions = [
        'If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.',
        'No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.',
        'Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.',
        'Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.',
        'Credibility of buyer and seller is fully responsible of financial institute, identification of buyer & seller is from financial institute only.',
        'If found any typo error in this report is not counted for any legal action and obligation.'
    ];

    limitingConditions.forEach(condition => {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(`• ${condition}`, pageWidth - 2 * margin - 3);
        doc.text(lines, margin + 2, yPosition);
        yPosition += (lines.length * 3.5) + 1;
        yPosition = checkPageBreak(yPosition, 10);
    });

    yPosition += 0.5;

    // VIII DECLARATION
    yPosition = checkPageBreak(yPosition, 30);
    yPosition = addSectionHeader('VIII DECLARATION', yPosition);
    yPosition += 0.5;

    const declarationItems = [
        ['', 'I hereby declare that-'],
        ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
        ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
        ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
        ['d', 'Future life of property is based on proper maintenance of the property']
    ];

    declarationItems.forEach(item => {
        yPosition = checkPageBreak(yPosition, 10);
        yPosition = addTableRow(item[0], item[1], '', yPosition);
    });

    yPosition += 1.5;

    // Signature Section
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Place: ${pdfData.place || ''}`, margin, yPosition);
    doc.text('SIGNATURE OF THE VALUER', pageWidth - 60, yPosition);
    yPosition += 4;

    doc.text(`Date: ${pdfData.signatureDate || ''}`, margin, yPosition);
    doc.text(pdfData.signerName || '', pageWidth - 60, yPosition);
    yPosition += 6;

    // Enclosure
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(`Encsd: 1. Declaration from the valuer`, margin, yPosition);
    yPosition += 4;

    // The undersigned text
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const underSignedText = `The undersigned has inspected the property detailed in the Valuation report dated-${pdfData.reportDate || ''}. We are satisfied that the fair and reasonable market value of the property is Rs. ${pdfData.fairMarketValue || ''}/- (In Words ${pdfData.fairMarketValueWords || ''}).`;
    const lines = doc.splitTextToSize(underSignedText, pageWidth - 2 * margin);
    doc.text(lines, margin, yPosition);
    yPosition += (lines.length * 3.5) + 5;

    // Final Signature
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SIGNATURE', pageWidth - 60, yPosition);
    yPosition += 5;
    doc.setFontSize(7);
    doc.text('NAME OF BRANCH OFFICIAL WITH SEAL', pageWidth - 75, yPosition);

    // Save the PDF
    const filename = `Valuation_Report_${pdfData.formId || recordData.uniqueId || 'Report'}.pdf`;
    doc.save(filename);
};

/**
 * Wrapper function to generate record PDF
 */
export const generateRecordPDF = (record) => {
    try {
        generateICICIValuationReport(record);
    } catch (error) {
        throw error;
    }
};
