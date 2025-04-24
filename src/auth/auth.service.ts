import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface User {
    userId: string;
    email: string;
    password: string;
    roles: string[];
}
const users: User[] = [];

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
            userId: Math.random().toString(36).substring(2, 15),
            email,
            password: await bcrypt.hash(password, salt),
            roles,
        }

        users.push(user);

        console.log('signed up:', user);
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
        return {
            acces_token: await this.jwtService.signAsync(payload), 
        }
    }

}
