import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new HttpException(
        'Variáveis de ambiente do Supabase não configuradas corretamente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
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

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(error);
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

    return {
      ...data.user,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    };
  }
}
