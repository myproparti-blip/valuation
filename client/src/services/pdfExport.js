import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate exact replica of ICICI Bank Valuation Report PDF with Dashboard UI
 */
export const generateICICIValuationReport = (recordData = {}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPosition = 10;

    // Set colors matching the original document
    const headerColor = [0, 0, 0]; // Black for headers
    const borderColor = [0, 0, 0]; // Black borders
    const textColor = [0, 0, 0]; // Black text
    const lightGray = [240, 240, 240]; // Light gray for header backgrounds
    const darkBlue = [25, 55, 109]; // Dark blue for ICICI header

    // ===== PAGE 1 =====

    // ICICI Header Background
    doc.setFillColor(...darkBlue);
    doc.rect(0, 0, pageWidth, 20, 'F');

    // ICICI Logo and Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('ICICI Home Finance', margin + 2, 8);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('Asset Valuation', margin + 2, 14);

    yPosition = 25;

    // Main Title - INDIVIDUAL TECHNICAL REPORT
    doc.setFillColor(25, 55, 109);
    doc.rect(0, yPosition - 2, pageWidth, 6, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('INDIVIDUAL TECHNICAL REPORT', margin, yPosition + 1);

    yPosition += 10;
    doc.setTextColor(...textColor);

    // Request Information Table
    const requestData = [
        ['Request ID:', recordData.uniqueId ? recordData.uniqueId.substring(0, 40) : '', 'Application No.:', recordData.mobileNumber || ''],
        ['Customer Name:', recordData.clientName || '', 'Branch :', recordData.city || ''],
        ['Product Name:', recordData.bankName || '', 'BSM/RM Name:', recordData.engineerName || ''],
        ['Loan Property Type:', recordData.dsa || '', 'Visited User Type:', recordData.payment === 'yes' ? 'Collected' : (recordData.payment === 'no' ? 'Not Collected' : '')],
        ['Contact Name:', recordData.username || '', 'Mobile :', recordData.mobileNumber || '']
    ];

    // Draw table manually to match original format
    const colWidths = [35, 45, 35, 45];
    const rowHeight = 6;

    requestData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);

        // Draw borders
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + colWidths[0], rowY, margin + colWidths[0], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1], rowY, margin + colWidths[0] + colWidths[1], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1] + colWidths[2], rowY, margin + colWidths[0] + colWidths[1] + colWidths[2], rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);

        // Add text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textColor);

        doc.text(row[0], margin + 2, rowY + 4);
        const val1 = doc.splitTextToSize(row[1], colWidths[0] - 4);
        doc.text(val1, margin + colWidths[0] + 2, rowY + 4);
        doc.text(row[2], margin + colWidths[0] + colWidths[1] + 2, rowY + 4);
        const val3 = doc.splitTextToSize(row[3], colWidths[2] - 4);
        doc.text(val3, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, rowY + 4);
    });

    yPosition += (requestData.length * rowHeight) + 8;

    // PROPERTY ADDRESS Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY ADDRESS', margin, yPosition);
    yPosition += 6;

    const propertyData = [
        ['Property Address:', recordData.address || '', 'Location:', recordData.location || ''],
        ['Legal Address:', recordData.address || '', 'City:', recordData.city || ''],
        ['', '', 'State:', 'India'],
        ['', '', 'Nearby Landmark:', recordData.nearbyLandmark || ''],
        ['', '', 'Collateral ID:', recordData.uniqueId ? recordData.uniqueId.substring(0, 30) : '']
    ];

    propertyData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);

        // Draw borders
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + colWidths[0], rowY, margin + colWidths[0], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1], rowY, margin + colWidths[0] + colWidths[1], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1] + colWidths[2], rowY, margin + colWidths[0] + colWidths[1] + colWidths[2], rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);

        // Add text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        if (row[0]) doc.text(row[0], margin + 2, rowY + 4);
        if (row[1]) {
            const addressLines = doc.splitTextToSize(row[1], colWidths[1] - 4);
            doc.text(addressLines, margin + colWidths[0] + 2, rowY + 4);
        }
        if (row[2]) doc.text(row[2], margin + colWidths[0] + colWidths[1] + 2, rowY + 4);
        if (row[3]) {
            const valueLines = doc.splitTextToSize(row[3], colWidths[3] - 4);
            doc.text(valueLines, margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, rowY + 4);
        }
    });

    yPosition += (propertyData.length * rowHeight) + 8;

    // PROPERTY DETAILS Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY DETAILS', margin, yPosition);
    yPosition += 6;

    const propertyDetails = [
        ['Type Of Property:', recordData.typeOfProperty || '', 'Plot Demarcated At Site:', recordData.plotDemarcated || ''],
        ['Approved Land Use:', recordData.approvedLandUse || '', 'Infrastructure Of The Surrounding Area:', recordData.infrastructure || ''],
        ['No of Floors:', recordData.numberOfFloors || '', 'Class Of Locality:', recordData.classOfLocality || ''],
        ['Carpet Area Measured:', recordData.carpetAreaMeasured || '', 'Property Location:', recordData.location || ''],
        ['Nature of Location:', recordData.natureOfLocation || '', 'Distance Travelled From Operating', recordData.distanceTravelled || ''],
        ['Green Housing:', recordData.greenHousing || '', 'Distance from City Center Kin:', recordData.distanceFromCityCenter || ''],
        ['Report Condition:', recordData.reportCondition || recordData.status || '', '', '']
    ];

    propertyDetails.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);

        // Draw borders
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + colWidths[0], rowY, margin + colWidths[0], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1], rowY, margin + colWidths[0] + colWidths[1], rowY + rowHeight);
        doc.line(margin + colWidths[0] + colWidths[1] + colWidths[2], rowY, margin + colWidths[0] + colWidths[1] + colWidths[2], rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);

        // Add text
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');

        doc.text(row[0], margin + 2, rowY + 4);
        doc.text(row[1], margin + colWidths[0] + 2, rowY + 4);
        doc.text(row[2], margin + colWidths[0] + colWidths[1] + 2, rowY + 4);
        if (row[3]) doc.text(row[3], margin + colWidths[0] + colWidths[1] + colWidths[2] + 2, rowY + 4);
    });

    yPosition += (propertyDetails.length * rowHeight) + 8;

    // UNIT DETAILS Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIT DETAILS', margin, yPosition);
    yPosition += 6;

    // First table for room details
    const unitHeaders = ['Details', 'No. of Rooms', 'No. of Kitchens', 'No of Bathrooms', 'Usages & Remark'];
    const unitData = [
        ['Ground Floor', recordData.groundFloorRooms || '', recordData.groundFloorKitchens || '', recordData.groundFloorBathrooms || '', recordData.groundFloorUsage || ''],
        ['First Floor', recordData.firstFloorRooms || '', recordData.firstFloorKitchens || '', recordData.firstFloorBathrooms || '', recordData.firstFloorUsage || ''],
        ['Second Floor', recordData.secondFloorRooms || '', recordData.secondFloorKitchens || '', recordData.secondFloorBathrooms || '', recordData.secondFloorUsage || ''],
        ['Other1', recordData.other1Rooms || '', recordData.other1Kitchens || '', recordData.other1Bathrooms || '', recordData.other1Usage || ''],
        ['Other2', recordData.other2Rooms || '', recordData.other2Kitchens || '', recordData.other2Bathrooms || '', recordData.other2Usage || '']
    ];

    const unitColWidths = [30, 25, 25, 25, 55];

    // Draw unit details table headers with light gray background
    unitHeaders.forEach((header, colIndex) => {
        const xPos = margin + unitColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, unitColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, unitColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // Draw unit details table data
    unitData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + unitColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, unitColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(cell, xPos + 2, rowY + 4);
        });
    });

    yPosition += ((unitData.length + 1) * rowHeight) + 6;

    // Second table for structure details
    const structureHeaders = ['Structure', 'Occupancy Status', 'Occupied By', 'Approx. Property Age'];
    const structureData = [
        [recordData.structureType || '', recordData.occupancyStatus || '', recordData.occupiedBy || '', recordData.propertyAge || '']
    ];

    const structureColWidths = [40, 30, 30, 60];

    // Structure table headers
    structureHeaders.forEach((header, colIndex) => {
        const xPos = margin + structureColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, structureColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, structureColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // Structure table data
    structureData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + structureColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, structureColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(cell, xPos + 2, rowY + 4);
        });
    });

    yPosition += ((structureData.length + 1) * rowHeight) + 6;

    // Third table for maintenance details
    const maintenanceHeaders = ['Maintenance Level', 'Occupied Since', 'Relationship of Occupant', 'Residual Age Of Property'];
    const maintenanceData = [
        [recordData.maintenanceLevel || '', recordData.occupiedSince || '', recordData.relationshipOfOccupant || '', recordData.residualAge || '']
    ];

    const maintenanceColWidths = [40, 30, 45, 45];

    // Maintenance table headers
    maintenanceHeaders.forEach((header, colIndex) => {
        const xPos = margin + maintenanceColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, maintenanceColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, maintenanceColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // Maintenance table data
    maintenanceData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + maintenanceColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, maintenanceColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(cell, xPos + 2, rowY + 4);
        });
    });

    yPosition += ((maintenanceData.length + 1) * rowHeight) + 8;

    // BOUNDARIES ON SITE Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BOUNDARIES ON SITE', margin, yPosition);
    yPosition += 6;

    const boundariesHeaders = ['', 'East', 'West', 'North', 'South'];
    const boundariesData = [
        ['As per Sale Deed', recordData.saleDeadEast || '', recordData.saleDeadWest || '', recordData.saleDeadNorth || '', recordData.saleDeadSouth || ''],
        ['Actual on Site', recordData.directions?.east1 || '', recordData.directions?.west1 || '', recordData.directions?.north1 || '', recordData.directions?.south1 || '']
    ];

    const boundariesColWidths = [40, 30, 30, 30, 30];

    // Boundaries table headers
    boundariesHeaders.forEach((header, colIndex) => {
        const xPos = margin + boundariesColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, boundariesColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, boundariesColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // Boundaries table data
    boundariesData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + boundariesColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, boundariesColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            if (colIndex === 0) doc.setFont('helvetica', 'bold');
            doc.text(cell, xPos + 2, rowY + 4);
            if (colIndex === 0) doc.setFont('helvetica', 'normal');
        });
    });

    // Page footer for page 1
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`${recordData.uniqueId || 'HRQ-22-88157'}/77`, pageWidth - 20, footerY);
    doc.text('Page -1-', pageWidth - 30, footerY - 5);

    // ===== PAGE 2 =====
    doc.addPage();
    yPosition = 10;

    // NDMA Details Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('NDMA Details', margin, yPosition);
    yPosition += 8;

    const ndmaData = [
        ['Height Of Building(Above Ground Level)', recordData.buildingHeight || '', 'Seismic Zone', recordData.coordinates?.latitude || ''],
        ['Flood Prone Area', recordData.floodProneArea || '', 'CRZ', recordData.coordinates?.longitude || '']
    ];

    ndmaData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + 40, rowY, margin + 40, rowY + rowHeight);
        doc.line(margin + 80, rowY, margin + 80, rowY + rowHeight);
        doc.line(margin + 120, rowY, margin + 120, rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(row[0], margin + 2, rowY + 4);
        doc.text(row[1], margin + 42, rowY + 4);
        doc.text(row[2], margin + 82, rowY + 4);
        doc.text(row[3], margin + 122, rowY + 4);
    });

    yPosition += (ndmaData.length * rowHeight) + 8;

    // VALUATION AS PER GOVT. APPROVED RATES Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VALUATION AS PER GOVT. APPROVED RATES', margin, yPosition);
    yPosition += 6;

    const govtRatesData = [
        ['Land/Build up/Soleable Area:', recordData.landArea || '', 'Constructed Area:', recordData.constructedArea || ''],
        ['Land/Build up/Soleable Rate:', recordData.landRate || '', 'Constructed Rate :', recordData.constructedRate || ''],
        ['Total Value :', recordData.totalValue || '', 'Floorwise Usage:', recordData.floorwiseUsage || '']
    ];

    govtRatesData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);
        doc.setDrawColor(...borderColor);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + 60, rowY, margin + 60, rowY + rowHeight);
        doc.line(margin + 100, rowY, margin + 100, rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(row[0], margin + 2, rowY + 4);
        doc.text(row[1], margin + 62, rowY + 4);
        doc.text(row[2], margin + 102, rowY + 4);
        doc.text(row[3], margin + 142, rowY + 4);
    });

    yPosition += (govtRatesData.length * rowHeight) + 8;

    // VALUATION Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VALUATION', margin, yPosition);
    yPosition += 6;

    const valuationHeaders = ['Description', 'Area in Sq.Ft', 'Rate/Sq.Ft', 'Amount (R)'];
    const valuationData = [
        ['Landarea', recordData.landAreaSqFt || '', recordData.landRateSqFt || '', recordData.landAmount || ''],
        ['Carpet Area', recordData.carpetAreaSqFt || '', recordData.carpetRateSqFt || '', recordData.carpetAmount || ''],
        ['Super Built Up/Sellable Area', recordData.superBuiltAreaSqFt || '', recordData.superBuiltRateSqFt || '', recordData.superBuiltAmount || ''],
        ['Other 1', recordData.other1AreaSqFt || '', recordData.other1RateSqFt || '', recordData.other1Amount || ''],
        ['Other 2', recordData.other2AreaSqFt || '', recordData.other2RateSqFt || '', recordData.other2Amount || ''],
        ['% Completion', recordData.percentCompletion || '', 'TOTAL', recordData.totalAmount || ''],
        ['% Recommended', recordData.percentRecommended || '', 'Realizable Value:', recordData.realizableValue || '']
    ];

    const valuationColWidths = [60, 30, 30, 40];

    // Valuation table headers
    valuationHeaders.forEach((header, colIndex) => {
        const xPos = margin + valuationColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, valuationColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, valuationColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // Valuation table data
    valuationData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + valuationColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, valuationColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(cell, xPos + 2, rowY + 4);
        });
    });

    yPosition += ((valuationData.length + 1) * rowHeight) + 6;

    // Realizable Value
    doc.setFontSize(8);
    doc.text('Realizable Value in Words : Rupees', margin, yPosition);
    yPosition += 10;

    // Visited By and Violations
    doc.text('Visited By:', margin, yPosition);
    yPosition += 4;
    doc.text('Violations observed (if any):', margin, yPosition);
    yPosition += 4;
    doc.text('Not Applicable As Plan And Permission Is Not Provided', margin, yPosition);
    yPosition += 8;

    // Remarks
    doc.text('Remarks:', margin, yPosition);
    yPosition += 4;
    const remarks = recordData.remarks || 'null | 1 documents provided are registered release deed property card 2 plot area considered as per registered release deed and built up area as per on site measurement 3 plan and permission not available hence technical violation indemnity is required';
    const remarksLines = doc.splitTextToSize(remarks, 160);
    doc.text(remarksLines, margin, yPosition);
    yPosition += (remarksLines.length * 4) + 8;
    
    // Additional Info Section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL INFORMATION', margin, yPosition);
    yPosition += 4;
    
    const additionalInfo = [
        ['Submitted By:', recordData.username || ''],
        ['Status:', recordData.status || ''],
        ['Collection Status:', recordData.payment === 'yes' ? 'Collected' : (recordData.payment === 'no' ? 'Not Collected' : '')],
        ['Collected By:', recordData.collectedBy || ''],
        ['Date & Time:', recordData.dateTime || ''],
        ['Manager Feedback:', recordData.managerFeedback || '']
    ];
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    additionalInfo.forEach((item, index) => {
        const itemYPos = yPosition + (index * 4);
        doc.text(item[0], margin + 2, itemYPos);
        const infoLines = doc.splitTextToSize(item[1], 140);
        doc.text(infoLines, margin + 40, itemYPos);
    });
    
    yPosition += (additionalInfo.length * 4) + 4;

    // OMNI DOCS FILES
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('OMNI DOCS FILES', margin, yPosition);
    yPosition += 6;

    const omniHeaders = ['File Name', 'Latitude', 'Longitude', 'Go To Map'];
    const omniData = [
        [recordData.fileName || '', recordData.fileLatitude || '', recordData.fileLongitude || '', recordData.goToMap || '']
    ];

    const omniColWidths = [60, 35, 35, 30];

    // OMNI Docs table headers
    omniHeaders.forEach((header, colIndex) => {
        const xPos = margin + omniColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        doc.setFillColor(...lightGray);
        doc.rect(xPos, yPosition, omniColWidths[colIndex], rowHeight, 'F');
        doc.setDrawColor(...borderColor);
        doc.rect(xPos, yPosition, omniColWidths[colIndex], rowHeight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(header, xPos + 2, yPosition + 4);
    });

    // OMNI Docs table data
    omniData.forEach((row, rowIndex) => {
        const rowY = yPosition + ((rowIndex + 1) * rowHeight);
        row.forEach((cell, colIndex) => {
            const xPos = margin + omniColWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
            doc.setDrawColor(...borderColor);
            doc.rect(xPos, rowY, omniColWidths[colIndex], rowHeight);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(cell, xPos + 2, rowY + 4);
        });
    });

    // Page footer for page 2
    const footerY2 = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`${recordData.uniqueId || 'HRQ-22-88157'}/77`, pageWidth - 20, footerY2);
    doc.text('Page -2-', pageWidth - 30, footerY2 - 5);

    // ===== PAGE 3 =====
    doc.addPage();
    yPosition = 10;

    // Approval Information
    const approvalData = [
        ['Entered By:', recordData.enteredBy || '', 'Recommended by:', recordData.recommendedBy || ''],
        ['Entered On:', recordData.enteredOn || '', 'Recommender\'s Comment:', recordData.recommenderComment || ''],
        ['Completion Status:', recordData.completionStatus || '', '', ''],
        ['Approver Name:', recordData.approverName || '', 'Designation:', recordData.designation || ''],
        ['Approver Recommendation :', recordData.approverRecommendation || '', 'Conditional Remark:', recordData.conditionalRemark || ''],
        ['Approver\'s Comment:', recordData.approverComment || '', '', ''],
        ['Approver ID:', recordData.approverId || '', 'Approved On :', recordData.approvedOn || '']
    ];

    approvalData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * rowHeight);
        doc.setDrawColor(...borderColor);
        doc.line(margin, rowY, margin + 160, rowY);
        doc.line(margin, rowY + rowHeight, margin + 160, rowY + rowHeight);
        doc.line(margin, rowY, margin, rowY + rowHeight);
        doc.line(margin + 40, rowY, margin + 40, rowY + rowHeight);
        doc.line(margin + 80, rowY, margin + 80, rowY + rowHeight);
        doc.line(margin + 120, rowY, margin + 120, rowY + rowHeight);
        doc.line(margin + 160, rowY, margin + 160, rowY + rowHeight);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        if (rowIndex === 3 || rowIndex === 6) doc.setFont('helvetica', 'bold');

        doc.text(row[0], margin + 2, rowY + 4);
        doc.text(row[1], margin + 42, rowY + 4);
        doc.text(row[2], margin + 82, rowY + 4);
        doc.text(row[3], margin + 122, rowY + 4);

        doc.setFont('helvetica', 'normal');
    });

    yPosition += (approvalData.length * rowHeight) + 8;

    // Image/Location Data
    const locationData = [
        ['Longitude:', recordData.longitude1 || '', 'Latitude:', recordData.latitude1 || '', 'Image Token:', recordData.imageToken1 || ''],
        ['Longitude:', recordData.longitude2 || '', 'Latitude:', recordData.latitude2 || '', 'Image Token:', recordData.imageToken2 || ''],
        ['Longitude:', recordData.longitude3 || '', 'Latitude:', recordData.latitude3 || '', 'Trading:', recordData.trading || ''],
        ['Longitude:', recordData.longitude4 || '', 'Latitude:', recordData.latitude4 || '', 'Image Token:', recordData.imageToken4 || '']
    ];

    locationData.forEach((row, rowIndex) => {
        const rowY = yPosition + (rowIndex * 5);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');

        doc.text(row[0], margin, rowY);
        doc.text(row[1], margin + 20, rowY);
        doc.text(row[2], margin + 60, rowY);
        doc.text(row[3], margin + 75, rowY);
        doc.text(row[4], margin + 110, rowY);
        doc.text(row[5], margin + 130, rowY);
    });

    yPosition += (locationData.length * 5) + 10;

    // DECLARATION Section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DECLARATION', margin, yPosition);
    yPosition += 6;

    const declarationText = [
        'I/We herby declare that: 1. The property was inspected by me/us. 2. I/We have no direct or indirect interest in the property valued 3. The information furnished above is true and correct to my/our knowledge.',
        '',
        'DISCALMER: ICICI Group is merely acting in the capacity of a valuer and does not undertake any responsibility for aspects other than valuation of property as mentioned in the report. All assistance is provided on a best effort basis only.',
        'The valuation report ("Report") is based on the location of the property, infrastructure available, overall development of the vicinity and prevailing market rates for similar properties and on the facts and confirmation provided by the client ("Client") or his professional advisor or any other party on behalf of the Client as an date of assessment, which the Client represents to be complete and accurate in all respects. Report contains no representations or warranties of any kind. The Client should exercise appropriate due diligence with respect to the property, including approval status, legal and tax diligence, prior to taking of any decision. Compliance with statutory requirements applicable for construction is the responsibility of person undertaking the construction activity. ICICI Group does not have any role in construction and pricing of the project / Property.',
        'ICICI Group has not undertaken any investigation into the title of the property and the valuation is made on the presumption that the property possesses a good and marketable title and is free from encumbrances.',
        'The contents of this Report are strictly confidential and are intended for the exclusive use of the Client.This document may not be altered in any way, transmitted, copied or distributed, in part or in whole, to any other person or to the media or reproduced in any form, without prior written consent of ICICI Group. ICICI Group accepts no responsibility or liability to any third party for whole or any part of the Report.',
        'ICICI Group specifically excludes any liability with respect to any losses incurred by the Client due to any act or omission of the developer or any other third party and any consequences thereof. ICICI Group\'s total aggregate liability to the Client for any reason, whatsoever, shall be limited to an aggregate sum not exceeding the total fees received by ICICI Group for this report. ICICI Group shall not be liable for any indirect or consequential losses which, arise out of or in connection with services provided under this engagement.'
    ];

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    declarationText.forEach((paragraph, index) => {
        const lines = doc.splitTextToSize(paragraph, 180);
        doc.text(lines, margin, yPosition);
        yPosition += (lines.length * 3) + 2;
    });

    // Page footer for page 3
    const footerY3 = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`${recordData.uniqueId || 'HRQ-22-88157'}/77`, pageWidth - 20, footerY3);
    doc.text('Page -3-', pageWidth - 30, footerY3 - 5);

    // ===== PAGE 4: DASHBOARD TABLE DATA =====
    doc.addPage();
    yPosition = 10;

    // Dashboard header
    doc.setFillColor(...darkBlue);
    doc.rect(0, yPosition - 2, pageWidth, 6, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DASHBOARD SUMMARY TABLE', margin, yPosition + 1);

    yPosition += 10;
    doc.setTextColor(...textColor);

    // Dashboard Summary Data - Statistics Cards
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SUBMISSION STATISTICS', margin, yPosition);
    yPosition += 5;

    const statItems = [
        ['Form ID:', recordData.uniqueId?.substring(0, 30) || ''],
        ['Client Name:', recordData.clientName || ''],
        ['Mobile Number:', recordData.mobileNumber || ''],
        ['City:', recordData.city || ''],
        ['Bank Name:', recordData.bankName || ''],
        ['Engineer Name:', recordData.engineerName || ''],
        ['Status:', recordData.status || ''],
        ['Payment Status:', recordData.payment === 'yes' ? 'Collected' : (recordData.payment === 'no' ? 'Not Collected' : '')],
        ['Created Date:', recordData.createdAt ? new Date(recordData.createdAt).toLocaleDateString() : ''],
        ['Location:', recordData.location || ''],
        ['Address:', recordData.address ? recordData.address.substring(0, 50) : ''],
        ['DSA:', recordData.dsa || '']
    ];

    const statColWidth = [60, 110];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    statItems.forEach((item, index) => {
        const itemYPos = yPosition + (index * 5);
        doc.setDrawColor(...borderColor);
        doc.setLineWidth(0.1);

        // Left cell (label)
        doc.rect(margin, itemYPos, statColWidth[0], 5);
        doc.setFont('helvetica', 'bold');
        doc.text(item[0], margin + 2, itemYPos + 3.5);

        // Right cell (value)
        doc.rect(margin + statColWidth[0], itemYPos, statColWidth[1], 5);
        doc.setFont('helvetica', 'normal');
        const valueLines = doc.splitTextToSize(item[1], statColWidth[1] - 4);
        doc.text(valueLines, margin + statColWidth[0] + 2, itemYPos + 3.5);
    });

    yPosition += (statItems.length * 5) + 8;

    // Property and Valuation Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PROPERTY & VALUATION DETAILS', margin, yPosition);
    yPosition += 5;

    const propertyItems = [
        ['Property Address:', recordData.address || ''],
        ['Location:', recordData.location || ''],
        ['Latitude:', recordData.coordinates?.latitude || ''],
        ['Longitude:', recordData.coordinates?.longitude || ''],
        ['Directions - North:', recordData.directions?.north1 || ''],
        ['Directions - East:', recordData.directions?.east1 || ''],
        ['Directions - South:', recordData.directions?.south1 || ''],
        ['Directions - West:', recordData.directions?.west1 || ''],
        ['Submitted Date:', recordData.dateTime || ''],
        ['Day:', recordData.day || ''],
        ['Manager Feedback:', recordData.managerFeedback || '']
    ];

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    propertyItems.forEach((item, index) => {
        const itemYPos = yPosition + (index * 5);

        // Check if we need a new page
        if (itemYPos > pageHeight - 20) {
            doc.addPage();
            yPosition = 10;
            const newItemYPos = yPosition + (index * 5);

            // Left cell (label)
            doc.rect(margin, newItemYPos, statColWidth[0], 5);
            doc.setFont('helvetica', 'bold');
            doc.text(item[0], margin + 2, newItemYPos + 3.5);

            // Right cell (value)
            doc.rect(margin + statColWidth[0], newItemYPos, statColWidth[1], 5);
            doc.setFont('helvetica', 'normal');
            const valueLines = doc.splitTextToSize(item[1], statColWidth[1] - 4);
            doc.text(valueLines, margin + statColWidth[0] + 2, newItemYPos + 3.5);
        } else {
            // Left cell (label)
            doc.rect(margin, itemYPos, statColWidth[0], 5);
            doc.setFont('helvetica', 'bold');
            doc.text(item[0], margin + 2, itemYPos + 3.5);

            // Right cell (value)
            doc.rect(margin + statColWidth[0], itemYPos, statColWidth[1], 5);
            doc.setFont('helvetica', 'normal');
            const valueLines = doc.splitTextToSize(item[1], statColWidth[1] - 4);
            doc.text(valueLines, margin + statColWidth[0] + 2, itemYPos + 3.5);
        }
    });

    yPosition += (propertyItems.length * 5) + 8;

    // Page footer for page 4
    const footerY4 = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(`${recordData.uniqueId || 'HRQ-22-88157'}/77`, pageWidth - 20, footerY4);
    doc.text('Page -4-', pageWidth - 30, footerY4 - 5);

    // Save the PDF
    const filename = `ICICI_Valuation_Report_${recordData.requestId || recordData.uniqueId || 'HRQ-22-88157'}.pdf`;
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