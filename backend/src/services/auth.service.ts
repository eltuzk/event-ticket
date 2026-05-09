import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  static async register(data: any) {
    const { email, password, fullName, role } = data;

    // Check if user exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = userRepository.create({
      email,
      password: hashedPassword,
      fullName,
      role: role || UserRole.CUSTOMER,
    });

    await userRepository.save(user);
    
    // Don't return password
    const { password: _, ...userInfo } = user;
    return userInfo;
  }

  static async login(data: any) {
    const { email, password } = data;

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    const { password: _, ...userInfo } = user;
    return { token, user: userInfo };
  }

  static async getMe(userId: string) {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password: _, ...userInfo } = user;
    return userInfo;
  }
}
