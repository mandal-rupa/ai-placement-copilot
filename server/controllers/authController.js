const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      targetRole,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      targetRole: targetRole || "",
    });

    res.status(201).json({
      message: "Registration successful",

      token: generateToken(user._id),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        readinessScore:
          user.readinessScore,
      },
    });

  } catch (error) {
    console.error(
      "Registration Error:",
      error
    );

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",

      token: generateToken(user._id),

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        readinessScore:
          user.readinessScore,
      },
    });

  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};


// ==========================================
// GET CURRENT USER
// ==========================================

const getMe = async (req, res) => {
  try {
    // authMiddleware se req.user mil raha hai
    const user = await User.findById(
      req.user._id
    ).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        readinessScore:
          user.readinessScore,
      },
    });

  } catch (error) {
    console.error(
      "Get Me Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch user profile",
      error: error.message,
    });
  }
};


module.exports = {
  register,
  login,
  getMe,
};