const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Issue = require('../model/issue');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    secure: true,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (store file in memory, not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Image Upload Controller
const uploadImg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded!" });
        }

        const { id } = req.body; // Extract id correctly

        // Ensure id is a valid MongoDB ObjectId
        if (!id) return res.status(400).json({ message: "Invalid user ID!" });

        const foundUser = await User.findById(id);
        if (!foundUser) return res.status(404).json({ message: "User not found!" });

        // Convert buffer to readable stream and upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "uploads", 
                // transformation: 
                // [{ width: 1200, height: 1200, crop: "fill", gravity: "auto" }]
         },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: error.message });
                }

                // Update user's profile image URL in database
                foundUser.profileImage = result.url;
                await foundUser.save(); // Save the updated user

                return res.status(200).json({ message: "Image uploaded successfully!", user: foundUser, result });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// Middleware for handling file uploads
const uploadMiddleware = upload.single('profileImage');

module.exports = { uploadMiddleware, uploadImg };
