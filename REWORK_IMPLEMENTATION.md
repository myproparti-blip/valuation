# Rework Functionality Implementation

## Overview
Complete role-based Rework workflow has been implemented allowing managers/admins to request rework on approved valuations, and users to edit based on rework comments.

---

## Backend Implementation

### 1. **Database Model Updates** (`server/models/valuationModel.js`)
- Added `status` enum: `["pending", "on-progress", "approved", "rejected", "rework"]`
- Added new fields:
  - `reworkComments: String` - Comments from manager/admin
  - `reworkRequestedBy: String` - Username of who requested rework
  - `reworkRequestedAt: Date` - Timestamp of rework request
  - `reworkRequestedByRole: String` - Role of person requesting rework

### 2. **Controller Function** (`server/controllers/valuationController.js`)
- **New Function**: `requestRework(req, res)`
  - **Authorization**: Only managers and admin can call this
  - **Constraint**: Only works if status is "approved"
  - **Action**: Changes status to "rework" and saves comments
  - **Updates**: Both ValuationModel and File model
  - **Returns**: Updated valuation document

### 3. **API Route** (`server/routes/valuationRoutes.js`)
- **New Endpoint**: `POST /valuations/:id/request-rework`
- **Middleware**: `isManagerOrAdmin` verification
- **Parameters**: 
  - `id` (URL param): Unique valuation ID
  - `reworkComments` (body): Optional rework comments

---

## Frontend Implementation

### 1. **Service Function** (`client/src/services/valuationservice.js`)
- **New Function**: `requestRework(id, reworkComments)`
- **Error Handling**: Specific error messages for 403, 404, 400 status codes
- **Returns**: Updated valuation data or throws error

### 2. **ReworkModal Component** (`client/src/components/ReworkModal.jsx`)
- **UI**: Dialog-based modal
- **Fields**:
  - Optional rework comments textarea
  - Character counter
  - Submit and Cancel buttons
- **Features**:
  - Clean, professional styling
  - Loading state indication
  - Responsive design

### 3. **Dashboard Updates** (`client/src/pages/dashboard.jsx`)
- **Imports**: Added `requestRework` service and `ReworkModal` component
- **State Management**:
  - `reworkModalOpen`: Controls modal visibility
  - `reworkingRecordId`: Tracks which record is being reworked
  - `reworkLoading`: Loading state for rework submission
- **New Handler**: `handleReworkRequest(record)` - Opens modal for selected record
- **New Handler**: `handleReworkSubmit(reworkComments)` - Submits rework request
- **Status Display**: Added "rework" status badge (Orange with "RW" label)
- **Action Buttons**:
  - **For Managers/Admin**: Purple "Rework" button appears only when status = "approved"
  - **For Users**: Orange "Rework" button appears only when status = "rework"
- **Modal Integration**: ReworkModal component rendered at bottom of dashboard

### 4. **ValuationEditForm Updates** (`client/src/pages/valuationeditform.jsx`)
- **Permission Updates**:
  - Users can now edit when status is "rework"
  - `canEdit` permission includes "rework" status
  - Users allowed to submit after making rework changes
- **Status Display**:
  - Added "rework" to status colors (orange)
  - Added "rework" to status icons (FaRedo)
- **Rework Comments Section**:
  - Shows only when status = "rework" AND comments exist
  - Displays:
    - Manager/admin comments in white box with orange border
    - Who requested the rework
    - When it was requested
  - Styled with orange accent theme

---

## Complete Workflow

### Step 1: Manager/Admin Triggers Rework
1. Go to Dashboard
2. Find approved record
3. Click purple "Rework" button in Actions column
4. ReworkModal opens
5. Enter optional comments
6. Click "Submit Rework Request"
7. Status changes to "Rework"

### Step 2: User Sees Rework Request
1. Dashboard automatically refreshes
2. User sees orange "Rework" button for that record
3. Rework comments are visible to user

### Step 3: User Opens Form to Edit
1. Click orange "Rework" button or click the record row
2. ValuationEditForm opens
3. Rework comments displayed at top (orange card)
4. User can see who requested and when
5. Form is fully editable (except restricted fields for regular users)
6. User updates valuation details based on comments

### Step 4: User Resubmits
1. User clicks "Save & Submit" button
2. Form updates with status "on-progress"
3. Manager/Admin can review and approve/reject again

---

## Role-Based Access Control

### Admin
- ✅ Can request rework on approved items
- ✅ Can see all rework requests
- ✅ Can edit forms in rework status
- ✅ Full unrestricted editing

### Manager1 & Manager2
- ✅ Can request rework on approved items (only for assigned users)
- ✅ Can see rework requests for assigned users
- ✅ Can edit forms in rework status
- ✅ Cannot modify client information fields

### User
- ❌ Cannot request rework
- ✅ Can see rework button when status = "rework"
- ✅ Can edit all details (non-client-info) when status = "rework"
- ✅ Can resubmit form after rework

---

## Key Features

1. **Optional Comments**: Rework comments are optional but recommended
2. **Timestamp Tracking**: Records when rework was requested and by whom
3. **Immediate UI Update**: Dashboard refreshes automatically after rework request
4. **Clear Separation**: 
   - Managers see purple button for "request rework"
   - Users see orange button for "accept rework"
5. **Permission Enforcement**: Users cannot update forms unless explicitly in rework status
6. **Data Integrity**: Status only changes to "rework" from "approved" status

---

## Status Flow

```
pending 
  ↓
on-progress 
  ↓
approved → (REWORK REQUEST) → rework → on-progress → approved
  ↓
rejected → on-progress → approved
```

---

## Files Modified

1. ✅ `server/models/valuationModel.js` - Added rework fields to schema
2. ✅ `server/controllers/valuationController.js` - Added requestRework function
3. ✅ `server/routes/valuationRoutes.js` - Added rework endpoint
4. ✅ `client/src/services/valuationservice.js` - Added requestRework service
5. ✅ `client/src/pages/dashboard.jsx` - Added rework UI and handlers
6. ✅ `client/src/pages/valuationeditform.jsx` - Updated permissions and display
7. ✅ `client/src/components/ReworkModal.jsx` - NEW: Rework modal component

---

## Testing Checklist

- [ ] Manager can see rework button for approved records
- [ ] Manager can submit rework with and without comments
- [ ] Status changes to "rework" after submission
- [ ] User sees orange rework button in dashboard
- [ ] User can open form and see rework comments
- [ ] User can edit form (except restricted fields)
- [ ] User can submit form again
- [ ] Status changes to "on-progress" after user submit
- [ ] Manager can approve/reject again
- [ ] Rework comments persist across reloads
- [ ] Regular user cannot request rework
- [ ] Rework button doesn't show for non-approved records

---

## No Breaking Changes
- All existing functionality remains unchanged
- Backward compatible with existing records
- New status enum option doesn't affect existing workflows
