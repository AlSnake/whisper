import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthService } from '../services/AuthService';

export class AuthController {
	static async postLogin(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void> {
		const { email, password } = req.body;
		const jwt = await AuthService.login({ email, password });
		res.status(200).json({ token: jwt });
	}
}
