const Subscription = require("../model/subscription");
const User = require("../model/user");
const bcrypt = require("bcrypt");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({role: 'Admin'}).populate('subscriptionId');
        if (!users)
            return res.status(400).json({ message: "Users not found", users: [] });
        return res.status(200).json({ message: "Found Users", users });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const id = req.query.id;
        if (!id) return res.status(400).json({ message: 'User id is required' });

        const foundUser = await User.findById(id).populate('subscriptionId');
        if (!foundUser)
            return res.status(400).json({ message: "User not found", user: {} });

        return res.status(200).json({ message: "Found User", user: foundUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


const createUser = async (req, res) => {
    try {
        let { name, email, password, phone, role, subscriptionId, subscriptionStatus } = req.body;
        if ((!name, !email, !password, !phone, !role, !subscriptionId))
            return res.status(400).json({
                message:
                    "name, email, password, phone, role and subscription are required",
            });

        const foundUser = await User.findOne({ email });
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

const updateUser = async (req, res) => {
    try {
        const id = req.query.id;
        let { name, email, phone, role, subscriptionId, subscriptionStatus, password } = req.body;

        const foundUser = await User.findById(id);
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

        if (password) {
            password = await bcrypt.hash(password, 10);
            foundUser.password = password;
        }

        foundUser.name = name ?? foundUser.name;
        foundUser.email = email ?? foundUser.email;
        foundUser.phone = phone ?? foundUser.phone;
        foundUser.role = role ?? foundUser.role;
        foundUser.subscriptionId = subscriptionId ?? foundUser.subscriptionId;
        foundUser.subscriptionStatus = subscriptionStatus ?? foundUser.subscriptionStatus;

        await foundUser.save();

        return res
            .status(200)
            .json({ message: "User updated successfully.", user: foundUser });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.query.id;

        if (!id) {
            return res.status(400).json({ message: "id is required" });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const id = req.query.id;
        const {password, newPassword } = req.body;
        if(!id) return res.status(400).json({message: 'User id is required'});
        if(!password, !newPassword) return res.status(400).json({message: 'password and newPassword are required'});
    
        const foundUser = await User.findById(id);
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
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword
};
