# Edit Valuation Form - Tab Structure Reference

## Current Tab Layout (4 Tabs)

### Tab 1: Client Info
**URL/State Value**: `activeTab === "client"`
**Content**:
- Client Name input
- Mobile Number input
- Address input
- Client Information Section

### Tab 2: Property & Payment
**URL/State Value**: `activeTab === "property"`
**Content**:
- Property Basic Details (Elevation)
- **Payment Section** (within this tab):
  - Payment Status radio buttons (Yes/No)
  - Collected By field (conditional)

### Tab 3: Documents & Notes
**URL/State Value**: `activeTab === "documents"`
**Content**:
- Location Images & Coordinates section:
  - Location Images Upload
  - Latitude/Longitude inputs
  - Directions (North, East, South, West)
- Property Images section
- **Additional Notes Section** (within this tab):
  - Notes textarea field

### Tab 4: Valuation
**URL/State Value**: `activeTab === "valuation"`
**Content**:
- Main Valuation Content with 5 Sub-tabs:
  - **Documents**: PDF details, document references, valuation dates
  - **Property**: Property description, location, area details
  - **Facilities & Flat**: Apartment details, facilities, flat specifications, house tax
  - **Market Analysis**: Market rates, depreciation, composite rates
  - **Results & Signature**: Valuation results, additional details, signature info

## Sub-Tab Reference (Valuation Tab Only)

### Valuation Sub-Tabs
**State Variable**: `activeValuationSubTab`

1. **Documents** - `activeValuationSubTab === "documents"`
2. **Property** - `activeValuationSubTab === "property"`
3. **Facilities & Flat** - `activeValuationSubTab === "facilities"`
4. **Market Analysis** - `activeValuationSubTab === "analysis"`
5. **Results & Signature** - `activeValuationSubTab === "results"`

## Code References

### State Declarations
```javascript
const [activeTab, setActiveTab] = useState("client");
const [activeValuationSubTab, setActiveValuationSubTab] = useState("documents");
```

### Tab Navigation
- All 4 main tabs use button elements with `onClick={() => setActiveTab("tab_name")}`
- Buttons show orange gradient when active
- Buttons show white with gray border when inactive

### Conditional Rendering Pattern
```javascript
{activeTab === "client" && (
  <>
    {/* Client Info content */}
  </>
)}

{activeTab === "property" && (
  <>
    {/* Property & Payment content */}
  </>
)}

{activeTab === "documents" && (
  <>
    {/* Documents & Notes content */}
  </>
)}

{activeTab === "valuation" && (
  <>
    {/* Valuation content with sub-tabs */}
  </>
)}
```

## Form Data Structure
All form data remains in the same `formData` state object. Tab switching does not reset any form values.

## Navigation Notes
- Default tab on load: "client"
- All tabs can be accessed without restrictions
- Form validation works across all tabs
- Save functionality applies to all tabs
- No data is lost when switching tabs

## Files Affected
- `client/src/pages/valuationeditform.jsx` - Main component with tab structure
