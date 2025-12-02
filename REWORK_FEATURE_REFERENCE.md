# Rework Feature - Quick Reference Card

## 🎯 Feature Summary
Complete role-based workflow for requesting and handling valuation rework

---

## 🔐 Access Control

| Role | Can Request Rework | Can See Rework Button | Can Edit in Rework |
|------|:------------------:|:--------------------:|:-----------------:|
| **Admin** | ✅ | ✅ (purple) | ✅ |
| **Manager1** | ✅ | ✅ (purple) | ✅ |
| **Manager2** | ✅ | ✅ (purple) | ✅ |
| **User** | ❌ | ✅ (orange) | ✅ |

---

## 📊 Status Flow

```
Approved
   ↓
   [Manager: Click Purple Rework Button]
   ↓
Rework
   ↓
   [User: Click Orange Rework Button & Edit Form]
   ↓
On-Progress (after user submits)
   ↓
   [Manager: Review and Approve/Reject]
   ↓
Approved (final)
```

---

## 🎨 Visual Indicators

| Element | Where | Color | Icon | Shows When |
|---------|-------|-------|------|-----------|
| **Rework Status Badge** | Status line | Orange | - | status = "rework" |
| **Purple Rework Button** | Dashboard Actions | Purple | ↻ | Manager + Approved |
| **Orange Rework Button** | Dashboard Actions | Orange | ↻ | User + Rework |
| **Comments Card** | Form Top | Orange-50 | ↻ | User viewing rework |

---

## 🔄 Main Components

### ReworkModal
- **Location:** `client/src/components/ReworkModal.jsx`
- **Purpose:** Collect rework comments from manager/admin
- **Props:** `isOpen, onClose, onSubmit, isLoading`
- **Features:** Textarea, character counter, buttons

### Request Handler
- **Location:** `client/src/pages/dashboard.jsx`
- **Function:** `handleReworkRequest(record)`
- **Action:** Opens modal for selected record

### Submit Handler
- **Location:** `client/src/pages/dashboard.jsx`
- **Function:** `handleReworkSubmit(reworkComments)`
- **Action:** Calls API to request rework

### Comments Display
- **Location:** `client/src/pages/valuationeditform.jsx`
- **Shows:** When status = "rework" AND comments exist
- **Displays:** Comments, requester, timestamp

---

## 🔌 API Endpoints

### Request Rework
```
POST /valuations/{id}/request-rework
Authorization: Bearer {token}
Content-Type: application/json

{
  "reworkComments": "Optional comments here"
}

Status 200: ✅ Success
Status 400: ❌ Invalid status (not approved)
Status 403: ❌ Not authorized (not manager/admin)
Status 404: ❌ Not found (invalid ID)
```

---

## 📝 Request/Response Examples

### Manager Requests Rework
```javascript
// Request
{
  "reworkComments": "Please update carpet area with latest measurements"
}

// Success Response
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "rework",
    "reworkComments": "Please update carpet area with latest measurements",
    "reworkRequestedBy": "manager1",
    "reworkRequestedByRole": "manager1",
    "reworkRequestedAt": "2024-01-15T10:30:00Z",
    ...
  }
}
```

### User Edits and Resubmits
```javascript
// PUT /valuations/{id}
{
  "carpetArea": "2500",  // ← Updated
  "propertyImages": [...],  // ← New images
  ...
  // Status automatically changes to "on-progress"
}
```

---

## ⚙️ Database Schema

### New Fields
```javascript
{
  // Status
  status: String  // enum: [..., "rework"]
  
  // Rework Information
  reworkComments: String           // What to fix
  reworkRequestedBy: String        // Who requested
  reworkRequestedByRole: String    // Their role
  reworkRequestedAt: Date          // When requested
}
```

### Example Document
```javascript
{
  _id: ObjectId("..."),
  uniqueId: "VAL-001",
  status: "rework",
  reworkComments: "Update the carpet area measurements",
  reworkRequestedBy: "manager1",
  reworkRequestedByRole: "manager1",
  reworkRequestedAt: ISODate("2024-01-15T10:30:00Z"),
  clientName: "John Doe",
  carpetArea: "2400",  // ← User will update this
  ...
}
```

---

## 🚀 Key Features

1. **Optional Comments** - Managers can provide guidance or leave blank
2. **Audit Trail** - Tracks who requested and when
3. **Clear UI** - Visual distinction between request and accept actions
4. **Permission Enforcement** - Users can only edit when in rework status
5. **Status Tracking** - Clear status indicators in dashboard
6. **Persistence** - Comments stored permanently for reference

---

## 🔍 Validation Rules

| Scenario | Rule | Result |
|----------|------|--------|
| Manager requests rework on pending record | ❌ Invalid | Error: "Cannot rework non-approved" |
| User tries to request rework | ❌ Forbidden | Error: "Only managers can request" |
| User edits pending record (no rework) | ❌ Forbidden | Error: "Cannot edit this status" |
| User edits rework status | ✅ Allowed | Status → on-progress on submit |
| Manager requests rework on approved | ✅ Allowed | Status → rework |

---

## 🧪 Testing Quick Commands

### Test 1: Request Rework
```bash
# Manager requests rework
curl -X POST http://localhost:5000/valuations/VAL-001/request-rework \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"reworkComments":"Update carpet area"}'

# Expected: 200 OK with updated valuation
```

### Test 2: View Rework
```bash
# Get valuation with rework data
curl http://localhost:5000/valuations/VAL-001 \
  -H "Authorization: Bearer {token}"

# Expected: status = "rework", reworkComments visible
```

### Test 3: Edit and Submit
```bash
# User edits and submits
curl -X PUT http://localhost:5000/valuations/VAL-001 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"carpetArea":"2500", ...}'

# Expected: 200 OK, status = "on-progress"
```

---

## 📱 UI Navigation

### Manager View
```
Dashboard
├─ Table Row with Approved Record
│  └─ Actions Column
│     └─ Purple ↻ Button (Rework)
│        └─ Click → ReworkModal Opens
│           ├─ Enter Comments (optional)
│           ├─ Click Submit
│           └─ Status → Rework ✅
```

### User View
```
Dashboard
├─ Refreshes automatically
├─ Table Row with Rework Status
│  └─ Actions Column
│     └─ Orange ↻ Button (Accept Rework)
│        └─ Click → Open ValuationEditForm
│           ├─ See Rework Comments Card
│           ├─ Edit Form Fields
│           ├─ Click Save & Submit
│           └─ Status → On-Progress ✅
```

---

## 🔄 Complete Workflow

```
1️⃣  Manager Opens Dashboard
    ├─ Finds Approved Record
    └─ Clicks Purple Rework Button

2️⃣  ReworkModal Opens
    ├─ Enters Comments: "Update carpet area and photos"
    ├─ Clicks "Submit Rework Request"
    └─ API: POST /valuations/{id}/request-rework

3️⃣  Server Updates Record
    ├─ Validates: Manager/Admin + Status = Approved
    ├─ Updates: status → "rework"
    ├─ Saves: Comments + Metadata
    └─ Returns: Updated valuation

4️⃣  Dashboard Refreshes
    ├─ Status Changed: Approved → Rework (Orange)
    ├─ New Button: Orange Rework button for user
    └─ Success: "Rework requested successfully!"

5️⃣  User Receives Notification
    ├─ Logs in to Dashboard
    ├─ Sees Orange "Rework" Button
    └─ Clicks to Open Form

6️⃣  ValuationEditForm Opens
    ├─ Shows: Orange Comments Card
    ├─ Displays: "Update carpet area and photos"
    ├─ Shows: "Requested by manager1"
    └─ Shows: Timestamp

7️⃣  User Edits Form
    ├─ Updates: Carpet area = 2500 sqft
    ├─ Updates: Photos (new images)
    ├─ Makes: Other adjustments
    └─ Clicks: "Save & Submit"

8️⃣  Form Submits
    ├─ Validates: All required fields
    ├─ Updates: All form data
    ├─ Changes: Status → On-Progress
    └─ Success: Form saved

9️⃣  Manager Reviews Again
    ├─ Sees: Updated form (status = On-Progress)
    ├─ Reviews: Changes made by user
    ├─ Can: Approve or Reject
    └─ Approves: Status → Approved ✅

🔟 Workflow Complete
    └─ Record is Approved with User's Updates
```

---

## ⚠️ Common Mistakes

| Mistake | Impact | Fix |
|---------|--------|-----|
| Requesting rework on non-approved | ❌ Error | Only approved records allowed |
| User trying to request rework | ❌ Error | Only managers can request |
| Submitting with no changes | ⚠️ Works | But manager will see no changes |
| Entering huge comment | ⚠️ Works | Character counter shows length |
| Refreshing dashboard | ✅ Works | Auto-refreshes after submission |

---

## 🆘 Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| Purple button not showing | Role + Status | Must be manager + approved |
| Orange button not showing | Role + Status | Must be user + rework status |
| Comments not showing | Status + Data | Status must be "rework" + comments exist |
| Cannot submit form | Permission | User can only edit in "rework" status |
| API error 400 | Status | Can only rework "approved" records |
| API error 403 | Role | Must be manager/admin |

---

## 📚 Related Documentation

- **REWORK_IMPLEMENTATION.md** - Full technical docs
- **REWORK_ARCHITECTURE.md** - System design & flows
- **REWORK_QUICK_TEST.md** - Testing procedures
- **REWORK_CHANGES_SUMMARY.md** - Code changes overview

---

## ✅ Checklist for Implementation

- [x] Backend model updated
- [x] Backend controller function added
- [x] API route configured
- [x] Frontend service created
- [x] ReworkModal component built
- [x] Dashboard integrated
- [x] Form permissions updated
- [x] Comments display added
- [x] Status colors updated
- [x] Error handling complete
- [x] Documentation written

---

**Status:** 🎉 READY FOR PRODUCTION

