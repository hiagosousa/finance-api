import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignInResponse, SupabaseService } from 'src/supabase/supabase.service';
import { CreateUserDto, IUser } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createUser(dto: CreateUserDto): Promise<SignInResponse> {
    try {
      const userData = {
        name: dto.name,
      };

      const result = await this.supabaseService.signUp(
        dto.email,
        dto.password,
        userData,
      );
      console.log('Result:', result);

      return result;
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
