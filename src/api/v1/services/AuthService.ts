import User from '../models/User';
import { ThrowExtendedError } from '../helpers/error';
import { loginWithEmailPass } from '../interfaces/Auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
	static async login(user: loginWithEmailPass) {
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) ThrowExtendedError('Internal Error JWT!', 500);

		const findUser = await User.findOne({ email: user.email });
		if (!findUser) ThrowExtendedError('User not found!', 401);

		const verifyPassword = await bcrypt.compare(
			user.password,
			findUser.password
		);
		if (!verifyPassword) ThrowExtendedError('Invalid Password', 401);

		return jwt.sign({ userId: findUser.id }, jwtSecret, {
			expiresIn: '1h',
		});
	}
}
