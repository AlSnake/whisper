import { Request, Response, NextFunction } from 'express';
import { ThrowExtendedError } from '../helpers/error';
import jwt from 'jsonwebtoken';

export function isAuthenticated(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) ThrowExtendedError('Internal Error JWT', 500);

	const authHeader = req.headers.authorization;
	if (!authHeader) ThrowExtendedError('Not Authenticated', 401);

	const token = authHeader.split(' ')[1];
	const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
	req.userId = decoded.userId;
	next();
}
