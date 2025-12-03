import Bill from "../models/billModel.js";

// CREATE BILL
export const createBill = async (req, res) => {
  try {
    const requestUser = req.user;

    // Authorization: Only managers and admin can create bills
    if (
      requestUser.role !== "manager1" &&
      requestUser.role !== "manager2" &&
      requestUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Only managers and admin can create bills",
      });
    }

    // Generate bill number if not provided
    let billNumber = req.body.billNumber;
    if (!billNumber) {
      const count = await Bill.countDocuments({});
      billNumber = `BILL-${Date.now()}-${count + 1}`;
    }

    const billData = {
      ...req.body,
      billNumber,
      username: requestUser.username,
      status: "draft",
      lastUpdatedBy: requestUser.username,
      lastUpdatedByRole: requestUser.role,
    };

    // Calculate totals
    if (billData.items && Array.isArray(billData.items)) {
      let totalAmount = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;

      billData.items.forEach((item) => {
        totalAmount += item.amount || 0;
        totalCgst += item.cgst || 0;
        totalSgst += item.sgst || 0;
        totalIgst += item.igst || 0;
      });

      billData.totalAmount = totalAmount;
      billData.totalCgst = totalCgst;
      billData.totalSgst = totalSgst;
      billData.totalIgst = totalIgst;
      billData.totalGst = totalCgst + totalSgst + totalIgst;
      billData.grandTotal = totalAmount + billData.totalGst;
    }

    const newBill = await Bill.create(billData);

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: newBill,
    });
  } catch (err) {
    console.error("Error in createBill:", err.message);
    res.status(500).json({
      success: false,
      message: "Error creating bill",
      error: err.message,
    });
  }
};

// GET BILL BY ID
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const requestUser = req.user;

    const bill = await Bill.findOne({ billNumber: id });

    if (!bill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Authorization: Users can only see their own bills
    if (requestUser.role === "user" && bill.username !== requestUser.username) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - You can only view your own bills",
      });
    }

    // Managers can view user bills and their own
    if (requestUser.role === "manager1" || requestUser.role === "manager2") {
      const isUserBill = bill.username.toLowerCase().startsWith("user");
      const isOwnBill = bill.username === requestUser.username;

      if (!isUserBill && !isOwnBill) {
        return res.status(403).json({
          success: false,
          message: "Forbidden - You can only view user or your own bills",
        });
      }

      if (isUserBill && !isOwnBill) {
        if (requestUser.role === "manager1") {
          const allowedUsers = ["user1", "user2", "user3", "user4", "user5"];
          if (!allowedUsers.includes(bill.username.toLowerCase())) {
            return res.status(403).json({
              success: false,
              message: "Forbidden - You can only view bills from user1 to user5",
            });
          }
        }

        if (requestUser.role === "manager2") {
          const restrictedUsers = [
            "user1",
            "user2",
            "user3",
            "user4",
            "user5",
          ];
          if (restrictedUsers.includes(bill.username.toLowerCase())) {
            return res.status(403).json({
              success: false,
              message: "Forbidden - You can only view bills from user6 onwards",
            });
          }
        }
      }
    }

    res.status(200).json({ success: true, data: bill });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching bill",
      error: err.message,
    });
  }
};

// UPDATE BILL
export const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const requestUser = req.user;

    const existingBill = await Bill.findOne({ billNumber: id });

    if (!existingBill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Authorization: Only managers and admin can update bills
    if (
      requestUser.role !== "manager1" &&
      requestUser.role !== "manager2" &&
      requestUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Only managers and admin can update bills",
      });
    }

    let updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.billNumber; // Don't allow changing bill number

    // Recalculate totals
    if (updateData.items && Array.isArray(updateData.items)) {
      let totalAmount = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;

      updateData.items.forEach((item) => {
        totalAmount += item.amount || 0;
        totalCgst += item.cgst || 0;
        totalSgst += item.sgst || 0;
        totalIgst += item.igst || 0;
      });

      updateData.totalAmount = totalAmount;
      updateData.totalCgst = totalCgst;
      updateData.totalSgst = totalSgst;
      updateData.totalIgst = totalIgst;
      updateData.totalGst = totalCgst + totalSgst + totalIgst;
      updateData.grandTotal = totalAmount + updateData.totalGst;
    }

    updateData.lastUpdatedBy = requestUser.username;
    updateData.lastUpdatedByRole = requestUser.role;
    updateData.updatedAt = new Date();

    const updatedBill = await Bill.findOneAndUpdate(
      { billNumber: id },
      updateData,
      { new: true, runValidators: true }
    ).maxTimeMS(30000);

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: updatedBill,
    });
  } catch (err) {
    console.error("Error in updateBill:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating bill",
      error: err.message,
    });
  }
};

// APPROVE BILL (Manager/Admin)
export const approveBill = async (req, res) => {
  try {
    const { id } = req.params;
    const requestUser = req.user;

    // Authorization: Only manager or admin can approve
    if (
      requestUser.role !== "manager1" &&
      requestUser.role !== "manager2" &&
      requestUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Only manager or admin can approve bills",
      });
    }

    const existingBill = await Bill.findOne({ billNumber: id });

    if (!existingBill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Only draft bills can be approved
    if (existingBill.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Cannot approve ${existingBill.status} bills`,
      });
    }

    const updatedBill = await Bill.findOneAndUpdate(
      { billNumber: id },
      {
        status: "approved",
        lastUpdatedBy: requestUser.username,
        lastUpdatedByRole: requestUser.role,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).maxTimeMS(30000);

    res.status(200).json({
      success: true,
      message: "Bill approved successfully",
      data: updatedBill,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error approving bill",
      error: err.message,
    });
  }
};

// REJECT BILL (Manager/Admin)
export const rejectBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const requestUser = req.user;

    // Authorization: Only manager or admin can reject
    if (
      requestUser.role !== "manager1" &&
      requestUser.role !== "manager2" &&
      requestUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Only manager or admin can reject bills",
      });
    }

    const existingBill = await Bill.findOne({ billNumber: id });

    if (!existingBill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Only draft bills can be rejected
    if (existingBill.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: `Cannot reject ${existingBill.status} bills`,
      });
    }

    const updatedBill = await Bill.findOneAndUpdate(
      { billNumber: id },
      {
        status: "rejected",
        lastUpdatedBy: requestUser.username,
        lastUpdatedByRole: requestUser.role,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).maxTimeMS(30000);

    res.status(200).json({
      success: true,
      message: "Bill rejected successfully",
      data: updatedBill,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error rejecting bill",
      error: err.message,
    });
  }
};

// GET ALL BILLS (role-based)
export const getAllBills = async (req, res) => {
  try {
    const requestUser = req.user;
    let query = {};

    // USERS: Can only see their own bills
    if (requestUser.role === "user") {
      query.username = requestUser.username;
    }
    // MANAGER & ADMIN: Can see user bills with role-based filtering + their own bills
    else if (
      requestUser.role === "manager1" ||
      requestUser.role === "manager2" ||
      requestUser.role === "admin"
    ) {
      if (requestUser.role === "manager1") {
        query.$or = [
          { username: { $in: ["user1", "user2", "user3", "user4", "user5"] } },
          { username: requestUser.username },
        ];
      } else if (requestUser.role === "manager2") {
        query.$or = [
          { username: { $regex: "^user[6-9]$|^user1[0-9]+$", $options: "i" } },
          { username: requestUser.username },
        ];
      } else if (requestUser.role === "admin") {
        query.$or = [
          { username: { $regex: "^user", $options: "i" } },
          { username: requestUser.username },
        ];
      }
    }

    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .maxTimeMS(30000)
      .lean()
      .exec();

    res.status(200).json({
      success: true,
      data: bills,
    });
  } catch (error) {
    console.error("Error in getAllBills:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// DELETE BILL (only draft bills)
export const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const requestUser = req.user;

    const existingBill = await Bill.findOne({ billNumber: id });

    if (!existingBill) {
      return res
        .status(404)
        .json({ success: false, message: "Bill not found" });
    }

    // Authorization: Only managers and admin can delete bills
    if (
      requestUser.role !== "manager1" &&
      requestUser.role !== "manager2" &&
      requestUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden - Only managers and admin can delete bills",
      });
    }

    await Bill.findOneAndDelete({ billNumber: id });

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error deleting bill",
      error: err.message,
    });
  }
};
