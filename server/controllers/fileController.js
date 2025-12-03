import File from "../models/fileModel.js";
import ValuationModel from "../models/valuationModel.js";

// CREATE FILE (from FormPage) - Use upsert to handle duplicates
export const createFile = async (req, res) => {
    try {
        const requestUser = req.user;

        // Authorization: Only users, managers, and admin can create submissions
        if (requestUser.role !== "user" && requestUser.role !== "manager1" && requestUser.role !== "manager2" && requestUser.role !== "admin") {
            return res.status(403).json({ success: false, message: "Forbidden - Only users, managers, and admin can submit forms" });
        }

        const fileData = {
            ...req.body,
            username: requestUser.username,
            status: "pending",
            lastUpdatedBy: requestUser.username,
            lastUpdatedByRole: requestUser.role
        };

        // Use findOneAndUpdate with upsert to prevent duplicate key errors
        const file = await File.findOneAndUpdate(
            { uniqueId: req.body.uniqueId },
            fileData,
            { upsert: true, new: true }
        ).maxTimeMS(30000);

        // Also create/update valuation record
        const valuationData = {
            ...req.body,
            username: requestUser.username,
            status: "pending",
            lastUpdatedBy: requestUser.username,
            lastUpdatedByRole: requestUser.role
        };
        await ValuationModel.findOneAndUpdate(
            { uniqueId: req.body.uniqueId },
            valuationData,
            { upsert: true, new: true }
        ).maxTimeMS(30000);

        res.status(201).json({
            message: "Valuation form submitted successfully",
            data: file,
            uniqueId: file.uniqueId
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET ALL FILES (with role-based filtering)
export const getAllFiles = async (req, res) => {
    try {
        const { username, role } = req.query;
        const requestUser = req.user; // From auth middleware

        let query = {};

        // USERS: Can only see their own records
        if (requestUser.role === "user") {
            query.username = requestUser.username;
        }
        // MANAGER & ADMIN: Can see user records with role-based filtering
        else if (requestUser.role === "manager1" || requestUser.role === "manager2" || requestUser.role === "admin") {
            if (requestUser.role === "manager1") {
                // manager1: Can only see user1, user2, user3, user4, user5
                query.username = { $in: ["user1", "user2", "user3", "user4", "user5"] };
            } else if (requestUser.role === "manager2") {
                // manager2: Can only see user6 and onwards
                query.username = { $regex: "^user[6-9]$|^user1[0-9]+$", $options: "i" };
            } else if (requestUser.role === "admin") {
                // admin: Can see all user records
                query.username = { $regex: "^user", $options: "i" };
            }
        }

        const files = await File.find(query).sort({ createdAt: -1 });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// GET FILE BY ID (with authorization check)
export const getFileById = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ message: "Valuation form not found" });

        const requestUser = req.user;

        // USERS: Can only see their own records
        if (requestUser.role === "user" && file.username !== requestUser.username) {
            return res.status(403).json({ message: "Forbidden - You can only view your own records" });
        }

        // MANAGER & ADMIN: Can only see user records with role-based filtering
        if (requestUser.role !== "admin") {
            // Non-admin managers must check if it's a user record
            if (!file.username.toLowerCase().startsWith("user")) {
                return res.status(403).json({ message: "Forbidden - You can only view user records" });
            }
            
            // manager1: Can only see user1, user2, user3, user4, user5
            if (requestUser.role === "manager1") {
                const allowedUsers = ["user1", "user2", "user3", "user4", "user5"];
                if (!allowedUsers.includes(file.username.toLowerCase())) {
                    return res.status(403).json({ message: "Forbidden - You can only view user1 to user5 records" });
                }
            }
            
            // manager2: Can only see user6 and onwards (not user1-user5)
            if (requestUser.role === "manager2") {
                const restrictedUsers = ["user1", "user2", "user3", "user4", "user5"];
                if (restrictedUsers.includes(file.username.toLowerCase())) {
                    return res.status(403).json({ message: "Forbidden - You can only view user6 and other user records" });
                }
            }
        }

        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// UPDATE FILE STATUS (Manager/Admin Action)
// UPDATE FILE STATUS (Manager/Admin Action)
export const updateFileStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerFeedback } = req.body;
        const requestUser = req.user;



        // Authorization: Only manager1, manager2, and admin can update status
        if (requestUser.role !== "manager1" && requestUser.role !== "manager2" && requestUser.role !== "admin") {
            return res.status(403).json({ 
                message: "Unauthorized. Only managers or administrators can approve or reject forms." 
            });
        }

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Status must be 'approved' or 'rejected'." 
            });
        }

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: "Valuation form not found." });
        }



        // Only pending or on-progress files can be approved/rejected
        if (file.status !== "pending" && file.status !== "on-progress") {
            return res.status(400).json({ 
                message: `Cannot approve/reject ${file.status} forms` 
            });
        }

        // Ensure only user records can be updated by manager/admin
        if (!file.username.toLowerCase().startsWith("user")) {
            return res.status(403).json({ 
                message: "Unauthorized. Can only approve or reject user submissions." 
            });
        }

        // Role-based access control for file updates
        if (requestUser.role === "manager1") {
            // manager1: Can only update user1, user2, user3, user4, user5
            const allowedUsers = ["user1", "user2", "user3", "user4", "user5"];
            if (!allowedUsers.includes(file.username.toLowerCase())) {
                return res.status(403).json({ 
                    message: "Unauthorized. You can only approve/reject user1 to user5 submissions." 
                });
            }
        } else if (requestUser.role === "manager2") {
            // manager2: Can only update user6 and onwards
            const restrictedUsers = ["user1", "user2", "user3", "user4", "user5"];
            if (restrictedUsers.includes(file.username.toLowerCase())) {
                return res.status(403).json({ 
                    message: "Unauthorized. You can only approve/reject user6 and other user submissions." 
                });
            }
        }

        const updateData = {
            status,
            managerFeedback: managerFeedback || "",
            submittedByManager: true,
            lastUpdatedBy: requestUser.username,
            lastUpdatedByRole: requestUser.role
        };



        const updatedFile = await File.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).maxTimeMS(30000);

        // Also update valuation record
        await ValuationModel.findOneAndUpdate(
            { uniqueId: updatedFile.uniqueId },
            updateData,
            { new: true, runValidators: true }
        ).maxTimeMS(30000);



        const statusMessage = status === "approved"
            ? "Form approved successfully"
            : "Form returned for revision";

        res.status(200).json({
            message: statusMessage,
            data: updatedFile
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};