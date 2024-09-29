import express from 'express';
import prisma from '../utils/db';
import jwt from 'jsonwebtoken';

import { userSchema } from '../schemas';
import { sendOtp } from '../schemas/sendOtp';

const router = express.Router();

router.post('/login', async (req, res) => {
  // Validate the request body
  const validatedFields = userSchema.safeParse(req.body);

  // Checking if the request body is valid
  if (!validatedFields.success) {
    return res.status(400).json({
      error: 'Invalid fields',
    });
  }

  const { email } = validatedFields.data;

  try {
    // Checking if the user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // If user doesn't exist, create a new user
    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email,
        },
      });

      // Send OTP to the user
      // Signup Step
      sendOtp(newUser.id);

      return res.status(200).json({
        success: 'OTP sent successfully',
      });
    }

    // Send OTP to the existing user
    // Login Step
    sendOtp(existingUser.id);

    return res.status(200).json({
      success: 'OTP sent successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Checking if user exists in the database
    if (!existingUser) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // get the otp code from the database
    const userOtp = await prisma.otp.findFirst({
      where: {
        userId: existingUser.id,
      },
    });

    // Checking if OTP exists in the database
    if (!userOtp) {
      return res.status(404).json({
        error: 'OTP not found',
      });
    }

    // Checking if the OTP code matches
    if (userOtp.otp_code !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
      });
    }

    // Checking if OTP has expired
    if (new Date() > userOtp.expiresIn) {
      return res.status(400).json({
        error: 'OTP expired',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.JWT_SECRET!,
      {
        expiresIn: '1h',
      }
    );

    // sending token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
    });

    // Deleting the OTP from the database
    await prisma.otp.delete({
      where: {
        id: userOtp.id,
      },
    });

    // Sending success response
    return res.status(200).json({
      success: 'OTP verified successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

export default router;
