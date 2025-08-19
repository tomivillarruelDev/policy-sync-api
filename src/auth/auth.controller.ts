import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Auth()
  @Get('refresh')
  async refreshToken(@GetUser('id') userId: string) {
    return await this.authService.refreshToken(userId);
  }

  @Auth()
  @Post('logout')
  logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('private')
  @Auth()
  testingPrivateRoute(
    @GetUser()
    user: User,
  ) {
    return {
      ok: true,
      message: 'Hello world from private route',
      user,
    };
  }
}
