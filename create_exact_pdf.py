#!/usr/bin/env python3
"""
Generate exact PDF replica of valuation report from screenshots
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfgen import canvas

# Configuration
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 0.5 * inch
MAX_WIDTH = PAGE_WIDTH - (2 * MARGIN)

class PDFGenerator:
    def __init__(self):
        self.story = []
        self.doc = SimpleDocTemplate(
            "Valuation_Report.pdf",
            pagesize=A4,
            topMargin=MARGIN,
            bottomMargin=MARGIN,
            leftMargin=MARGIN,
            rightMargin=MARGIN,
            title="Valuation Report"
        )
        
    def add_header(self):
        """Add document header"""
        # Header table
        header_data = [
            ["To;", "", "", "File No: 06GGB1025 10"],
            ["Gujarat Gramin Bank , Vadodara", "", "", "Date: 31-Oct-2025"],
            ["Manjalpur Branch", "", "", ""]
        ]
        
        header_table = Table(header_data, colWidths=[2.0*inch, 1.0*inch, 0.5*inch, 1.5*inch])
        header_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (2, -1), 'LEFT'),
            ('ALIGN', (3, 0), (3, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        self.story.append(header_table)
        self.story.append(Spacer(1, 0.15*inch))
        
    def add_title(self):
        """Add report title"""
        title_style = ParagraphStyle(
            'CustomTitle',
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.black,
            alignment=TA_CENTER,
            spaceAfter=6
        )
        title = Paragraph("VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)", title_style)
        self.story.append(title)
        
    def create_general_section(self):
        """Create GENERAL section with exact table structure"""
        general_data = [
            ['GENERAL', ''],
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
        ]
        
        col_widths = [0.5*inch, 2.8*inch, 3.2*inch]
        table = Table(general_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            # Header row background
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            
            # All cells borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.1*inch))

    def create_apartment_building_section(self):
        """Create II. APARTMENT BUILDING section"""
        apt_data = [
            ['II. APARTMENT BUILDING', ''],
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
        ]
        
        col_widths = [0.5*inch, 2.8*inch, 3.2*inch]
        table = Table(apt_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.1*inch))

    def create_flat_section(self):
        """Create III. FLAT section"""
        flat_data = [
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
            ['III. Flat', ''],
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
        ]
        
        col_widths = [0.5*inch, 2.8*inch, 3.2*inch]
        table = Table(flat_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            # Header rows for sections
            ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 10), (-1, 10), colors.whitesmoke),
            ('FONTNAME', (0, 10), (-1, 10), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 10), (-1, 10), 10),
        ]))
        
        self.story.append(table)
        self.story.append(PageBreak())

    def create_marketability_rate_sections(self):
        """Create IV MARKETIBILITY and V RATE sections"""
        market_data = [
            ['IV MARKETIBILITY', ''],
            ['1', 'How is marketability?', 'Good'],
            ['2', 'What are the factors favouring for an extra potential value?', 'Prposed Fully Developed Scheme'],
            ['3', 'Any negative factors are observed which affect the market value in general?', 'The Unforeseen Events'],
            ['V RATE', ''],
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
        ]
        
        col_widths = [0.5*inch, 2.8*inch, 3.2*inch]
        table = Table(market_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            # Section headers
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 4), (-1, 4), colors.whitesmoke),
            ('FONTNAME', (0, 4), (-1, 4), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 4), (-1, 4), 10),
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.1*inch))

    def create_composite_and_details_section(self):
        """Create VI COMPOSITE RATE and DETAILS OF VALUATION sections"""
        composite_data = [
            ['VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION', ''],
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
            ['DETAILS OF VALUATION', ''],
            ['No.', 'DESCRIPTION', 'Area in Sq. mt. | RATE'],
            ['1', 'Present value of the Flat - Carpet Area', '68.93 | ₹ 64,580.00'],
            ['', 'Value Of The Flat', '₹ 44,51,499.40'],
            ['2', 'Fixed Furniture & Fixtures', '₹ 15,00,000.00'],
            ['', 'Total Value Of The Flat', '₹ 59,51,499.40'],
            ['', 'In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.', ''],
        ]
        
        col_widths = [0.5*inch, 2.8*inch, 3.2*inch]
        table = Table(composite_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            # Headers
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 11), (-1, 11), colors.HexColor('#003366')),
            ('TEXTCOLOR', (0, 11), (-1, 11), colors.whitesmoke),
            ('FONTNAME', (0, 11), (-1, 11), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 11), (-1, 11), 10),
            ('BACKGROUND', (0, 12), (-1, 12), colors.lightgrey),
            ('FONTNAME', (0, 12), (-1, 12), 'Helvetica-Bold'),
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.15*inch))

    def create_appraisal_and_final_section(self):
        """Create final sections with appraisal results and declarations"""
        final_data = [
            ['As a result of my appraisal and analysis,', ''],
            ['Fair Market Market Value', '₹ 59,51,499.40'],
            ['Realizeable Value 95% of M.V', '₹ 56,63,924.43'],
            ['Distress value 80% of M.V', '₹ 47,61,199.52'],
            ['Sale Deed Value', 'NA'],
            ['Jantri Value', '₹ 16,12,962.00'],
            ['Insurable Value', '₹ 20,83,024.79'],
            ['Remarks: Rate is given on Carpet Area.', ''],
            ['Copy Of Document Shown To Us', 'Mortgage Deed, Approved Plan, Previous Valuation Report'],
        ]
        
        col_widths = [3.5*inch, 2.5*inch]
        table = Table(final_data, colWidths=col_widths)
        
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        self.story.append(table)
        self.story.append(Spacer(1, 0.2*inch))

    def add_statement_and_declaration(self):
        """Add statement of limiting conditions and declaration"""
        statement_style = ParagraphStyle(
            'Statement',
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.HexColor('0000FF'),
            spaceAfter=8
        )
        
        body_style = ParagraphStyle(
            'Body',
            fontName='Helvetica',
            fontSize=8,
            spaceAfter=4,
            leading=10
        )
        
        self.story.append(Paragraph("STATEMENT OF LIMITING CONDITIONS", statement_style))
        
        conditions = [
            "• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.",
            "• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.",
            "• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.",
            "• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.",
            "• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.",
            "• If found any typo error in this report is not counted for any legal action and obligation."
        ]
        
        for condition in conditions:
            self.story.append(Paragraph(condition, body_style))
        
        self.story.append(Spacer(1, 0.15*inch))
        
        # Declaration section
        decl_style = ParagraphStyle(
            'Declaration',
            fontName='Helvetica-Bold',
            fontSize=10,
            spaceAfter=8
        )
        
        self.story.append(Paragraph("VIII DECLARATION", decl_style))
        
        decl_data = [
            ['', 'I hereby declare that-'],
            ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
            ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
            ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
            ['d', 'Future life of property is based on proper maintenance of the property'],
        ]
        
        col_widths = [0.3*inch, 6.2*inch]
        decl_table = Table(decl_data, colWidths=col_widths)
        
        decl_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ]))
        
        self.story.append(decl_table)
        self.story.append(Spacer(1, 0.15*inch))
        
        # Signature section
        sig_data = [
            ['Place: Vadodara', '', 'SIGNATURE OF THE VALUER'],
            ['Date: 31/10/2025', '', 'MAHIM ARCHITECTS'],
        ]
        
        sig_table = Table(sig_data, colWidths=[2.0*inch, 1.5*inch, 2.0*inch])
        sig_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (2, 0), (2, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ]))
        
        self.story.append(sig_table)
        self.story.append(Spacer(1, 0.2*inch))
        
        # Enclosure
        self.story.append(Paragraph("<b>Enclsd: 1. Declaration from the valuer</b>", body_style))
        
        encl_text = "The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only)."
        self.story.append(Paragraph(encl_text, body_style))
        
        self.story.append(Spacer(1, 0.15*inch))
        
        sig_final = [
            ['', 'SIGNATURE'],
            ['', 'NAME OF BRANCH OFFICIAL WITH SEAL'],
        ]
        
        sig_final_table = Table(sig_final, colWidths=[3.5*inch, 2.5*inch])
        sig_final_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        self.story.append(sig_final_table)

    def build(self):
        """Build the complete PDF"""
        self.add_header()
        self.add_title()
        self.create_general_section()
        self.create_apartment_building_section()
        self.create_flat_section()
        self.create_marketability_rate_sections()
        self.create_composite_and_details_section()
        self.create_appraisal_and_final_section()
        self.add_statement_and_declaration()
        
        # Build PDF
        self.doc.build(self.story)
        print("✓ PDF generated successfully: Valuation_Report.pdf")


if __name__ == '__main__':
    generator = PDFGenerator()
    generator.build()
