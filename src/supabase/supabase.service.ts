import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserDto } from 'src/user/dto/user.dto';

export interface SignInResponse {
  user: UserDto;
  accessToken: string | null;
  refreshToken: string | null;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    @Inject('SUPABASE_CONFIG')
    private config: { url: string; key: string },
  ) {
    this.validateConfig();
    this.supabase = createClient(this.config.url, this.config.key);
  }

  private validateConfig(): void {
    if (!this.config.url || !this.config.key) {
      throw new HttpException(
        'Variáveis de ambiente do Supabase não configuradas corretamente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getClient() {
    return this.supabase;
  }

  async findAll(tableName: string) {
    try {
      const { data, error } = await this.getClient()
        .from(tableName)
        .select('*');

      if (error) {
        throw new HttpException(
          `Erro ao buscar dados da tabela ${tableName}: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return data;
    } catch (error) {
      throw new HttpException(
        'Erro interno ao buscar dados',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async signIn(
    emailAddress: string,
    password: string,
  ): Promise<SignInResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: emailAddress,
        password,
      });

      if (error) {
        switch (error.code) {
          case 'invalid_credentials':
            throw new HttpException(
              'Credenciais inválidas',
              HttpStatus.UNAUTHORIZED,
            );
          case 'user_not_found':
            throw new HttpException(
              'Usuário não encontrado',
              HttpStatus.NOT_FOUND,
            );
          default:
            throw new HttpException(
              `Erro de autenticação: ${error.message}`,
              HttpStatus.BAD_REQUEST,
            );
        }
      }

      const { user, session } = data;
      const advancedUser = await this.getUserById(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: advancedUser?.name || '',
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
        accessToken: session?.access_token,
        refreshToken: session?.refresh_token,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro de autenticação',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getUserById(userId: string): Promise<UserDto | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!data) {
      return null;
    }

    if (error) {
      throw new HttpException(
        `Erro ao buscar usuário com ID ${userId}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return data[0];
  }
}
