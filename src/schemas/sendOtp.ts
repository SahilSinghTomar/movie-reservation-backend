import prisma from '../utils/db';

export const sendOtp = async (userId: string) => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));

  const existingOtp = await prisma.otp.findFirst({
    where: {
      userId,
    },
  });

  if (existingOtp) {
    await prisma.otp.delete({
      where: {
        id: existingOtp.id,
      },
    });
  }

  await prisma.otp.create({
    data: {
      userId,
      otp_code: otp,
      expiresIn: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });
};
