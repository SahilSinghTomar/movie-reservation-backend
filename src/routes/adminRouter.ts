import express from 'express';
import prisma from '../utils/db';

const router = express.Router();

router.put('/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
    });

    return res.status(200).json({
      success: 'User role updated successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

export default router;
