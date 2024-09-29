import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './routes/userRouter';
import authMiddlware from './middlewares/authMiddleware';
import accessMiddleware from './middlewares/accessMiddleware';
import cookieParser from 'cookie-parser';
import adminRouter from './routes/adminRouter';
import adminMovieRouter from './routes/adminMovieRouter';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/v1', userRouter);
app.use('/api/v1/admin', authMiddlware, accessMiddleware, adminRouter);
app.use('/api/v1/admin', authMiddlware, accessMiddleware, adminMovieRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
