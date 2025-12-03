export const PDF_STYLES = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      font-family: 'Calibri', 'Arial', sans-serif;
      color: #000000;
      background: white;
      padding: 0;
      margin: 0;
      font-size: 9pt;
      line-height: 1.15;
    }
    
    @page {
      size: A4;
      margin: 15mm 17mm;
      padding: 0;
    }
    
    .page {
      width: 100%;
      page-break-after: always;
      padding: 0;
      margin: 0;
      margin-top: 20px;
      background: white;
      height: 100%;
      min-height: 297mm;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .content {
      width: calc(100% - 30mm);
      padding: 0;
      margin: 0 15mm;
      box-sizing: border-box;
    }
    
    /* Header Section */
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 8.5pt;
    }
    
    .header-left {
      flex: 1;
    }
    
    .header-right {
      text-align: right;
      width: auto;
    }
    
    .header-line {
      margin: 1px 0;
      font-size: 8.5pt;
      line-height: 1.15;
    }
    
    /* Title Box */
    .title-box {
      border: 1px solid #000;
      background-color: #d3d3d3;
      padding: 5px 6px;
      text-align: center;
      font-weight: bold;
      font-size: 9pt;
      margin-bottom: 6px;
      margin-top: 4px;
    }
    
    /* Section Headers */
    .section-header {
      border: 1px solid #000;
      background-color: #d3d3d3;
      padding: 5px 6px;
      font-weight: bold;
      font-size: 9pt;
      margin: 0;
      margin-top: 6px;
      margin-bottom: 12px;
    }
    
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
      font-size: 8.5pt;
      border: 1px solid #000;
    }
    
    td, th {
      border: 1px solid #000;
      padding: 5px 6px;
      text-align: left;
      vertical-align: middle;
      font-weight: normal;
      line-height: 1.3;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    
    th {
      background-color: #d3d3d3;
      font-weight: bold;
      text-align: center;
    }
    
    .center {
      text-align: center;
    }
    
    .right {
      text-align: right;
    }
    
    .bold {
      font-weight: bold;
    }
    
    /* Spacing Helpers */
    .spacer-small {
      height: 2px;
    }
    
    .spacer {
      height: 4px;
    }
    
    .spacer-large {
      height: 6px;
    }
    
    /* Limiting Conditions */
    .limiting-header {
      font-weight: bold;
      color: #0000FF;
      font-size: 9pt;
      margin: 4px 0 2px 0;
    }
    
    .bullet-list {
      margin-left: 10px;
      font-size: 8pt;
    }
    
    .bullet-item {
      margin-bottom: 2px;
      line-height: 1.25;
    }
    
    /* Declaration */
    .declaration-header {
      font-weight: bold;
      border: 1px solid #000;
      background-color: #d3d3d3;
      padding: 5px 6px;
      font-size: 9pt;
      margin: 6px 0 0 0;
    }
    
    .declaration-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0;
      border: 1px solid #000;
    }
    
    .declaration-table td {
      border: 1px solid #000;
      padding: 4px 5px;
      vertical-align: top;
      font-size: 8.5pt;
    }
    
    /* Footer */
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      font-size: 8.5pt;
      padding-top: 4px;
      position: absolute;
      bottom: 20px;
      width: 100%;
    }
    
    .footer-left {
      flex: 1;
    }
    
    .footer-right {
      text-align: right;
      width: 200px;
    }
    
    .footer-line {
      margin: 1px 0;
      font-size: 8.5pt;
      line-height: 1.15;
    }
    
    /* Nested table styling */
    .nested-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      padding: 0;
    }
    
    .nested-table td {
      border: none;
      padding: 2px 3px;
      font-size: 8.5pt;
      line-height: 1.15;
    }
    
    .blue-text {
      color: #0000FF;
    }
    
    /* Page Layout Control */
    .table-row {
      height: 25px;
    }
    
    .table-cell {
      vertical-align: middle;
    }
    
    /* Make tables take full height */
    .full-height-table {
      height: calc(100% - 80px);
    }
    
    /* Fix for page breaks */
    .page-break {
      page-break-before: always;
    }
  `;