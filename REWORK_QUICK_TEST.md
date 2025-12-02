# Rework Feature - Quick Test Guide

## Prerequisites
- Have a valuation in "approved" status
- Two accounts: one manager/admin and one user

---

## Test Scenario 1: Manager Requests Rework

### Steps:
1. **Login as Manager/Admin**
   - Navigate to Dashboard
   - Look for a record with status "App" (Approved)

2. **Request Rework**
   - In Actions column, find purple "Rework" button (RW icon)
   - Click it
   - ReworkModal appears
   - Enter comments (optional): "Please update the carpet area and provide new photos"
   - Click "Submit Rework Request"

3. **Verify**
   - ✅ Modal closes
   - ✅ Dashboard refreshes
   - ✅ Status changes to "RW" (Rework) - orange badge
   - ✅ Success notification appears

---

## Test Scenario 2: User Views Rework Comments

### Steps:
1. **Login as User**
   - Navigate to Dashboard
   - Find the record that was just sent for rework (status "RW")

2. **View Rework Details**
   - Click orange "Rework" button or click row to open form
   - Page loads with ValuationEditForm
   - At top, see orange card with:
     - "Rework Comments" heading
     - The comment text you entered
     - "Requested by: [manager_name]"
     - Timestamp of when it was requested

3. **Verify**
   - ✅ Rework comments clearly visible
   - ✅ Form is editable (all fields enabled except restricted ones)
   - ✅ Can make changes based on comments

---

## Test Scenario 3: User Resubmits After Rework

### Steps:
1. **As User in ValuationEditForm**
   - Make changes based on rework comments
   - Update required fields
   - Scroll down

2. **Submit Form**
   - Click "Save & Submit" button
   - Form validates
   - Confirmation dialog appears

3. **Verify**
   - ✅ Status changes to "OP" (On Progress)
   - ✅ Rework comments remain visible (for audit trail)
   - ✅ Can no longer be in "rework" edit mode
   - ✅ Form sent back for manager review

---

## Test Scenario 4: Manager Reviews Resubmitted Form

### Steps:
1. **Login as Manager/Admin**
   - Dashboard shows the record with status "OP" (On Progress)
   - Click "Review Form" button (eye icon) to open form

2. **Review Changes**
   - See the updated form data
   - See previous rework history
   - Click "Approve" or "Reject"

3. **Verify**
   - ✅ Can review all changes
   - ✅ Can approve (status → "App")
   - ✅ Can reject (status → "Rej")

---

## Edge Cases to Test

### 1. Rework Without Comments
- Manager submits rework with empty comments field
- ✅ Should work fine
- ✅ Orange card still shows in form but notes "No comments provided"

### 2. Cannot Rework Non-Approved Items
- Try clicking rework on a "Pending" record
- ✅ Button should NOT appear (purple button only for approved)
- ✅ If somehow accessed, API returns 400 error

### 3. User Cannot Request Rework
- Login as user
- ✅ Purple "Rework" button never appears
- ✅ Only orange "Rework" button (for accepting rework) shows when needed

### 4. Multiple Rework Rounds
- Request rework, user edits, resubmit
- Manager requests rework again
- User edits again, resubmit
- ✅ All history is preserved
- ✅ Latest rework comments always visible

---

## Status Code Messages

### Success (200)
```
"Rework requested successfully"
```

### Errors:
- **403** (Forbidden): "Forbidden - Only manager or admin can request rework"
- **404** (Not Found): "Valuation form not found"
- **400** (Bad Request): "Cannot request rework for [status] status. Rework is only allowed for approved items."

---

## Visual Indicators

| Element | When Shown | Color | Icon |
|---------|-----------|-------|------|
| Status Badge | Always | Orange | - |
| Purple Rework Button | Manager/Admin + Approved status | Purple | ↻ |
| Orange Rework Button | User + Rework status | Orange | ↻ |
| Rework Comments Card | User viewing rework status | Orange-50 | ↻ |

---

## API Endpoints Used

### Request Rework
```
POST /valuations/:id/request-rework
Content-Type: application/json

{
  "reworkComments": "Please update carpet area with new measurements"
}

Response (200):
{
  "success": true,
  "message": "Rework requested successfully",
  "data": { ...updated valuation... }
}
```

### Get Valuation (includes rework fields)
```
GET /valuations/:id

Response includes:
- status: "rework"
- reworkComments: "..."
- reworkRequestedBy: "manager1"
- reworkRequestedAt: "2024-01-15T10:30:00Z"
- reworkRequestedByRole: "manager1"
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Rework button not showing for approved records | Ensure you're logged in as manager/admin |
| Cannot edit form in rework status | User must be logged in with correct account |
| Comments not showing | Ensure status = "rework" AND comments were entered |
| Changes not saving | Validate all required fields are filled |
| Status not updating | Refresh dashboard (F5) or use refresh button |

---

## Data Persistence

All rework information is stored in MongoDB:
- Valuation collection: All fields preserved
- File collection: Synced automatically
- Audit trail: Who requested, when, and what was said
