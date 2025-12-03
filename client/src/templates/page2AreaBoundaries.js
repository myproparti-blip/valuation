export function generatePage2AreaBoundaries(data) {
  const {
    areaClass = 'NA',
    areaType = 'NA',
    classificationArea = 'NA',
    eastBoundaryDoc = 'NA',
    eastBoundaryActual = 'NA',
    westBoundaryDoc = 'NA',
    westBoundaryActual = 'NA',
    northBoundaryDoc = 'NA',
    northBoundaryActual = 'NA',
    southBoundaryDoc = 'NA',
    southBoundaryActual = 'NA',
    builtUpArea = 'NA',
    carpetArea = 'NA',
    udsl = 'NA',
    latitude = 'NA',
    longitude = 'NA',
    occupancy = 'NA',
    commencementYear = 'NA',
    numberOfFloors = 'NA',
    structureType = 'NA',
    apartmentNature = 'NA',
    apartmentLocation = 'NA',
    surveyBlockNo = 'NA',
    tpFpNo = 'NA',
    villageMunicipalityCorp = 'NA',
    doorStreetPinCode = 'NA',
    localityDescription = 'NA',
    qualityOfConstruction = 'NA',
    appearanceOfBuilding = 'NA',
    maintenanceOfBuilding = 'NA',
  } = data;

  return `
<!-- ===== PAGE 2: AREA & BOUNDARIES (Based on 2.png) ===== -->
<div class="page">
  <div class="content">
    <!-- Continue from previous page -->
    <table style="margin-top: 0; width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 4%;">9</td>
        <td colspan="2"><strong>Classification Of The Area</strong></td>
      </tr>
      <tr>
        <td></td>
        <td style="width: 40%;"><strong>(a) High/Middle/Poor</strong></td>
        <td style="width: 56%;">${areaClass}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>(b) Urban/Semi Urban/Rural</strong></td>
        <td>${areaType}</td>
      </tr>
      <tr>
        <td>10</td>
        <td><strong>Coming under Corporation limits/Village Panchayat/Municipality</strong></td>
        <td>${villageMunicipalityCorp}</td>
      </tr>
      <tr>
        <td>11</td>
        <td><strong>Weather convered under any State/Central Govt.enactments(e.g. Urban land ceiling act)or notified under agenc area/scheduled area/cantonment area</strong></td>
        <td>As Per General Development Control Regulation.</td>
      </tr>
      <tr>
        <td>12</td>
        <td colspan="2"><strong>Boundaries of the property</strong></td>
      </tr>
      <tr>
        <td></td>
        <td style="width: 20%;"><strong>As per Document</strong></td>
        <td style="width: 20%;"><strong>As per Actual</strong></td>
      </tr>
      <tr>
        <td style="width: 4%;">East</td>
        <td style="width: 40%;">${eastBoundaryDoc}</td>
        <td style="width: 56%;">${eastBoundaryActual}</td>
      </tr>
      <tr>
        <td style="width: 4%;">West</td>
        <td style="width: 40%;">${westBoundaryDoc}</td>
        <td style="width: 56%;">${westBoundaryActual}</td>
      </tr>
      <tr>
        <td style="width: 4%;">North</td>
        <td style="width: 40%;">${northBoundaryDoc}</td>
        <td style="width: 56%;">${northBoundaryActual}</td>
      </tr>
      <tr>
        <td style="width: 4%;">South</td>
        <td style="width: 40%;">${southBoundaryDoc}</td>
        <td style="width: 56%;">${southBoundaryActual}</td>
      </tr>
      <tr>
        <td>13</td>
        <td colspan="2"><strong>Extent of the Site</strong></td>
      </tr>
      <tr>
        <td></td>
        <td style="width: 40%;">Built Up Area (Sq.mt.):</td>
        <td style="width: 56%;">${builtUpArea}</td>
      </tr>
      <tr>
        <td></td>
        <td>Carpet Area (Sq.mt.):</td>
        <td>${carpetArea}</td>
      </tr>
      <tr>
        <td></td>
        <td>UDSL (Sq.Mt.):</td>
        <td>${udsl}</td>
      </tr>
      <tr>
        <td>14</td>
        <td><strong>Latitude,Longitude & Co ordinates of flat</strong></td>
        <td>${latitude} ${longitude}</td>
      </tr>
      <tr>
        <td>15</td>
        <td colspan="2"><strong>Extent of the Site Considered for valuation</strong></td>
      </tr>
      <tr>
        <td></td>
        <td style="width: 40%;">Carpet Area (Sq.mt.):</td>
        <td style="width: 56%;">${carpetArea}</td>
      </tr>
      <tr>
        <td>16</td>
        <td><strong>Weather Occupied by owner/tenant? If occupied by tenant,science how long? Rent received per month</strong></td>
        <td>${occupancy}</td>
      </tr>
      <tr>
        <td colspan="3" class="section-header" style="background-color: #d3d3d3; border: 1px solid #000; padding: 5px 6px;">II.APARTMENT BUILDING</td>
      </tr>
      <tr>
        <td style="width: 4%;">1</td>
        <td style="width: 40%;"><strong>Nature of Apartment</strong></td>
        <td style="width: 56%;">${apartmentNature}</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Location</strong></td>
        <td>${apartmentLocation}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Survey/Block No.</strong></td>
        <td>${surveyBlockNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>TP, FP No.</strong></td>
        <td>${tpFpNo}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Village/Municipality/Corporation</strong></td>
        <td>${villageMunicipalityCorp}</td>
      </tr>
      <tr>
        <td></td>
        <td><strong>Door No,Street or Road (Pin Code)</strong></td>
        <td>${doorStreetPinCode}</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Description of the locality Residential/Commercial/Mixed</strong></td>
        <td>${localityDescription}</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Commencement Year of construction</strong></td>
        <td>${commencementYear}</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Number of Floor</strong></td>
        <td>${numberOfFloors}</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Type Of Structure</strong></td>
        <td>${structureType}</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Number of Dwelling units in the building</strong></td>
        <td>As Per Plan</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Quality of Construction</strong></td>
        <td>${qualityOfConstruction}</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Appearance of the Building</strong></td>
        <td>${appearanceOfBuilding}</td>
      </tr>
      
      </table>
  </div>
</div>
  `;
}