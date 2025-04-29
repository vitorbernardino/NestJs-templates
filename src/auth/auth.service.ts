import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

interface User {
    userId: string;
    email: string;
    password: string;
    roles: string[];
    refreshToken?: string;
}
const users: User[] = [];
const refreshTokens: any = [];

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService) {}

    async SignUp(email: string, password: string, roles: string[]) {
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            throw new BadRequestException('Email in use');
        }

        const salt = await bcrypt.genSalt();

        const user = {
            userId: uuid(),
            email,
            password: await bcrypt.hash(password, salt),
            roles,
        }

        users.push(user);

        const { password: _, ...result } = user;
        return result;
    }

    async SignIn(email: string, password: string) {
        const user = users.find(user => user.email === email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        } 

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { username: user.email, sub: user.userId, roles: user.roles };
       
        const accessToken = this.jwtService.sign(
            {...payload, type: 'access'},
            { expiresIn: '60s' }
        )

        const refreshToken = this.jwtService.sign(
            {...payload, type: 'refresh'},
            { expiresIn: '1h' }
        )

        refreshTokens.push( {value: refreshToken} );
        
        return {
            accessToken,
            refreshToken, 
        }
    }

    async refresh(refreshToken: string) {
        const storedToken = refreshTokens.find(token => token.value === refreshToken);

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const payload = this.jwtService.verify(refreshToken);
        if(payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const user = users.find(user => user.userId === payload.sub);

        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const newPayload = { username: user.email, sub: user.userId, roles: user.roles };
       
        const newAccessToken = this.jwtService.sign(
            {...newPayload, type: 'access'},
            { expiresIn: '60s' }
        )

        const newRefreshToken = this.jwtService.sign(
            {...newPayload, type: 'refresh'},
            { expiresIn: '1h' }
        )

        storedToken.value = newRefreshToken;
        
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken, 
        }
    }
}
