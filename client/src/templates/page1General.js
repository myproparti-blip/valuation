
export function generatePage1General(data) {
  const {
    bankName = 'NA',
    branchName = 'NA',
    fileNo = 'NA',
    valuationDate = 'NA',
    propertyType = 'NA',
    inspectionDate = 'NA',
    ownerName = 'NA',
    propertyAddress = 'NA',
    plotSurveyNo = 'NA',
    city = 'NA',
    municipality = 'NA',
    flatNo = 'NA',
    flatSpecification = 'NA',
    apartmentNature = 'NA',
    apartmentLocation = 'NA',
    surveyBlockNo = 'NA',
    tpFpNo = 'NA',
    doorStreetPinCode = 'NA',
    localityDescription = 'NA',
    flatFloor = 'NA',
    numberOfFloors = 'NA',
    structureType = 'NA',
    qualityOfConstruction = 'NA',
    mortgageDeed = 'NA',
    previousValuationIssuedBy = 'NA',
    previousValuationDate = 'NA',
    approvedPlanNo = 'NA',
    planIssueDate = 'NA',
    planValidity = 'NA',
    authenticityVerified = 'NA',
    valuerCommentOnAuthenticity = 'NA',
    residentialArea = 'NA',
    commercialArea = 'NA',
    industrialArea = 'NA',
  } = data;

  return `
<!-- ===== PAGE 1: GENERAL SECTION (Based on 1.png) ===== -->
<div class="page">
  <div class="content">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="header-line"><strong>To:</strong></div>
        <div class="header-line">${bankName}, Vadodara</div>
        <div class="header-line"><strong>${branchName}</strong></div>
      </div>
      <div class="header-right">
        <div class="header-line"><strong>File No:</strong> ${fileNo}</div>
        <div class="header-line"><strong>Date:</strong> ${valuationDate}</div>
      </div>
    </div>
    
    <div class="spacer-small"></div>
    
    <!-- Title -->
    <div class="title-box">
      VALUATION REPORT|IN RESPECT OF ${propertyType}
    </div>
    
    <!-- GENERAL Section -->
    <div class="section-header">GENERAL</div>
    
    <table style="border-spacing: 0 8px;">
      <tr>
        <td style="width: 5%; text-align: center; font-weight: bold;">1</td>
        <td style="width: 40%;">purpose for which valuation is made</td>
        <td style="width: 55%;">Financial Assistance for loan from ${bankName}</td>
      </tr>
      <tr style="height: 20px;">
        <td style="width: 5%; text-align: center; font-weight: bold;">2</td>
        <td style="width: 40%;"><strong>(a) Date of inspection</strong></td>
        <td style="width: 55%;">${inspectionDate}</td>
      </tr>
      <tr style="height: 20px;">
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>(b) Date on which valuation is made</strong></td>
        <td style="width: 55%;">${valuationDate}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td colspan="2"><strong>List of documents produced for pursual</strong></td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>(1) Mortgage Deed :</strong></td>
        <td style="width: 55%;">${mortgageDeed}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>(2) Mortgage Deed Between :</strong></td>
        <td style="width: 55%;">${ownerName} & ${bankName}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center; font-weight: bold;">3</td>
        <td style="width: 40%;"><strong>(3) Previous Valuation Report:</strong></td>
        <td style="width: 55%;">Issued By ${previousValuationIssuedBy} On Dated: ${previousValuationDate}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>(4) Previous Valuation Report In Favor of:</strong></td>
        <td style="width: 55%;">${ownerName}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>(5) Approved Plan No:</strong></td>
        <td style="width: 55%;">${approvedPlanNo} - Approved by ${municipality}</td>
      </tr>
      <tr style="height: 20px;">
        <td style="width: 5%; text-align: center; font-weight: bold;">4</td>
        <td style="width: 40%;"><strong>Name of the Owner/Applicant:</strong></td>
        <td style="width: 55%;">${ownerName}</td>
      </tr>
      <tr style="height: 20px;">
        <td style="width: 5%; text-align: center; font-weight: bold;">5</td>
        <td style="width: 40%;"><strong>Brief description of Property</strong></td>
        <td style="width: 55%;">${flatSpecification}</td>
      </tr>
      <tr>
        <td colspan="3"><strong>Location of the property</strong></td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(a)</td>
        <td style="width: 40%;"><strong>Plot No/Survey No/Block No</strong></td>
        <td style="width: 55%;">${plotSurveyNo}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(b)</td>
        <td style="width: 40%;"><strong>Door/Shop No</strong></td>
        <td style="width: 55%;">${propertyAddress}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(c)</td>
        <td style="width: 40%;"><strong>TP No/Village</strong></td>
        <td style="width: 55%;">${tpFpNo}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(d)</td>
        <td style="width: 40%;"><strong>Ward/Taluka</strong></td>
        <td style="width: 55%;">${city}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(e)</td>
        <td style="width: 40%;"><strong>Mandal/District</strong></td>
        <td style="width: 55%;">${city}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(f)</td>
        <td style="width: 40%;"><strong>Date of issue & Validity of layout plan</strong></td>
        <td style="width: 55%;">${planIssueDate ? 'Issue: ' + planIssueDate : ''} ${planValidity }</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(g)</td>
        <td style="width: 40%;"><strong>Approved map/plan issuing authority</strong></td>
        <td style="width: 55%;">${municipality}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(h)</td>
        <td style="width: 40%;"><strong>weather genuineness or authenticity of approved map/plan verified</strong></td>
        <td style="width: 55%;">${authenticityVerified}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center;">(i)</td>
        <td style="width: 40%;"><strong>Any other comments by valuer on authentic of approved plan</strong></td>
        <td style="width: 55%;">${valuerCommentOnAuthenticity}</td>
      </tr>
      <tr>
        <td style="width: 3%;">7</td>
        <td style="width: 35%;"><strong>Postal address of the property</strong></td>
        <td style="width: 62%;">${propertyAddress}</td>
      </tr>
      <tr>
        <td style="width: 5%; text-align: center; font-weight: bold;">8</td>
        <td style="width: 40%;"><strong>City/Town</strong></td>
        <td style="width: 55%;">${city}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>Residential Area</strong></td>
        <td style="width: 55%;">${residentialArea}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>Commercial Area</strong></td>
        <td style="width: 55%;">${commercialArea}</td>
      </tr>
      <tr>
        <td style="width: 5%;"></td>
        <td style="width: 40%;"><strong>Industrial Area</strong></td>
        <td style="width: 55%;">${industrialArea}</td>
      </tr>
    </table>
  </div>
</div>
  `;
}