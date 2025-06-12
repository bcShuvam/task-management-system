const Subscription = require("../model/subscription");
const Admin = require("../model/admin");
const bcrypt = require("bcrypt");

const getAllAdmins = async (req, res) => {
    try {
        const foundAdmins = await Admin.find({role: 'Admin'}).populate('subscriptionId');
        if (!foundAdmins)
            return res.status(400).json({ message: "Users not found", admins: [] });
        return res.status(200).json({ message: "Found Users", admins: foundAdmins });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getAdminById = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ message: 'User id is required' });

        const foundUser = await Admin.findById(id).populate('subscriptionId');
        if (!foundUser)
            return res.status(400).json({ message: "User not found", user: {} });

        return res.status(200).json({ message: "Found User", user: foundUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


const createAdmin = async (req, res) => {
    try {
        let { name, email, password, phone, role, subscriptionId, subscriptionStatus } = req.body;
        if ((!name, !email, !password, !phone, !role, !subscriptionId))
            return res.status(400).json({
                message:
                    "name, email, password, phone, role and subscription are required",
            });

        const foundUser = await Admin.findOne({ email });
        if (foundUser)
            return res.status(400).json({ message: "Email already used" });

        const foundSubscription = await Subscription.findById(subscriptionId);

        if(!foundSubscription) return res.status(400).json({message: 'Subscription not found'});

        password = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password,
            phone,
            role,
            subscriptionId,
            subscriptionStatus
        });

        return res
            .status(201)
            .json({ message: "New user created successfully.", user: newUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const id = req.query.id;
        let { name, email, phone, role, subscriptionId, subscriptionStatus, password } = req.body;

        const foundUser = await Admin.findById(id);
        if (!foundUser)
            return res.status(400).json({ message: "User not found" });

        let subscriptionName = foundUser.name;
        if (subscriptionId) {
            const subscriptionObj = await Subscription.findById(subscriptionId);
            if (!subscriptionObj) {
                return res.status(400).json({ message: "Invalid subscription ID" });
            }
            subscriptionName = subscriptionObj.name;
        }

        // Handle password update
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            foundUser.password = hashedPassword;

            // Send password update email
            await sendPasswordUpdateEmail(foundUser.email, password);
        }

        // Update other fields if provided and not empty
        if (name && name.trim() !== "") foundUser.name = name;
        if (email && email.trim() !== "") foundUser.email = email;
        if (phone && phone.trim() !== "") foundUser.phone = phone;
        if (role && role.trim() !== "") foundUser.role = role;
        if (subscriptionId && subscriptionId.trim() !== "") foundUser.subscriptionId = subscriptionId;
        if (subscriptionStatus && subscriptionStatus.trim() !== "") foundUser.subscriptionStatus = subscriptionStatus;

        await foundUser.save();

        return res.status(200).json({ message: "User updated successfully.", user: foundUser });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ message: "id is required" });
        }

        const deletedUser = await Admin.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const changeAdminPassword = async (req, res) => {
    try {
        const id = req.query.id;
        const {password, newPassword } = req.body;
        if(!id) return res.status(400).json({message: 'User id is required'});
        if(!password, !newPassword) return res.status(400).json({message: 'password and newPassword are required'});
    
        const foundUser = await Admin.findById(id);
        if(!foundUser) return res.status(400).json({message: 'User not found'});
        
        const match = await bcrypt.compare(password, foundUser.password);
        if(!match) return res.status(400).json({message: 'Password not matched.'});

        const hashedPwd = await bcrypt.hash(newPassword, 10);
        foundUser.password = hashedPwd;
        await foundUser.save();

        return res.status(201).json({message: 'Password changed successfully'});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    changeAdminPassword
};
