import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: any) {
    const { email, password, roles } = body;
    return await this.authService.SignUp(email, password, roles);
  }

  @Post('signin')
  async signIn(@Body() body: any) {
    const { email, password } = body;
    return await this.authService.SignIn(email, password);
  }
}
