/**
 * PAGE 4: MARKETABILITY, RATE & VALUATION
 * Contains marketability analysis, market rate, and valuation details
 * Automatic calculations for all monetary values
 */
export function generatePage4MarketabilityRate(data) {
  const {
    marketability = 'NA',
    positiveFactors = 'NA',
    negativeFactors = 'NA',
    marketRange = 'NA',
    buildingServices = 'NA',
    landOthers = 'NA',
    jantriRate = 'NA',
    jantriRatePerSqmt = 23400,
    adoptedRate = 'NA',
    carpetArea = 'NA',
    builtUpArea = 'NA',
    flatValue: providedFlatValue = 'NA',
    furnitureFixtures: providedFurnitureFixtures = 'NA',
    totalFlatValue: providedTotalFlatValue = 'NA',
    totalFlatValueWords = 'NA',
    constructionYear = 'NA',
  } = data;

  // Helper function to parse currency string to number
  const parseAmount = (value) => {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const str = String(value).replace(/[₹,]/g, '').trim();
    return parseFloat(str) || 0;
  };

  // Helper function to format number to currency with commas
  const formatCurrency = (value) => {
    if (!value || value === 'NA') return 'NA';
    const num = parseAmount(value);
    if (num === 0) return 'NA';
    return '₹ ' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  // Helper function to convert number to words (Indian format)
  const numberToWords = (num) => {
    if (num === 0 || !num) return 'NA';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convert = (n) => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lac' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };

    return (convert(Math.floor(num)) + ' Rupees Only').trim();
  };

  // Calculate age of building based on construction year
  const currentYear = new Date().getFullYear();
  let ageOfBuilding = 'NA';
  let estimatedLife = 'NA';
  
  if (constructionYear !== 'NA' && constructionYear) {
   const year = parseInt(String(constructionYear).trim());
   if (!isNaN(year) && year > 0) {
     ageOfBuilding = currentYear - year;
     estimatedLife = 60 - ageOfBuilding;
   }
  }

  // Calculate carpet area as number
  const carpetAreaNum = parseAmount(carpetArea);

  // Calculate built-up area as number
  const builtUpAreaNum = parseAmount(builtUpArea);

  // Calculate adopted rate as number
  const adoptedRateNum = parseAmount(adoptedRate);

  // Calculate flat value: carpet area * adopted rate
  const calculatedFlatValue = carpetAreaNum > 0 && adoptedRateNum > 0 
    ? carpetAreaNum * adoptedRateNum 
    : parseAmount(providedFlatValue);

  // Parse furniture fixtures
  const furnitureFixturesNum = parseAmount(providedFurnitureFixtures);

  // Calculate total flat value: flat value + furniture fixtures
  const calculatedTotalFlatValue = calculatedFlatValue + furnitureFixturesNum;

  // Calculate jantri value: built-up area * jantri rate per sqmt
  const calculatedJantriValue = builtUpAreaNum > 0 && jantriRatePerSqmt > 0 
    ? builtUpAreaNum * jantriRatePerSqmt 
    : parseAmount(providedTotalFlatValue);

  // Format calculated values
  const flatValueFormatted = formatCurrency(calculatedFlatValue);
  const furnitureFixturesFormatted = formatCurrency(furnitureFixturesNum);
  const totalFlatValueFormatted = formatCurrency(calculatedTotalFlatValue);
  const totalFlatValueWordsCalculated = numberToWords(calculatedTotalFlatValue);
  const jantriValueFormatted = formatCurrency(calculatedJantriValue);
  const jantriRateFormatted = jantriRate !== 'NA' ? jantriRate : `Rs. ${jantriRatePerSqmt.toLocaleString('en-IN')}/- per sq. mt.`;

  // Final values to use in template (use calculated if available, otherwise use provided)
  const finalFlatValue = flatValueFormatted !== 'NA' ? flatValueFormatted : providedFlatValue;
  const finalFurnitureFixtures = furnitureFixturesFormatted !== 'NA' ? furnitureFixturesFormatted : providedFurnitureFixtures;
  const finalTotalFlatValue = totalFlatValueFormatted !== 'NA' ? totalFlatValueFormatted : providedTotalFlatValue;
  const finalTotalFlatValueWords = totalFlatValueWordsCalculated !== 'NA' ? totalFlatValueWordsCalculated : totalFlatValueWords;
  const finalJantriValue = jantriValueFormatted !== 'NA' ? jantriValueFormatted : providedTotalFlatValue;
  const finalAdoptedRate = adoptedRate !== 'NA' ? adoptedRate : 'NA';

  return `
<!-- ===== PAGE 4: FLAT DETAILS & VALUATION (Based on 4.png) ===== -->
<div class="page">
  <div class="content">
    <!-- Continue from previous page -->
    <table style="margin-top: 0; width: 100%; border-collapse: collapse; table-layout: fixed;">
      <colgroup>
        <col style="width: 4%;">
        <col style="width: 40%;">
        <col style="width: 56%;">
      </colgroup>
      <tr>
        <td colspan="3" class="section-header" style="background-color: #d3d3d3; border: 1px solid #000; padding: 5px 6px;">IV MARKETIBILITY</td>
      </tr>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>How is marketability?</strong></td>
        <td>${marketability}</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>What are the factors favouring for an extra potential value?</strong></td>
        <td>${positiveFactors}</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td><strong>Any negative factors are observed which affect the market value in general?</strong></td>
        <td>${negativeFactors}</td>
      </tr>
      <tr>
        <td colspan="3" class="section-header" style="background-color: #d3d3d3; border: 1px solid #000; padding: 5px 6px;">V RATE</td>
      </tr>
      <tr>
        <td style="text-align: center;">1</td>
        <td><strong>After analysing the comparable sale instance, what is the composite rate for a similar flat with same specification in its adjoining locality?</strong></td>
        <td>The estimate of Fair Market Value is based on situation, location, size, shape, road width, Neighborhood, accessibility, frontage, environmental aspects, demand and supply. The property rate is considered after information received by surrounding property holders. Also necessary information has been collected from nearby occupant. Our market inquiry among nearby occupant has revealed that similar sized property in the vicinity of the market property is available in a range from ${marketRange} based on Carpet area.</td>
      </tr>
      <tr>
        <td style="text-align: center;">2</td>
        <td><strong>Assuming it is a new construction, what is the adopted basic composite rate of the flat under valuation after comparing with the specifications and other factors with the flat under comparison?</strong></td>
        <td>I have adopted market approach method for valuation of the property. Local inquiry as well as market Survey</td>
      </tr>
      <tr>
        <td style="text-align: center;">3</td>
        <td colspan="2"><strong>Break up for the rate</strong></td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td>(i) Building + Services</td>
        <td>${buildingServices}</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td>(ii) Land+Others</td>
        <td>${landOthers}</td>
      </tr>
      <tr>
        <td style="text-align: center;">4</td>
        <td><strong>Guideline rate obtained from the Registrar's office   Jantri rate for composite rate for the year 2023.</strong></td>
        <td>
          
          <table style="width: 100%; margin-top: 2px; border-collapse: collapse; table-layout: fixed;">
            <tr>
              <td style="width: 50%; padding: 3px 4px; border: none; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"><strong>Per Sq. Mt.</strong></td>
              <td style="width: 50%; padding: 3px 4px; border: none; text-align: right; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">₹ ${jantriRatePerSqmt.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 3px 4px; border: none; font-size: 8pt; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"><strong>Built-Up Area (${builtUpArea} Sq.Mt)</strong></td>
              <td style="width: 50%; padding: 3px 4px; border: none; text-align: right; font-size: 8pt; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">${finalJantriValue}</td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 3px 4px; border: none; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"><strong>Total Jantri Value</strong></td>
              <td style="width: 50%; padding: 3px 4px; border: none; text-align: right; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;"><strong>${finalJantriValue}</strong></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td colspan="3" class="section-header" style="background-color: #d3d3d3; border: 1px solid #000; padding: 5px 6px;">VI COMPOSITE RATE ADOPTED AFTER DEPRECIATION</td>
      </tr>
      <tr>
        <td style="text-align: center;">a</td>
        <td><strong>Depreciated building rate</strong></td>
        <td>Consider in valuation</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Replacement cost of Flat with services</strong></td>
        <td>Consider in valuation</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Construction Year</strong></td>
        <td>${constructionYear}</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Age of the building</strong></td>
        <td>${ageOfBuilding === 'NA' ? '0 Year' : ageOfBuilding + ' Year'}</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Life of the building estimated</strong></td>
        <td>${estimatedLife === 'NA' ? '50 Years' : estimatedLife + ' Years'}</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Depreciation % assuming the salvage value as 10%</strong></td>
        <td>N.A.</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Depreciated ratio of the building</strong></td>
        <td>N.A.</td>
      </tr>
      <tr>
        <td style="text-align: center;">b</td>
        <td><strong>Total Composite rate arrived for valuation</strong></td>
        <td>
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 70%; padding: 0; border: none;">₹ ${finalAdoptedRate}</td>
              <td style="width: 30%; padding: 0; border: none; text-align: right;"><strong>Per Sq.mt. Carpet Area</strong></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Depreciated building rate VI (a)</strong></td>
        <td>Consider in valuation</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Rate of land & Other VI (3) ii</strong></td>
        <td>Composite Rate Method Of Valuation</td>
      </tr>
      <tr>
        <td style="text-align: center;"></td>
        <td><strong>Total Composite rate</strong></td>
        <td>
          <table style="width: 100%; border: none;">
            <tr>
              <td style="width: 70%; padding: 0; border: none;">₹ ${finalAdoptedRate}</td>
              <td style="width: 30%; padding: 0; border: none; text-align: right;"><strong>Per Sq.mt. Carpet Area</strong></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- DETAILS OF VALUATION - Separate table for better width control -->
    <div style="margin-top: 8px;">
      <div class="section-header" style="margin-top: 0; margin-bottom: 0;">DETAILS OF VALUATION</div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 0; table-layout: fixed; border: 1px solid #000;">
        <colgroup>
          <col style="width: 6%;">
          <col style="width: 35%;">
          <col style="width: 18%;">
          <col style="width: 18%;">
          <col style="width: 23%;">
        </colgroup>
        <tr>
          <th style="background-color: #d3d3d3; font-size: 8pt; padding: 4px 5px; border: 1px solid #000; text-align: center; font-weight: bold;">No.</th>
          <th style="background-color: #d3d3d3; font-size: 8pt; padding: 4px 5px; border: 1px solid #000; text-align: center; font-weight: bold;">DESCRIPTION</th>
          <th style="background-color: #d3d3d3; font-size: 8pt; padding: 4px 5px; border: 1px solid #000; text-align: center; font-weight: bold;">Area in Sq. mt.</th>
          <th style="background-color: #d3d3d3; font-size: 8pt; padding: 4px 5px; border: 1px solid #000; text-align: center; font-weight: bold;">RATE</th>
          <th style="background-color: #d3d3d3; font-size: 8pt; padding: 4px 5px; border: 1px solid #000; text-align: center; font-weight: bold;">VALUE</th>
        </tr>
        <tr>
          <td style="text-align: center; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">1</td>
          <td style="font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">Present value of the Flat - Built-Up Area</td>
          <td style="text-align: center; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">${builtUpArea}</td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">₹ ${finalAdoptedRate}</td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">${finalFlatValue}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000;"></td>
          <td style="border: 1px solid #000;"></td>
          <td style="border: 1px solid #000;"></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"><strong>Value Of The Flat</strong></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"><strong>${finalFlatValue}</strong></td>
        </tr>
        <tr>
          <td style="text-align: center; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">2</td>
          <td style="font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">Fixed Furniture & Fixtures</td>
          <td style="text-align: center; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;">${finalFurnitureFixtures}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #000;"></td>
          <td style="border: 1px solid #000;"></td>
          <td style="border: 1px solid #000;"></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"><strong>Total Value Of The Flat</strong></td>
          <td style="text-align: right; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"><strong>${finalTotalFlatValue}</strong></td>
        </tr>
        <tr>
          <td colspan="5" style="text-align: center; font-size: 8pt; padding: 4px 5px; border: 1px solid #000;"><strong>In Words ${finalTotalFlatValueWords}.</strong></td>
        </tr>
      </table>
    </div>
  </div>
</div>
  `;
}
