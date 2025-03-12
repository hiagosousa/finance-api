import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly userService: UserService,
  ) {}

  @Post('signin')
  async signIn(@Body() credentials: { email: string; password: string }) {
    try {
      const result = await this.supabaseService.signIn(
        credentials.email,
        credentials.password,
      );

      return {
        success: true,
        data: result,
        message: 'Autenticação realizada com sucesso',
      };
    } catch (error) {
      // Aqui é importante NÃO re-lançar o erro
      // Se já é um HttpException, ele será tratado pelo middleware global
      if (error instanceof HttpException) {
        throw error;
      }

      // Se não é um HttpException, converte para um
      throw new HttpException(
        'Erro interno durante a autenticação',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('signup')
  async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Erro interno durante o cadastro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
