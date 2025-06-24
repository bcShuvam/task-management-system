const express = require("express");
const router = express.Router();
const {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    changeAdminPassword
} = require("../controller/adminController");

router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

router.get("/all", getAllAdmins);
router.get("/", getAdminById);
router.post("/create", createAdmin);
router.put("/update", updateAdmin);
router.delete("/delete/:id", deleteAdmin);
router.put("/change-password", changeAdminPassword);

module.exports = router;
