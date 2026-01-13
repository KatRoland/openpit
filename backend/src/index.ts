import express from 'express';
import authRoutes from './routers/authRouter.js';
import { authorize } from './middleware/auth.js';
import { prisma } from './utils/db.js';
import { config } from './utils/config.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/me', authorize, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ message: "logged as:", user });
});

app.listen(config.PORT, () => console.log(''));