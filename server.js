const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");
const crypto = require("crypto");
const { exec } = require("child_process");
const fs = require("fs");
const User = require("./user"); // Confirm the path to your User model
const Event = require("./event");
const { getImageListTemplate, getEventImagesTemplate } = require("./images");

const app = express();
const PORT = process.env.PORT || 3000;
const mongoURI = "mongodb://localhost:27017/chimpzlab_db";

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Enable file upload
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit has been reached",
  })
);

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Define a schema and model for Images
const ImageSchema = new mongoose.Schema({
  imageData: String,
  faceData: Object,
});
const Image = mongoose.model("Image", ImageSchema);

app.post("/upload-temp", async (req, res) => {
  const { imageData, eventId, username } = req.body;

  if (!imageData || !eventId || !username) {
    console.error("Missing required data:", { imageData, eventId, username });
    return res.status(400).json({ error: "Missing required data" });
  }

  const image = new Image({
    imageData,
    faceData: {}, // Add any additional face data processing here
  });

  try {
    await image.save();

    // Ensure the temp directory exists
    const tempDir = path.join(__dirname, "public", "temp", username);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save the image to the public/temp/ folder
    const imgPath = path.join(tempDir, `${Date.now()}.jpg`);
    const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFileSync(imgPath, base64Data, "base64");

    res.status(201).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Error uploading image: " + error.message });
  }
});

app.post("/start-recognition", async (req, res) => {
  const { eventId, username } = req.body;

  console.log("Received /start-recognition request:", { eventId, username }); // Log the request data

  if (!eventId || !username) {
    console.error("Missing eventId or username:", { eventId, username });
    return res.status(400).json({ error: "Missing eventId or username" });
  }

  const pythonScriptPath = path.join(__dirname, "face.py");
  const command = `python ${pythonScriptPath} ${eventId} ${username}`;

  console.log("Executing command:", command); // Log the command being executed

  try {
    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });

    if (stderr) {
      console.error(`exec error: ${stderr}`);
      return res.status(500).json({ error: `Error: ${stderr}` });
    }
    // console.log(stdout)
    // console.log(JSON.parse(stdout))

    const userImages = JSON.parse(stdout); // Split the output by newline
    console.log("User image paths:", userImages); // Log the user image paths

    const updatedEvent = await updateEventWithUserImages(
      eventId,
      username,
      userImages
    );

    if (!updatedEvent) {
      console.error("Error updating event with user images");
      return res
        .status(500)
        .json({ error: "Error updating event with user images" });
    }

    // const userImagesJSON =
    //   updatedEvent.userImages && updatedEvent.userImages[username]
    //     ? JSON.stringify(updatedEvent.userImages[username])
    //     : null;

    res.json({ success: true, userImages: userImages });
  } catch (error) {
    console.error("Error processing recognition results:", error);
    res.status(500).json({ error: "Error processing recognition results" });
  }
});

async function updateEventWithUserImages(eventId, username, userImages) {
  return await Event.findOneAndUpdate(
    { _id: eventId },
    { $set: { [`userImages.${username}`]: userImages } }, // Set the new user and their image paths
    { new: true, useFindAndModify: false } // Options: return the updated document and disable deprecation warnings
  );
}

// Middleware to parse JSON data
app.use(bodyParser.json());

// Endpoint to create an event
app.post("/create-event", async (req, res) => {
  const { name, venue, date, category, userId } = req.body;
  const newEvent = new Event({
    name,
    venue,
    date,
    category,
    createdBy: userId,
  });

  try {
    await newEvent.save();
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      eventId: newEvent._id,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Error creating event." });
  }
});

// Image Upload Endpoint
app.post("/upload", async (req, res) => {
  const { imageData } = req.body;

  if (!imageData) {
    return res.status(400).send("No image data provided");
  }

  const image = new Image({
    imageData,
    faceData: {}, // Add any additional data processing here
  });

  try {
    await image.save();
    res.status(201).send("Image uploaded successfully");
  } catch (error) {
    res.status(500).send("Error uploading image: " + error.message);
  }
});

app.post("/uploads", async (req, res) => {
  try {
    const { imageData, faceData } = req.body;
    const newImage = new Image({ imageData, faceData });
    await newImage.save();
    res.status(200).json({ message: "Image uploaded successfully" });

    // Check if this is the last image or a batch upload completion
    // This logic needs to be defined based on your app's context
    // For now, we assume a condition that determines all images are uploaded
    const allImagesUploaded = true; // Placeholder condition

    if (allImagesUploaded) {
      runPythonScript(); // Run the Python script after the last image is uploaded
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.get("/photos/:userId", async (req, res) => {
  const { userId, filename } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const filePath = path.join(__dirname, `uploads/${userId}`, filename);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).send("Error retrieving photo: " + error.message);
  }
});

const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.in",
  port: 465,
  auth: {
    user: "manas@chimpzlab.com",
    pass: "oVn_x4ml",
  },
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, contact, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }
    console.log(name, email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10); // Hash the OTP

    await transporter.sendMail({
      from: '"OTP@demo.com" <manas@chimpzlab.com>',
      to: email,
      subject: "Verify Your Account",
      text: `Welcome! Your OTP is: ${otp}. It expires in 20 minutes.`,
      html: `<b>Welcome! Your OTP is: ${otp}. It expires in 20 minutes.</b>`,
    });

    // Do not save the user data here, wait for OTP verification
    res.json({
      success: true,
      message:
        "An OTP has been sent to your email. Please verify your account.",
      tempOtp: otp,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error during signup. Please try again.",
    });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { name, email, contact, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      contact,
      password: hashedPassword,
      isVerified: true,
      username:
        name
          .toLowerCase()
          .replace(/\s+/g, "")
          .split("")
          .filter((letter) => /[a-z]/.test(letter))
          .join("") + crypto.randomBytes(32).toString("hex"),
    });
    await newUser.save(); // Save the user document
    console.log("User saved:", newUser);
    res.json({
      success: true,
      message: "OTP verified, account activated.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error signing Up:", error);
    res.status(500).json({ success: false, message: "Error during sign Up" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email, isVerified: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or account not verified.",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }
    res.json({
      success: true,
      message: "Successfully signed in.",
      userId: user._id,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({
      success: false,
      message: "Error during sign in. Please try again.",
    });
  }
});

app.post("/get-user", async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    const userEvents = await Event.find({ createdBy: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    // Send the user's name as response
    res.json({
      success: true,
      name: user.name,
      userName: user.username,
      contact: user.contact,
      email: user.email,
      events: userEvents,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching user data." });
  }
});

app.post("/update-password", async (req, res) => {
  const { userId, newPassword, currentPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating password. Please try again.",
    });
  }
});

// Account deletion endpoint
app.post("/delete-account", async (req, res) => {
  const { userId } = req.body;
  try {
    // You might want to perform additional cleanup tasks before deleting the user
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account. Please try again.",
    });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);
    user.otp = hashedOtp;
    user.otpExpires = new Date(Date.now() + 20 * 60 * 1000);
    await user.save();

    const mailOptions = {
      from: '"OTP@demo.com" <manas@chimpzlab.com>',
      to: email,
      subject: "Reset Your Password",
      text: `Your OTP for password reset is: ${otp}. It expires in 20 minutes.`,
      html: `<b>Your OTP for password reset is: ${otp}. It expires in 20 minutes.</b>`,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Please check your email for the OTP to reset your password.",
      tempUserId: user._id,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error during forgot password process. Please try again.",
    });
  }
});

app.get("/images/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).send("No User found");
    }
    const imageList = user.photos.map((photo) => {
      return {
        filename: photo.filename,
        url: photo.path,
        uploadedAt: photo.uploadedAt,
      };
    });
    res.send(getImageListTemplate(imageList));
  } catch (error) {
    console.error("Fetching user images error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user images. Please try again.",
    });
  }
});

app.get("/events/:id", async (req, res) => {
  const eventId = req.params.id;

  console.log("Received eventId:", eventId); // Log received eventId

  // Check if the ID is valid
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    console.error("Invalid event ID");
    return res
      .status(400)
      .json({ success: false, message: "Invalid event ID" });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.error("Event not found");
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, event: event });
  } catch (error) {
    console.error("Fetching event error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event. Please try again.",
    });
  }
});

app.post("/get-user-events", async (req, res) => {
  const userId = req.body.userId;
  try {
    const userEvents = await Event.find({ createdBy: userId });
    if (!userEvents) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or no events found" });
    }
    res.json({ success: true, events: userEvents });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user events. Please try again.",
    });
  }
});

app.post("/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  let images = req.files.images;
  if (!images.length) {
    images = [images];
  }
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    console.log(event.photos);
    const newFiles = await Promise.all(
      images.map(async (image) => {
        const filename = image.name;
        const imgPath = `${Math.random()
          .toString(36)
          .substring(2, 5)}-${filename}`;
        await image.mv(
          path.join(__dirname, `public/events/${eventId}`, imgPath)
        );
        return { filename: filename, path: imgPath, uploadedAt: new Date() };
      })
    );

    event.photos.push(...newFiles);
    await event.save();

    res.json({
      success: true,
      message: "Images uploaded successfully!",
      photos: event.photos,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading images. Please try again.",
    });
  }
});

app.delete("/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const eventIdDir = path.join(__dirname, `public/events/${eventId}`);
    try {
      await fs.promises.rmdir(eventIdDir, { recursive: true });
    } catch (error) {
      console.error("Error deleting event folder:", error);
    }
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting event. Please try again.",
    });
  }
});

app.get("/events/images/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  console.log(eventId);
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    res.send(
      getEventImagesTemplate(
        event.photos.map((photo) => {
          return {
            filename: photo.filename,
            url: "/events/" + eventId + "/" + photo.path,
            uploadedAt: photo.uploadedAt,
          };
        })
      )
    );
  } catch (error) {
    console.error("Fetching event images error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching event images. Please try again.",
    });
  }
});

app.get("/clientImages.html", (req, res) => {
  // Serve the clientImages.html file
  res.sendFile(path.join(__dirname, "public", "clientImages.html"));
});

// Serve the index.html file for the root URL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
