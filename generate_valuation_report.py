from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime

# Create PDF
pdf_filename = "Valuation_Report.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch, 
                       leftMargin=0.5*inch, rightMargin=0.5*inch)

# Container for the 'Flowable' objects
elements = []

# Define styles
styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=12,
    textColor=colors.black,
    spaceAfter=6,
    alignment=TA_CENTER,
    fontName='Helvetica-Bold'
)

normal_style = ParagraphStyle(
    'Normal',
    parent=styles['Normal'],
    fontSize=9,
    textColor=colors.black,
    spaceAfter=2,
    alignment=TA_LEFT,
    fontName='Helvetica'
)

header_style = ParagraphStyle(
    'Header',
    parent=styles['Normal'],
    fontSize=10,
    textColor=colors.black,
    spaceAfter=2,
    alignment=TA_LEFT,
    fontName='Helvetica'
)

# Helper function to create table with borders
def create_bordered_table(data, col_widths=None, header_bg=colors.lightgrey):
    if col_widths is None:
        col_widths = [1.5*inch] * len(data[0])
    
    table = Table(data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.white]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    return table

# Header section
header_data = [
    ['To;', '', '', 'File No: 06GGB1025 10'],
    ['Gujarat Gramin Bank , Vadodara', '', '', 'Date: 31-Oct-2025'],
    ['Manjalpur Branch', '', '', ''],
]

for row in header_data:
    elements.append(Paragraph(f"<b>{row[0]}</b> {row[1]}", normal_style))

elements.append(Spacer(1, 0.1*inch))

# GENERAL SECTION - Title
general_title = Paragraph("<b>VALUATION REPORT(IN RESPECT OF FLAT/HOUSE/INDUSTRIAL/SHOP)</b>", title_style)
elements.append(general_title)
elements.append(Spacer(1, 0.08*inch))

# GENERAL subsection
elements.append(Paragraph("<b>GENERAL</b>", header_style))

general_data = [
    ['1', 'Purpose for which valuation is made', 'Financial Assistance for loan from GGB Bank'],
    ['2', '(a) Date of inspection\n(b) Date on which valuation is made', '30-Oct-2025\n31-Oct-2025'],
    ['', 'List of documents produced for pursual', ''],
    ['', '(1) Mortgage Deed :', 'Reg. No. 7204, Dated: 28/05/2025'],
    ['', '(2) Mortgage Deed Between :', 'Hemanshu Haribhai Patel & GGB Manjalpur Branch - Mr. Sanjaykumar'],
    ['3', '(3) Previous Valuation Report:', 'Issued By I S Associates Pvt. Ltd. On Dated: 20/03/2025'],
    ['', '(4) Previous Valuation Report In Favor of:', 'Mr. Hemanshu Haribhai Patel'],
    ['', '(5) Approved Plan No:', 'Approved by Vadodara Municpal Corporation,\nWard No. 4, Order No.: RAH-SHB/19/20-21,\nDate: 26/11/2020'],
    ['4', 'Name of the Owner/Applicant:', 'Hemanshu Haribhai Patel'],
    ['5', 'Brief description of Property', 'It is a 3bhk Residential Flat at 5th Floor of Tower A of\nBrookfieldz Devbhumi Residency, Flat No. A/503.'],
]

general_table = create_bordered_table(general_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(general_table)
elements.append(Spacer(1, 0.1*inch))

# Location of the property subsection
location_data = [
    ['', 'Location of the property', ''],
    ['', '(a) Plot No/Survey No/Block No', 'R.S. No. 101, 102/2, 106/2 Paiki 2, T.P.S. No. 29, F.P. No. 9+24, At: Manjalpur, Sub District & District: Vadodara.'],
    ['', '(b) Door/Shop No', 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.'],
    ['6', '(c) TP Np/Village\n(d) Ward/Taluka\n(e) Mandal/District\n(f) Date of issue & Validity of layout plan\n(g) Approved map/plan issuing authority\n(h) weather genuineness or authenticity of approved map/plan verified\n(i) Any other comments by valuer on authentic of approved plan', 'Manjalpur\nVadodara\nVadodara\n26-Nov-2020\nVadodara Municipal Corporation\nOriginal Documents Not Produced To the Valuer For Scrutinity. We have verified scan copy of original.\nProperty is constructed as per approved plan'],
    ['7', 'Postal address of the property', 'Flat No. A/503, 5th Floor, Tower A, "Brookfieldz Devbhumi Residency", Nr. Tulsidham Cross Road, Manjalpur, Vadodara - 390020.'],
    ['8', 'City/Town\nResidential Area\nComercial Area\nIndustrial Area', 'Vadodara\nYes\nNo\nNo'],
]

location_table = create_bordered_table(location_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(location_table)
elements.append(Spacer(1, 0.1*inch))

# More sections (9-16)
more_data = [
    ['9', 'Classification Of The Area\n(a) High/Middle/Poor\n(b) Urban/Semi Urban/Rural', 'Middle Class Area\nUrban'],
    ['10', 'Coming under Corporation limits/Village Panchayat/Municipality', 'Vadodara Municipal Corporation'],
    ['11', 'Weather convered under any State/Central Govt.enactments(e.g. Urban land celling actior notified under agenc area/scheduled area/cantonment area', 'As Per General Development Control Regulation.'],
    ['12', 'Boundaries of the property', 'As per Document | As per Actual'],
    ['', 'East', 'Tower B | Tower B'],
    ['', 'West', 'Staircase, Passage | Staircase, Passage'],
    ['', 'North', '36 Mt. Wide Road | 36 Mt. Wide Road'],
    ['', 'South', 'Flat No. 501, Tower B | Flat No. 501, Tower B'],
    ['13', 'Extent of the Site', 'Built Up Area (Sq.mt.): NA | Carpet Area (Sq.mt.): 68.93 | UDSL (Sq.Mt.): 20.49'],
    ['14', 'Latitude,Longitude & Co ordinates of flat', '22°16\'13.5"N 73°11\'41.8"E'],
    ['15', 'Extent of the Site Considered for valuation', 'Carpet Area (Sq.mt.): | 68.93'],
    ['16', 'Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month', 'Vacant'],
]

more_table = create_bordered_table(more_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(more_table)
elements.append(PageBreak())

# II. APARTMENT BUILDING SECTION
elements.append(Paragraph("<b>II. APARTMENT BUILDING</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

apt_data = [
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

apt_table = create_bordered_table(apt_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(apt_table)
elements.append(Spacer(1, 0.1*inch))

# Continue with facility details
facility_data = [
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
]

facility_table = create_bordered_table(facility_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(facility_table)
elements.append(Spacer(1, 0.1*inch))

# III. Flat SECTION
elements.append(Paragraph("<b>III. Flat</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

flat_data = [
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
    ['9', 'What is the plinth area of the Flat ?', 'Built Up Area (Sq.mt.): NA | Carpet Area (Sq.mt.): 68.93'],
    ['10', 'What is the FSI?', '2.7'],
    ['11', 'What is the Carpet Area of the Flat consider for valuation?', '68.93'],
    ['12', 'Is it posh/ I class/Medium / Ordinary', 'Medium'],
    ['13', 'IS It being used for residential or comercial purpose?', 'Used As Residential Flat'],
    ['14', 'is it is owner occupied or Rent out?', 'Vacant'],
    ['15', 'If rented ,what is the monthly rent?', 'Not Applicable'],
]

flat_table = create_bordered_table(flat_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(flat_table)
elements.append(PageBreak())

# IV MARKETIBILITY SECTION
elements.append(Paragraph("<b>IV MARKETIBILITY</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

market_data = [
    ['1', 'How is marketability?', 'Good'],
    ['2', 'What are the factors favouring for an extra potential value?', 'Prposed Fully Developed Scheme'],
    ['3', 'Any negative factors are observed which affect the market value in general?', 'The Unforeseen Events'],
]

market_table = create_bordered_table(market_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(market_table)
elements.append(Spacer(1, 0.1*inch))

# V RATE SECTION
elements.append(Paragraph("<b>V RATE</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

rate_data = [
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

rate_table = create_bordered_table(rate_data, col_widths=[0.4*inch, 2.5*inch, 3*inch])
elements.append(rate_table)
elements.append(Spacer(1, 0.1*inch))

# VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION SECTION
elements.append(Paragraph("<b>VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

depr_data = [
    ['a', 'Depreciated building rate', 'Consider In Valuation'],
    ['', 'Replacement cost of Flat with services', 'Consider In Valuation'],
    ['', 'Age of the building', '0 Years'],
    ['', 'Life of the building estimated', '50 Years'],
    ['', 'Depreciation % assuming the salvage value as 10%', 'N.A.'],
    ['', 'Depreciated ratio of the building', 'N.A.'],
    ['b', 'Total Composite rate arrived for valuation', '₹ 64,580.00', 'Per Sq.mt. Carpet Area'],
    ['', 'Depreciated building rate VI (a)', 'Consider In Valuation'],
    ['', 'Rate of land & Other VI (3) ii', 'Composite Rate Method Of Valuation'],
    ['', 'Total Composite rate', '₹ 64,580.00', 'Per Sq.mt. Carpet Area'],
]

depr_table = create_bordered_table(depr_data, col_widths=[0.4*inch, 2.5*inch, 2*inch, 1.5*inch])
elements.append(depr_table)
elements.append(Spacer(1, 0.1*inch))

# DETAILS OF VALUATION SECTION
elements.append(Paragraph("<b>DETAILS OF VALUATION</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

details_data = [
    ['No.', 'DESCRIPTION', 'Area in Sq. mt.', 'RATE'],
    ['1', 'Present value of the Flat - Carpet Area', '68.93', '₹ 64,580.00'],
    ['', '', '', 'Value Of The Flat', '₹ 44,51,499.40'],
    ['2', 'Fixed Furniture & Fixtures', '', '₹ 15,00,000.00'],
    ['', '', 'Total Value Of The Flat', '₹ 59,51,499.40'],
    ['', '', 'In Words Fifty Nine Lac Fifty One Thousand Four Hundred & Ninety Nine Rupees Only.', ''],
]

details_table = create_bordered_table(details_data, col_widths=[0.4*inch, 2.5*inch, 1.5*inch, 1.5*inch])
elements.append(details_table)
elements.append(PageBreak())

# As a result section
elements.append(Paragraph("<b>As a result of my appraisal and analysis,</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

result_data = [
    ['Fair Market Market Value', '₹ 59,51,499.40'],
    ['Realizeable Value 95% of M.V', '₹ 56,63,924.43'],
    ['Distress value 80% of M.V', '₹ 47,61,199.52'],
    ['Sale Deed Value', 'NA'],
    ['Jantri Value', '₹ 16,12,962.00'],
    ['Insurable Value', '₹ 20,83,024.79'],
    ['Remarks: Rate is given on Carpet Area.', ''],
    ['Copy Of Document Shown To Us', 'Mortgage Deed, Approved Plan, Previous Valuation Report'],
]

result_table = create_bordered_table(result_data, col_widths=[3*inch, 3*inch])
elements.append(result_table)
elements.append(Spacer(1, 0.15*inch))

# STATEMENT OF LIMITING CONDITIONS SECTION
elements.append(Paragraph("<b>STATEMENT OF LIMITING CONDITIONS</b>", header_style))
conditions_text = """
• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.

• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.

• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the (Financial Institution) concerned authority.

• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addressee and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.

• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute only.

• If found any typo error in this report is not counted for any legal action and obligation.
"""
elements.append(Paragraph(conditions_text, normal_style))
elements.append(Spacer(1, 0.1*inch))

# VIII DECLARATION SECTION
elements.append(Paragraph("<b>VIII DECLARATION</b>", header_style))
elements.append(Spacer(1, 0.08*inch))

decl_data = [
    ['', 'I hereby declare that-'],
    ['a', 'I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.'],
    ['b', 'I further declare that I have personally inspected the site and building on 30th October, 2025.'],
    ['c', 'I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.'],
    ['d', 'Future life of property is based on proper maintenance of the property'],
]

decl_table = create_bordered_table(decl_data, col_widths=[0.5*inch, 5.5*inch])
elements.append(decl_table)
elements.append(Spacer(1, 0.15*inch))

# Signature section
sig_data = [
    ['Place: Vadodara', '', 'SIGNATURE OF THE VALUER'],
    ['Date: 31/10/2025', '', 'MAHIM ARCHITECTS'],
]

sig_table = Table(sig_data, colWidths=[2.5*inch, 2*inch, 2*inch])
sig_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
elements.append(sig_table)
elements.append(Spacer(1, 0.1*inch))

# Enclosures
elements.append(Paragraph("<b>Enclsd: 1. Declaration from the valuer</b>", normal_style))
encl_text = "The undersigned has inspected the property detailed in the Valuation report dated-30/10/2025. We are satisfied that the fair and reasonable market value of the property is Rs. 59,51,499.40/- (In Words Fifty Nine Lac Fifty One Thousand Four Hundred Ninety Nine Rupees Only)."
elements.append(Paragraph(encl_text, normal_style))
elements.append(Spacer(1, 0.1*inch))

sig_final = [
    ['', 'SIGNATURE'],
    ['', 'NAME OF BRANCH OFFICIAL WITH SEAL'],
]

sig_final_table = Table(sig_final, colWidths=[3*inch, 2.5*inch])
sig_final_table.setStyle(TableStyle([
    ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 3),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
]))
elements.append(sig_final_table)

# Build PDF
doc.build(elements)
print(f"PDF generated successfully: {pdf_filename}")
