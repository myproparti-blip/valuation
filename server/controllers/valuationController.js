import ValuationModel from "../models/valuationModel.js";
import File from "../models/fileModel.js";

// CREATE VALUATION (users, managers, and admin can submit forms)
export const createValuation = async (req, res) => {
    try {
        const requestUser = req.user;

        // Authorization: Only users, managers, and admin can create submissions
        if (requestUser.role !== "user" && requestUser.role !== "manager1" && requestUser.role !== "manager2" && requestUser.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden - Only users, managers, and admin can submit forms" });
        }

        const data = {
            ...req.body,
            username: requestUser.username,
            status: "pending",
            lastUpdatedBy: requestUser.username,
            lastUpdatedByRole: requestUser.role
        };

        // Create valuation
        const newVal = await ValuationModel.create(data);

        // Also create file record using upsert to avoid duplicate key error
        const fileData = {
            ...req.body,
            username: requestUser.username,
            status: "pending",
            lastUpdatedBy: requestUser.username,
            lastUpdatedByRole: requestUser.role
        };

        try {
            await File.updateOne(
                { uniqueId: fileData.uniqueId },
                { $set: fileData },
                { upsert: true }
            );
        } catch (fileErr) {
            console.error("File creation error (non-blocking):", fileErr.message);
            // Don't fail the main request if file creation fails
        }

        res.status(201).json({
            success: true,
            message: "Valuation form submitted successfully",
            data: newVal,
        });
    } catch (err) {
        console.error("Error in createValuation:", err.message);
        res.status(500).json({ success: false, message: "Error creating valuation", error: err.message });
    }
};

// GET VALUATION BY ID (with authorization)
export const getValuationById = async (req, res) => {
    try {
        const { id } = req.params;
        const requestUser = req.user;

        const form = await ValuationModel.findOne({ uniqueId: id });

        if (!form) {
            return res.status(404).json({ success: false, message: "Not found" });
        }

        // USERS: Can only see their own valuations
        if (requestUser.role === "user" && form.username !== requestUser.username) {
            return res.status(403).json({ success: false, message: "Forbidden - You can only view your own records" });
        }

        // MANAGER & ADMIN: Can see user valuations with role-based filtering + their own records
        if (requestUser.role !== "admin") {
            // Check if it's manager's own record - allow viewing their own profile
            const isOwnRecord = form.username === requestUser.username;

            // Non-admin managers must check if it's a user record OR their own record
            if (!form.username.toLowerCase().startsWith("user") && !isOwnRecord) {
                return res.status(403).json({ success: false, message: "Forbidden - You can only view user records" });
            }

            // Only apply user restrictions if viewing a user record (not own record)
            if (!isOwnRecord) {
                // manager1: Can only see user1, user2, user3, user4, user5
                if (requestUser.role === "manager1") {
                    const allowedUsers = ["user1", "user2", "user3", "user4", "user5"];
                    if (!allowedUsers.includes(form.username.toLowerCase())) {
                        return res.status(403).json({ success: false, message: "Forbidden - You can only view user1 to user5 records" });
                    }
                }

                // manager2: Can only see user6 and onwards (not user1-user5)
                if (requestUser.role === "manager2") {
                    const restrictedUsers = ["user1", "user2", "user3", "user4", "user5"];
                    if (restrictedUsers.includes(form.username.toLowerCase())) {
                        return res.status(403).json({ success: false, message: "Forbidden - You can only view user6 and other user records" });
                    }
                }
            }
        }

        res.status(200).json({ success: true, data: form });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching valuation" });
    }
};

// VALIDATION FUNCTION FOR UPDATE
const validateUpdateData = (data) => {
    const errors = [];

    // === CLIENT INFORMATION ===
    if (!data.clientName || typeof data.clientName !== 'string' || !data.clientName.trim()) {
        errors.push("Client Name is required");
    }

    if (!data.mobileNumber || !data.mobileNumber.toString().trim()) {
        errors.push("Mobile Number is required");
    } else {
        // Mobile number validation - exactly 10 digits
        const mobileDigits = data.mobileNumber.toString().replace(/\D/g, '');
        if (mobileDigits.length !== 10) {
            errors.push("Mobile Number must be 10 digits");
        }
    }

    if (!data.address || typeof data.address !== 'string' || !data.address.trim()) {
        errors.push("Address is required");
    }

    // === BANK & CITY ===
    if (!data.bankName || typeof data.bankName !== 'string' || !data.bankName.trim()) {
        errors.push("Bank Name is required");
    }

    if (!data.city || typeof data.city !== 'string' || !data.city.trim()) {
        errors.push("City is required");
    }

    // === DSA ===
    if (!data.dsa || typeof data.dsa !== 'string' || !data.dsa.trim()) {
        errors.push("DSA (Sales Agent) is required");
    }

    // === ENGINEER ===
    if (!data.engineerName || typeof data.engineerName !== 'string' || !data.engineerName.trim()) {
        errors.push("Engineer Name is required");
    }

    // === NOTES ===
    // Notes are optional - no validation needed

    // === PAYMENT INFORMATION ===
    if (data.payment && !["yes", "no"].includes(data.payment)) {
        errors.push("Payment status must be 'yes' or 'no'");
    }

    if (data.payment === "yes" && (!data.collectedBy || !data.collectedBy.trim())) {
        errors.push("Collected By name is required when payment is collected");
    }

    // === GPS COORDINATES ===
    if (data.coordinates) {
        // Only validate if provided and has values
        if (data.coordinates.latitude) {
            const lat = parseFloat(data.coordinates.latitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push("Latitude must be a valid number between -90 and 90");
            }
        }

        if (data.coordinates.longitude) {
            const lng = parseFloat(data.coordinates.longitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.push("Longitude must be a valid number between -180 and 180");
            }
        }
    }

    // === DIRECTIONS ===
    // Directions are optional but if provided should be strings
    if (data.directions) {
        const directionFields = ['north1', 'east1', 'south1', 'west1', 'north2', 'east2', 'south2', 'west2'];
        for (const field of directionFields) {
            if (data.directions[field] && typeof data.directions[field] !== 'string') {
                errors.push(`Direction ${field} must be a string if provided`);
            }
        }
    }

    // === IMAGES ===
    // Note: Images are handled separately as files, but we can check if arrays exist
    if (data.propertyImages && !Array.isArray(data.propertyImages)) {
        errors.push("Property Images must be an array");
    }

    if (data.locationImages && !Array.isArray(data.locationImages)) {
        errors.push("Location Images must be an array");
    }

    // === PDF DETAILS ===
    // PDF Details are optional and can contain any string/object values
    // Basic validation: if provided, it should be an object
    if (data.pdfDetails && typeof data.pdfDetails !== 'object') {
        errors.push("PDF Details must be an object");
    }

    return errors;
};

// UPDATE VALUATION (only user can update their own pending form)
export const updateValuation = async (req, res) => {
    try {
        const { id } = req.params;
        const requestUser = req.user;

        // Debug: Log what we're receiving
        console.log("UPDATE VALUATION - Request body keys:", Object.keys(req.body));
        console.log("UPDATE VALUATION - pdfDetails received:", req.body.pdfDetails ? "YES" : "NO");

        // Handle both JSON and FormData requests
        let updateData = {};

        if (req.body.data && typeof req.body.data === 'string') {
            try {
                updateData = JSON.parse(req.body.data);
            } catch (e) {
                updateData = req.body.data;
            }
        } else {
            updateData = { ...req.body };
        }

        console.log("UPDATE VALUATION - updateData keys:", Object.keys(updateData));
        console.log("UPDATE VALUATION - pdfDetails in updateData:", updateData.pdfDetails ? "YES" : "NO");

        // Parse JSON fields that were stringified
        if (updateData.directions && typeof updateData.directions === 'string') {
            updateData.directions = JSON.parse(updateData.directions);
        }
        if (updateData.coordinates && typeof updateData.coordinates === 'string') {
            updateData.coordinates = JSON.parse(updateData.coordinates);
        }
        if (updateData.pdfDetails && typeof updateData.pdfDetails === 'string') {
            updateData.pdfDetails = JSON.parse(updateData.pdfDetails);
        }

        // Images are now coming from Cloudinary URLs (no file processing needed)
        // Just ensure arrays exist if present
        if (!updateData.propertyImages) {
            updateData.propertyImages = [];
        }
        if (!updateData.locationImages) {
            updateData.locationImages = [];
        }

        // Ensure pdfDetails is preserved if it exists
        if (!updateData.pdfDetails) {
            updateData.pdfDetails = {};
        }

        delete updateData._id;
        delete updateData.__v;
        delete updateData.uniqueId; // Don't allow changing the ID
        delete updateData.createdAt; // Don't allow changing creation date

        // Validate input data
        const validationErrors = validateUpdateData(updateData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validationErrors
            });
        }

        // Get existing valuation
        const existingValuation = await ValuationModel.findOne({ uniqueId: id });
        if (!existingValuation) {
            return res.status(404).json({ success: false, message: "Valuation not found" });
        }

        // Authorization: Only the user who submitted can update their own pending/on-progress/rejected form
        // Managers can also update rejected forms for re-submission
        // IMPORTANT: Only ADMIN can update client information fields
        if (requestUser.role === "user") {
            if (existingValuation.username !== requestUser.username) {
                return res.status(403).json({ success: false, message: "Forbidden - You can only update your own submissions" });
            }
            // Allow update if status is pending, on-progress, rejected, or rework
            if (existingValuation.status !== "pending" && existingValuation.status !== "on-progress" && existingValuation.status !== "rejected" && existingValuation.status !== "rework") {
                return res.status(403).json({ success: false, message: "Forbidden - You can only update pending, in-progress, rejected, or rework submissions" });
            }

            // Users CANNOT modify client information fields
            const clientInfoFields = ['clientName', 'mobileNumber', 'bankName', 'city', 'dsa', 'address', 'engineerName'];
            for (const field of clientInfoFields) {
                if (updateData[field] !== undefined && updateData[field] !== existingValuation[field]) {
                    return res.status(403).json({
                        success: false,
                        message: `Forbidden - Users cannot modify ${field}. Only administrators can edit client information.`
                    });
                }
            }

            // Auto-update status based on current status
            if (existingValuation.status === "rejected") {
                updateData.status = "pending"; // Resubmit as pending after rejection
            } else if (existingValuation.status === "rework") {
                updateData.status = "on-progress"; // Submit rework changes as on-progress
            } else {
                updateData.status = "on-progress"; // Normal update moves to on-progress
            }
            updateData.lastUpdatedBy = requestUser.username;
            updateData.lastUpdatedByRole = requestUser.role;
        } else if (requestUser.role === "manager1" || requestUser.role === "manager2") {
            // Managers can update pending, rejected, on-progress, and rework forms
            if (existingValuation.status !== "pending" && existingValuation.status !== "rejected" && existingValuation.status !== "on-progress" && existingValuation.status !== "rework") {
                return res.status(403).json({ success: false, message: "Forbidden - Managers can only update pending, rejected, on-progress, or rework submissions" });
            }

            // Managers CANNOT modify client information fields
            const clientInfoFields = ['clientName', 'mobileNumber', 'bankName', 'city', 'dsa', 'address', 'engineerName'];
            for (const field of clientInfoFields) {
                if (updateData[field] !== undefined && updateData[field] !== existingValuation[field]) {
                    return res.status(403).json({
                        success: false,
                        message: `Forbidden - Managers cannot modify ${field}. Only administrators can edit client information.`
                    });
                }
            }

            // Update status to on-progress
            updateData.status = "on-progress";
            updateData.lastUpdatedBy = requestUser.username;
            updateData.lastUpdatedByRole = requestUser.role;
        } else if (requestUser.role === "admin") {
            // Update status to on-progress
            updateData.status = "on-progress";
            updateData.lastUpdatedBy = requestUser.username;
            updateData.lastUpdatedByRole = requestUser.role;
        } else {
            return res.status(403).json({ success: false, message: "Forbidden - Invalid user role" });
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.elevationImages) {
                updateData["photos.elevationImages"] = req.files.elevationImages.map((f) => f.path);
            }
            if (req.files.siteImages) {
                updateData["photos.siteImages"] = req.files.siteImages.map((f) => f.path);
            }
        }

        // Ensure pdfDetails is properly merged with existing data
        if (updateData.pdfDetails && typeof updateData.pdfDetails === 'object') {
            const existingPdfDetails = existingValuation.pdfDetails || {};
            updateData.pdfDetails = {
                ...existingPdfDetails,
                ...updateData.pdfDetails
            };
        }

        const updatePayload = {
            ...updateData,
            lastUpdatedAt: new Date(),
            updatedAt: new Date()
        };

        const updated = await ValuationModel.findOneAndUpdate(
            { uniqueId: id },
            updatePayload,
            { new: true, runValidators: true }
        ).maxTimeMS(30000);

        // Also update file record
        await File.findOneAndUpdate(
            { uniqueId: id },
            updatePayload
        ).maxTimeMS(30000);

        const statusMessage = existingValuation.status === "rejected"
            ? "Valuation resubmitted successfully and status changed to 'Pending Review'"
            : "Valuation updated successfully and status changed to 'On Progress'";

        res.status(200).json({
            success: true,
            message: statusMessage,
            data: updated,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error updating valuation", error: err.message });
    }
};

// MANAGER/ADMIN SUBMIT ACTION (Approve/Reject)
export const managerSubmit = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerFeedback } = req.body;
        const requestUser = req.user;

        // Authorization: Only manager1, manager2, and admin can submit
        if (requestUser.role !== "manager1" && requestUser.role !== "manager2" && requestUser.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Only manager or admin can approve/reject"
            });
        }

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be 'approved' or 'rejected'"
            });
        }

        // Get valuation to ensure it exists and is in a reviewable state
        const existingValuation = await ValuationModel.findOne({ uniqueId: id });

        if (!existingValuation) {
            return res.status(404).json({
                success: false,
                message: "Valuation not found"
            });
        }

        // Only pending, on-progress, rejected, or rework valuations can be approved/rejected
        if (existingValuation.status !== "pending" && existingValuation.status !== "on-progress" && existingValuation.status !== "rejected" && existingValuation.status !== "rework") {
            return res.status(400).json({
                success: false,
                message: `Cannot approve/reject ${existingValuation.status} forms`
            });
        }

        // Can approve/reject user submissions OR own submissions (admin/manager can approve/reject their own)
        const isUserSubmission = existingValuation.username.toLowerCase().startsWith("user");
        const isOwnSubmission = existingValuation.username === requestUser.username;

        if (!isUserSubmission && !isOwnSubmission) {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Can only approve/reject user submissions or your own submissions"
            });
        }

        const updatedValuation = await ValuationModel.findOneAndUpdate(
            { uniqueId: id },
            {
                status,
                managerFeedback: managerFeedback || "",
                submittedByManager: true,
                lastUpdatedBy: requestUser.username,
                lastUpdatedByRole: requestUser.role,
                lastUpdatedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).maxTimeMS(30000);

        // Also update file record
        const updatedFile = await File.findOneAndUpdate(
            { uniqueId: id },
            {
                status,
                managerFeedback: managerFeedback || "",
                submittedByManager: true,
                lastUpdatedBy: requestUser.username,
                lastUpdatedByRole: requestUser.role,
                lastUpdatedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).maxTimeMS(30000);

        const statusMessage = status === "approved"
            ? "Form approved successfully"
            : "Form rejected successfully";

        res.status(200).json({
            success: true,
            message: statusMessage,
            data: updatedValuation,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error processing valuation",
            error: err.message
        });
    }
};

// REQUEST REWORK (Manager/Admin only - After Approved status)
export const requestRework = async (req, res) => {
    try {
        const { id } = req.params;
        const { reworkComments } = req.body;
        const requestUser = req.user;

        // Authorization: Only manager1, manager2, and admin can request rework
        if (requestUser.role !== "manager1" && requestUser.role !== "manager2" && requestUser.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Forbidden - Only manager or admin can request rework"
            });
        }

        // Get valuation to ensure it exists and is in approved state
        const existingValuation = await ValuationModel.findOne({ uniqueId: id });

        if (!existingValuation) {
            return res.status(404).json({
                success: false,
                message: "Valuation not found"
            });
        }

        // Rework is ONLY allowed for Approved status
        if (existingValuation.status !== "approved") {
            return res.status(400).json({
                success: false,
                message: `Cannot request rework for ${existingValuation.status} status. Rework is only allowed for approved items.`
            });
        }

        const updatedValuation = await ValuationModel.findOneAndUpdate(
            { uniqueId: id },
            {
                status: "rework",
                reworkComments: reworkComments || "",
                reworkRequestedBy: requestUser.username,
                reworkRequestedByRole: requestUser.role,
                reworkRequestedAt: new Date(),
                lastUpdatedBy: requestUser.username,
                lastUpdatedByRole: requestUser.role,
                lastUpdatedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).maxTimeMS(30000);

        // Also update file record
        await File.findOneAndUpdate(
            { uniqueId: id },
            {
                status: "rework",
                reworkComments: reworkComments || "",
                reworkRequestedBy: requestUser.username,
                reworkRequestedByRole: requestUser.role,
                reworkRequestedAt: new Date(),
                lastUpdatedBy: requestUser.username,
                lastUpdatedByRole: requestUser.role,
                lastUpdatedAt: new Date(),
                updatedAt: new Date()
            }
        ).maxTimeMS(30000);

        res.status(200).json({
            success: true,
            message: "Rework requested successfully",
            data: updatedValuation,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error requesting rework",
            error: err.message
        });
    }
};

// GET ALL VALUATIONS (role-based)
export const getAllValuations = async (req, res) => {
    try {
        const requestUser = req.user; // From auth middleware

        let query = {};

        // USERS: Can only see their own valuations
        if (requestUser.role === "user") {
            query.username = requestUser.username;
        }
        // MANAGER & ADMIN: Can see user valuations with role-based filtering + their own data
        else if (requestUser.role === "manager1" || requestUser.role === "manager2" || requestUser.role === "admin") {
            if (requestUser.role === "manager1") {
                // manager1: Can see user1, user2, user3, user4, user5 + their own data
                query.$or = [
                    { username: { $in: ["user1", "user2", "user3", "user4", "user5"] } },
                    { username: requestUser.username }
                ];
            } else if (requestUser.role === "manager2") {
                // manager2: Can see user6 and onwards + their own data
                query.$or = [
                    { username: { $regex: "^user[6-9]$|^user1[0-9]+$", $options: "i" } },
                    { username: requestUser.username }
                ];
            } else if (requestUser.role === "admin") {
                // admin: Can see all user valuations + their own data
                query.$or = [
                    { username: { $regex: "^user", $options: "i" } },
                    { username: requestUser.username }
                ];
            }
        }

        // Add timeout and lean() for better performance
        const valuations = await ValuationModel.find(query)
            .sort({ createdAt: -1 })
            .maxTimeMS(30000)
            .lean()
            .exec();

        res.status(200).json(valuations);
    } catch (error) {
        console.error("Error in getAllValuations:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};