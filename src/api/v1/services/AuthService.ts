import { ThrowExtendedError } from '../helpers/error';
import { loginWithEmailPass } from '../interfaces/Auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserService } from './UserService';
import tokenGenerator from '../helpers/tokenGenerator';
import { EmailService } from './EmailService';
import { MailConfig } from '../../../config/mail';

export class AuthService {
	static async login(user: loginWithEmailPass) {
		const jwtSecret = process.env.JWT_SECRET;
		if (!jwtSecret) ThrowExtendedError('Internal Error JWT!', 500);

		const findUser = await UserService.getUserByEmail(user.email);

		const verifyPassword = await bcrypt.compare(
			user.password,
			findUser.password
		);
		if (!verifyPassword) ThrowExtendedError('Invalid Password', 401);

		return jwt.sign({ userId: findUser.id }, jwtSecret, {
			expiresIn: '1h',
		});
	}

	static async sendVerifyEmail(email: string) {
		const verifyToken = await tokenGenerator(32);
		const user = await UserService.getUserByEmail(email);
		user.email_verify_token = verifyToken;
		user.email_verify_expiry = Date.now() + 10 * 60000;
		await user.save();

		const emailBody = `
			<p>Whisper Email Verification</p>
			<p>Verify Token: ${verifyToken}</p>
		`;

		return EmailService.send(
			MailConfig.general.noreply_email,
			email,
			'Whisper Email Verification',
			emailBody
		);
	}

	static async verifyEmail(email: string, token: string) {
		const user = await UserService.getUserByEmail(email);

		if (user.email_verify_token !== token)
			ThrowExtendedError('Invalid Verification Token', 422);

		if (!user.email_verify_expiry || user.email_verify_expiry < Date.now())
			ThrowExtendedError('Verification Token Expired', 422);

		user.email_verified = true;
		user.email_verify_token = undefined;
		user.email_verify_expiry = undefined;
		return await user.save();
	}
}
