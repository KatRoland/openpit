import express from 'express';
import authRoutes from './routers/authRouter.js';
import monitorRoutes from './routers/monitorRouter.js';
import dockerRoutes from './routers/dockerRourer.js';
import { createServer } from 'http';
import { initSocket } from './utils/socket.js';
import { authorize } from './middleware/auth.js';
import { prisma } from './utils/db.js';
import { config } from './utils/config.js';

const app = express();
const httpServer = createServer(app);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/docker', dockerRoutes);

app.get('/api/me', authorize, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ message: "logged as:", user });
});

initSocket(httpServer);

httpServer.listen(config.PORT, () => 
  console.log(`Running on: ${config.PORT}`)
);