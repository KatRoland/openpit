import { prisma } from '../utils/db.js';
import { authenticateSystemUser, generateToken } from '../utils/authHelpers.js';

export const login = async (req: any, res: any) => {
  const { username, password } = req.body;

  try {
    await authenticateSystemUser(username, password);

    const user = await prisma.user.upsert({
      where: { username },
      update: { lastLogin: new Date() },
      create: { username }
    });

    const token = generateToken({ id: user.id, username: user.username });
    
    res.json({ token, user: { username: user.username, role: user.role } });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};