
export function generatePage5Declaration(data) {
  const {
    fairMarketValue = 'NA',
    realizeableValue = 'NA',
    distressValue = 'NA',
    saleDeadValue = 'NA',
    jantriValue = 'NA',
    insurableValue = 'NA',
    documentsCopies = 'NA',
    inspectionDateDecl = 'NA',
    place = 'NA',
    reportDate = 'NA',
    valuationCompany = 'NA',
    totalFlatValueWords = 'NA',
    signerName = 'NA',
  } = data;

  return `
<!-- ===== PAGE 5: APPRAISAL & DECLARATION (Based on 5.png) ===== -->
<div class="page">
  <div class="content">
    <!-- Appraisal Results -->
    <div style="font-weight: bold; font-size: 9pt; margin-bottom: 6px; margin-top: 0;">As a result of my appraisal and analysis,</div>
    
    <table style="margin-bottom: 6px;">
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
        <td>${saleDeadValue}</td>
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
    
    <!-- Copy Of Document -->
    <table style="margin-bottom: 6px;">
      <tr>
        <td style="width: 50%;"><strong>Copy Of Document Shown To Us</strong></td>
        <td style="width: 50%;">${documentsCopies}</td>
      </tr>
    </table>
    
    <!-- STATEMENT OF LIMITING CONDITIONS -->
    <div class="limiting-header blue-text">STATEMENT OF LIMITING CONDITIONS</div>
    
    <div class="bullet-list">
      <div class="bullet-item">• If this property is offered for collateral security the concerned financial institution is requested to obtained latest title report from advocate of said property.</div>
      <div class="bullet-item">• No responsibility is to be assumed for matter legal in nature nor is opinion of title rendered by this report, good title is assumed.</div>
      <div class="bullet-item">• Scope of this report is only to access present market value of the property for specific purpose, date & place. It therefore varies with purpose, period, and location, identification of rightful owner of the property, genuineness of the title deed, encumbrance if any on the property etc. be examined by the Financial Institution(s) concerned authority.</div>
      <div class="bullet-item">• Possession of the any copy of this report does not carry with it the right of publication, nor any be used for any purpose by any one, except the addresses and the property owner, without the previous written consent of the appraiser, and in any event, only may be revealed in its entirety.</div>
      <div class="bullet-item">• Credibility of buyer and seller is fully responsible of financial institute. Identification of buyer & seller is from financial institute code.</div>
      <div class="bullet-item">• If found any type error in this report is not counted for any legal action and obligation.</div>
    </div>
    
    <div class="spacer"></div>
    
    <!-- VIII DECLARATION -->
    <div class="declaration-header">VIII DECLARATION</div>
    
    <table class="declaration-table">
      <tr>
        <td colspan="2">I hereby declare that:</td>
      </tr>
      <tr>
        <td style="width: 5%; font-weight: bold;">a</td>
        <td>I declare that I am not associated with the builder or with any of his associate companies or with the borrower directly or indirectly in the past or in the present and this report has been prepared by me with highest professional integrity.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">b</td>
        <td>I further declare that I have personally inspected the site and building on ${inspectionDateDecl}.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">c</td>
        <td>I further declare that all the above particulars and information given in this report are true to the best of my knowledge and belief.</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">d</td>
        <td>Future life of property is based on proper maintenance of the property.</td>
      </tr>
    </table>
    
    <div class="spacer-large"></div>
    
    <!-- Footer with Valuer Info -->
    <div style="margin-top: 20px; display: flex; justify-content: space-between;">
      <div style="font-size: 8.5pt;">
        <div>Place: ${place}</div>
        <div>Date: ${reportDate}</div>
      </div>
      <div style="font-size: 8.5pt; text-align: right;">
        <div><strong>SIGNATURE OF THE VALUER</strong></div>
        <div style="margin-bottom: 20px;"></div>
        <div><strong>${signerName}</strong></div>
      </div>
    </div>
    
    <div class="spacer-large"></div>
    
    <!-- Enclosure -->
    <div style="font-size: 8.5pt; line-height: 1.4;">
      <strong>Enclsd: 1. Declaration from the valuer</strong><br/>
      The undersigned has inspected the property detailed in the Valuation report dated ${reportDate}. We are satisfied that the fair and reasonable market value of the property is ₹ ${fairMarketValue}/- (In Words ${totalFlatValueWords}).
    </div>
    
    <div class="spacer-large"></div>
    
    <!-- Signature -->
    <div style="display: flex; justify-content: flex-end; font-size: 9pt; text-align: center; margin-top: 15px;">
      <div style="width: 280px;">
        <div style="margin-bottom: 30px;"></div>
        <strong>SIGNATURE</strong><br/>
        
        <strong>NAME OF BRANCH OFFICIAL WITH SEAL</strong>
      </div>
    </div>
  </div>
</div>
  `;
}