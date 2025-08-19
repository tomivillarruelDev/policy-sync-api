/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const { email, password, fullName } = registerDto;

      // Crear el usuario
      const user = this.userRepository.create({
        email: email.toLowerCase(),
        password,
        fullName,
      });

      await this.userRepository.save(user);

      // Eliminar la contraseña del objeto de respuesta
      const { password: _, ...userWithoutPassword } = user;

      return {
        ...userWithoutPassword,
        token: this.getJwtToken({ id: user.id, email: user.email }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscar usuario por email
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await user.comparePassword(password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  async refreshToken(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ id: user.id, email: user.email }),
    };
  }

  logout(userId: string) {
    // En un sistema JWT puro, el logout se maneja del lado del cliente
    // eliminando el token almacenado

    return {
      success: true,
      message: 'Session successfully closed',
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      // PostgreSQL unique violation
      throw new BadRequestException(
        `User already exists: ${JSON.stringify(error.detail)}`,
      );
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Error creating user - Check server logs',
    );
  }
}
