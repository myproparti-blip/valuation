# Rework Feature - System Architecture

## High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    REWORK WORKFLOW                              │
└─────────────────────────────────────────────────────────────────┘

MANAGER/ADMIN SIDE                         USER SIDE
─────────────────────────────────────────────────────────────────

Dashboard (Manager)                        Dashboard (User)
     ↓                                          ↑
  [Approved Record]                      [Rework Record]
     ↓                                          ↑
  [Click Rework Button]                  [See Rework Button]
     ↓                                          ↑
  ReworkModal Opens                       Click to Open Form
     ↓                                          ↑
  Enter Comments                          See Comments Card
     ↓                                          ↑
  [Submit Rework Request]                 [Edit Form Fields]
     ↓                                          ↑
  POST /valuations/:id/request-rework     PUT /valuations/:id
     ↓                                          ↑
  Status: approved → rework              Status: rework → on-progress
     ↓                                          ↑
  [Notify User via Dashboard Refresh] ← ← ← ← ← ← ← ← ← ← ← ← ↑
```

---

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pages:                          Components:                    │
│  ┌─────────────────┐             ┌──────────────────┐          │
│  │ Dashboard       │────────────→ │ ReworkModal      │          │
│  │                 │             │                  │          │
│  │ - Table with    │             │ - Textarea       │          │
│  │   rework button │             │ - Submit/Cancel  │          │
│  │ - State mgmt    │             │ - Loading state  │          │
│  │ - Handlers      │             │ - Validation     │          │
│  └─────────────────┘             └──────────────────┘          │
│         ↓                                                        │
│  ┌─────────────────┐                                            │
│  │ ValuationEdit   │                                            │
│  │ Form            │                                            │
│  │                 │                                            │
│  │ - Show rework   │                                            │
│  │   comments card │                                            │
│  │ - Allow edit    │                                            │
│  │ - Submit form   │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  Services:                       Utils:                        │
│  ┌──────────────────────────┐   ┌───────────┐                 │
│  │ valuationservice.js      │   │ Axios     │                 │
│  │                          │   └───────────┘                 │
│  │ export requestRework()   │                                 │
│  │   - API call             │   Redux:                         │
│  │   - Error handling       │   ┌──────────────┐              │
│  │   - Toast notification  │   │ Loader State │              │
│  └──────────────────────────┘   └──────────────┘              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               ↓
                        API Gateway
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                      SERVER (Express.js)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Routes:                                                         │
│  ┌────────────────────────────────────────┐                    │
│  │ valuationRoutes.js                     │                    │
│  │                                        │                    │
│  │ POST /valuations/:id/request-rework    │                    │
│  │   ↓ authMiddleware                     │                    │
│  │   ↓ isManagerOrAdmin middleware        │                    │
│  │   ↓ requestRework controller           │                    │
│  └────────────────────────────────────────┘                    │
│         ↓                                                        │
│  Controllers:                                                    │
│  ┌────────────────────────────────────────┐                    │
│  │ valuationController.js                 │                    │
│  │                                        │                    │
│  │ export requestRework(req, res)         │                    │
│  │   1. Auth check (manager/admin only)   │                    │
│  │   2. Get valuation                     │                    │
│  │   3. Check status = "approved"         │                    │
│  │   4. Update to "rework"                │                    │
│  │   5. Save rework metadata              │                    │
│  │   6. Return updated record             │                    │
│  └────────────────────────────────────────┘                    │
│         ↓                                                        │
│  Models:                                                         │
│  ┌────────────────────────────────────────┐                    │
│  │ valuationModel.js                      │                    │
│  │                                        │                    │
│  │ New Fields:                            │                    │
│  │ - reworkComments: String               │                    │
│  │ - reworkRequestedBy: String            │                    │
│  │ - reworkRequestedAt: Date              │                    │
│  │ - reworkRequestedByRole: String        │                    │
│  │                                        │                    │
│  │ Status Enum:                           │                    │
│  │ ["pending", "on-progress", "approved", │                    │
│  │  "rejected", "rework"]                 │                    │
│  └────────────────────────────────────────┘                    │
│         ↓                                                        │
│  Database Layer:                                                 │
│  └────────────────────────────────────────┐                    │
│     ValuationModel.findOneAndUpdate()     │                    │
│     File.findOneAndUpdate()               │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Collections:                                                    │
│  ┌────────────────────────────────────────┐                    │
│  │ valuations                             │                    │
│  │ {                                      │                    │
│  │   _id,                                 │                    │
│  │   status: "rework",          ← NEW    │                    │
│  │   reworkComments: "...",     ← NEW    │                    │
│  │   reworkRequestedBy: "...",  ← NEW    │                    │
│  │   reworkRequestedAt: Date,   ← NEW    │                    │
│  │   reworkRequestedByRole: "...", ← NEW│                    │
│  │   ...other fields...                   │                    │
│  │ }                                      │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
│  ┌────────────────────────────────────────┐                    │
│  │ files                                  │                    │
│  │ (synced with valuations)               │                    │
│  └────────────────────────────────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram - Request Rework

```
User Action: Manager clicks Purple "Rework" Button
                              ↓
                    ReworkModal.jsx opens
                    ├─ Enter comments
                    ├─ Click "Submit Rework Request"
                              ↓
                    handleReworkSubmit()
                    ├─ showLoader()
                    ├─ dispatch(showLoader)
                              ↓
          requestRework(id, reworkComments)
          (valuationservice.js)
                              ↓
          API Call:
          POST /valuations/:id/request-rework
          {reworkComments: "..."}
                              ↓
          Route: valuationRoutes.js
          ├─ authMiddleware ✓
          ├─ isManagerOrAdmin ✓
                              ↓
          requestRework(req, res)
          (valuationController.js)
          
          1. Verify role (manager/admin) ✓
          2. Get existing valuation
          3. Check status === "approved" ✓
          4. Update to "rework"
                              ↓
          ValuationModel.findOneAndUpdate({
            status: "rework",
            reworkComments: "...",
            reworkRequestedBy: username,
            reworkRequestedByRole: role,
            reworkRequestedAt: new Date(),
            lastUpdatedBy: username,
            lastUpdatedByRole: role
          })
                              ↓
          File.findOneAndUpdate()
          (keep in sync)
                              ↓
          MongoDB writes changes
                              ↓
          Response (200):
          {
            success: true,
            message: "Rework requested successfully",
            data: {...updated valuation...}
          }
                              ↓
          handleReworkSubmit() continues
          ├─ showSuccess()
          ├─ setReworkModalOpen(false)
          ├─ invalidateCache()
          ├─ fetchFiles() [refresh dashboard]
          ├─ hideLoader()
                              ↓
          Dashboard refreshes
          ├─ Shows rework status (orange "RW")
          ├─ User sees new orange rework button
          ├─ Both have full view of the record
```

---

## Data Flow Diagram - User Edits Rework

```
User Action: User clicks Orange "Rework" Button or opens form
                              ↓
              ValuationEditForm opens with:
              ├─ getValuationById(id)
              ├─ Load form data
              ├─ Show rework comments card
              ├─ Enable editing
                              ↓
              User reads rework comments:
              ├─ "Please update the carpet area"
              ├─ "Provide recent photos"
              ├─ Requested by: manager1
              ├─ At: 2024-01-15 10:30:00
                              ↓
              User edits form:
              ├─ Update carpet area fields
              ├─ Upload new photos
              ├─ Make other changes
                              ↓
              User clicks "Save & Submit"
                              ↓
              onFinish() handler:
              ├─ Validate form
              ├─ Check permission (user + rework status) ✓
              ├─ modalAction = null
                              ↓
              updateValuation(id, formData)
              (valuationservice.js)
                              ↓
              API Call:
              PUT /valuations/:id
              {...all form data...}
                              ↓
              updateValuation handler
              (valuationController.js)
              
              1. Verify user role
              2. Get existing valuation
              3. Check user can edit ✓
              4. If status was "rework" → change to "on-progress"
              5. Set lastUpdatedBy = current user
                              ↓
              ValuationModel.findOneAndUpdate({
                ...formData,
                status: "on-progress",
                lastUpdatedBy: username,
                lastUpdatedAt: new Date()
              })
              Note: reworkComments stay in the record
                              ↓
              File.findOneAndUpdate()
                              ↓
              Response (200):
              {
                success: true,
                message: "Valuation updated successfully...",
                data: {...updated valuation...}
              }
                              ↓
              Form state updates:
              ├─ Status: "rework" → "on-progress"
              ├─ Form disabled (no longer editable)
              ├─ Success notification shown
                              ↓
              User sees:
              ├─ Form now shows "OP" (On Progress) status
              ├─ Submit buttons hidden
              ├─ Review message for manager
              ├─ Back to Dashboard link
```

---

## Status Transitions

```
┌─────────────┐
│   PENDING   │
└──────┬──────┘
       │
       ├──(user/manager edit)──→ ON-PROGRESS
       │
       └──(manager approve)──→ APPROVED ←───────┐
                                   ↓             │
                          (mgr request rework)   │
                                   ↓             │
                                REWORK          │
                                   ↓             │
                          (user edits & submits)│
                                   ↓             │
                            ON-PROGRESS ────────┘
                                   ↓
                          (manager approve)
                                   ↓
                                APPROVED

Alternative Paths:
PENDING → REJECTED ↔ ON-PROGRESS → APPROVED
         (mgr rejects)  (resubmit)    ↑
                                      │
                          (rework flow)
```

---

## Permission Matrix

```
┌───────────────┬──────────────┬──────────────┬──────────────┐
│ Action        │ Admin        │ Manager      │ User         │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ Request       │ ✅ YES       │ ✅ YES       │ ❌ NO        │
│ Rework        │ (all)        │ (assigned)   │              │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ See Rework    │ ✅ YES       │ ✅ YES       │ ✅ YES       │
│ Button        │              │              │ (if rework)  │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ Edit Form     │ ✅ YES       │ ✅ YES       │ ✅ YES       │
│ in Rework     │ (no limits)  │ (rework+)    │ (rework only)│
│ Status        │              │              │              │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ Modify Client │ ✅ YES       │ ❌ NO        │ ❌ NO        │
│ Info Fields   │              │              │              │
├───────────────┼──────────────┼──────────────┼──────────────┤
│ Approve/      │ ✅ YES       │ ✅ YES       │ ❌ NO        │
│ Reject        │              │              │              │
└───────────────┴──────────────┴──────────────┴──────────────┘
```

---

## API Contract

### Request Rework Endpoint

**Request:**
```
POST /valuations/:id/request-rework
Authorization: Bearer <token>
Content-Type: application/json

{
  "reworkComments": "Optional comments for the user"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Rework requested successfully",
  "data": {
    "_id": "...",
    "uniqueId": "VAL-001",
    "status": "rework",
    "reworkComments": "Optional comments for the user",
    "reworkRequestedBy": "manager1",
    "reworkRequestedByRole": "manager1",
    "reworkRequestedAt": "2024-01-15T10:30:00.000Z",
    "lastUpdatedBy": "manager1",
    "lastUpdatedByRole": "manager1",
    "lastUpdatedAt": "2024-01-15T10:30:00.000Z",
    ...other fields...
  }
}
```

**Error Responses:**

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Forbidden - Only manager or admin can request rework"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Valuation not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Cannot request rework for pending status. Rework is only allowed for approved items."
}
```

---

## Database Schema Changes

### Before (Simplified)
```javascript
{
  _id: ObjectId,
  uniqueId: String,
  status: String, // enum: ["pending", "on-progress", "approved", "rejected"]
  managerFeedback: String,
  ...otherFields
}
```

### After (New Rework Fields)
```javascript
{
  _id: ObjectId,
  uniqueId: String,
  status: String, // enum: ["pending", "on-progress", "approved", "rejected", "rework"] ← UPDATED
  managerFeedback: String,
  
  // NEW REWORK FIELDS
  reworkComments: String,           // ← NEW
  reworkRequestedBy: String,        // ← NEW
  reworkRequestedByRole: String,    // ← NEW
  reworkRequestedAt: Date,          // ← NEW
  
  ...otherFields
}
```

**Migration Note:** Existing documents don't need migration as new fields are optional.

---

## Error Handling Strategy

```
Client Error → Notification Service → User
    ↓
    ├─ Network Error → "Connection failed"
    ├─ 403 → "Only managers can request rework"
    ├─ 404 → "Form not found"
    ├─ 400 → "Cannot request rework for [status] status"
    └─ 500 → "Server error, try again"

Success → Toast Notification + Dashboard Refresh
    ↓
    ├─ Show: "Rework requested successfully!"
    ├─ Clear: Cache and refetch data
    └─ Update: UI state automatically
```

---

## Testing Strategy

### Unit Tests
- `requestRework()` controller function
- Permission checks for each role
- Status validation logic

### Integration Tests
- Full request-response cycle
- Database updates verification
- File record sync verification

### E2E Tests
- Manager requests rework
- User sees update in dashboard
- User edits and resubmits
- Manager approves/rejects
