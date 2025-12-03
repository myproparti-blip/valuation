export function generatePage3FlatDetails(data) {
  const {
    flatFloor = 'NA',
    flatNo = 'NA',
    flatSpecification = 'NA',
    roofType = 'NA',
    flooringType = 'NA',
    doorType = 'NA',
    windowType = 'NA',
    fittingsType = 'NA',
    finishingType = 'NA',
    builtUpArea = 'NA',
    carpetArea = 'NA',
    occupancy = 'NA',
    assessmentNo = 'NA',
    taxPaidBy = 'NA',
    taxAmount = 'NA',
    connectionNo = 'NA',
    meterName = 'NA',
    buildingMaintenance = 'NA',
    flatMaintenance = 'NA',
    saleDeedName = 'NA',
    undividedLandArea = 'NA',
    fsi = 'NA',
    flatClass = 'NA',
    usage = 'NA',
    rent = 'NA',
    facilities = {},
  } = data?.pdfDetails || data;

  const getYesNo = (value) => {
    if (value === true || value === 'true') return 'Yes';
    if (value === false || value === 'false' || !value) return 'No';
    return value || 'NA';
  };

  return `
<!-- ===== PAGE 3: APARTMENT & FLAT DETAILS (Based on 3.png) ===== -->
<div class="page">
  <div class="content">
    <!-- Continue from previous page -->
    <table style="margin-top: 0;">
      <tr>
         <td>10</td>
         <td><strong>Maintenance of building</strong></td>
         <td>${buildingMaintenance}</td>
       </tr>
      <tr>
        <td>11</td>
        <td colspan="2"><strong>Facilities Available</strong></td>
      </tr>
      <tr>
        <td></td>
        <td>Lift</td>
        <td>${getYesNo(facilities?.lift)}</td>
      </tr>
      <tr>
        <td></td>
        <td>Protected Water Supply</td>
        <td>${getYesNo(facilities?.waterSupply)}</td>
      </tr>
      <tr>
        <td></td>
        <td>Under ground sewerage</td>
        <td>${getYesNo(facilities?.sewerage)}</td>
      </tr>
      <tr>
        <td></td>
        <td>car parking-Open/Covered</td>
        <td>${getYesNo(facilities?.parking)}</td>
      </tr>
      <tr>
        <td></td>
        <td>is compound wall Existing?</td>
        <td>${getYesNo(facilities?.compoundWall)}</td>
      </tr>
      <tr>
        <td></td>
        <td>Is pavement laid around the building?</td>
        <td>${getYesNo(facilities?.pavement)}</td>
      </tr>
      <tr>
        <td colspan="3" class="section-header" style="background-color: #d3d3d3; border: 1px solid #000; padding: 5px 6px;">III. FLAT</td>
      </tr>
      <tr>
        <td style="width: 3%;">1</td>
        <td style="width: 30%;"><strong>The floor on which the Flat is situated</strong></td>
        <td style="width: 67%;">${flatFloor}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Door No. Of the Flat</strong></td>
        <td>${flatNo}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Specification of the Flat</strong></td>
        <td>${flatSpecification}</td>
      </tr>
      <tr>
        <td></td>
        <td>Roof</td>
        <td>${roofType}</td>
      </tr>
      <tr>
        <td></td>
        <td>Flooring</td>
        <td>${flooringType}</td>
      </tr>
      <tr>
        <td></td>
        <td>Doors</td>
        <td>${doorType}</td>
      </tr>
      <tr>
        <td></td>
        <td>Windows</td>
        <td>${windowType}</td>
      </tr>
      <tr>
        <td></td>
        <td>Fittings</td>
        <td>${fittingsType}</td>
      </tr>
      <tr>
        <td></td>
        <td>Finishing</td>
        <td>${finishingType}</td>
      </tr>
      <tr>
        <td>4</td>
        <td colspan="2"><strong>House Tax</strong></td>
      </tr>
      <tr>
         <td></td>
         <td>Assessment no</td>
         <td>${assessmentNo}</td>
       </tr>
       <tr>
         <td></td>
         <td>Tax paid in the name of</td>
         <td>${taxPaidBy}</td>
       </tr>
       <tr>
         <td></td>
         <td>Tax amount</td>
         <td>${taxAmount}</td>
       </tr>
       <tr>
         <td>5</td>
         <td>Electricity service connection no.</td>
         <td>${connectionNo}</td>
       </tr>
       <tr>
         <td></td>
         <td>Meter card is in name of</td>
         <td>${meterName}</td>
       </tr>
      <tr>
         <td>6</td>
         <td><strong>How is the maintenance of the Flat?</strong></td>
         <td>${flatMaintenance}</td>
       </tr>
       <tr>
         <td>7</td>
         <td><strong>Sale Deed in the name of</strong></td>
         <td>${saleDeedName}</td>
       </tr>
       <tr>
         <td>8</td>
         <td><strong>What is the undivided area of land as per sale deed? (sq.MT.)</strong></td>
         <td>${undividedLandArea}</td>
       </tr>
      <tr>
        <td>9</td>
        <td><strong>What is the plinth area of the Flat ?</strong></td>
        <td>
          <table class="nested-table">
            <tr>
              <td style="border-bottom: 0.5px solid #000;">Built Up Area (Sq.mt.):</td>
              <td style="border-bottom: 0.5px solid #000;">${builtUpArea}</td>
            </tr>
            <tr>
              <td>Carpet Area (Sq.mt.):</td>
              <td>${carpetArea}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>What is the FSI?</strong></td>
        <td>${fsi}</td>
      </tr>
       <tr>
        <td>11</td>
        <td><strong>What is the Carpet Area of the Flat consider for valuation?</strong></td>
        <td>${carpetArea}</td>
      </tr>
      <tr>
        <td>12</td>
        <td><strong>Is it posh/ I class/Medium / Ordinary</strong></td>
        <td>${flatClass}</td>
      </tr>
      <tr>
        <td>13</td>
        <td><strong>IS it being used for residential or comercial purpose?</strong></td>
        <td>${usage}</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>is it is owner occupied or Rent out?</strong></td>
        <td>${occupancy}</td>
      </tr>
      <tr>
        <td>15</td>
        <td><strong>if rented ,what is the monthly rent?</strong></td>
        <td>${rent}</td>
      </tr>
    </table>
  </div>
</div>
  `;
}