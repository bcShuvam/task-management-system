const express = require("express");
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword
} = require("../controller/userController");

router.get("/admin", getAllUsers);
router.get("/", getUserById);
router.post("/create", createUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);
router.put("/change-password", changePassword);

module.exports = router;
