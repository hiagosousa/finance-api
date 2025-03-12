import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IUser } from 'src/user/dto/user.dto';

export interface SignInResponse {
  user: IUser;
  accessToken: string | null;
  refreshToken: string | null;
}

@Injectable()
export class SupabaseService {
  constructor(
    @Inject('SUPABASE_CONFIG')
    private config: { url: string; key: string },
  ) {
    this.validateConfig();
  }

  private createSupabaseClient(token: string): SupabaseClient {
    if (!token) return createClient(this.config.url, this.config.key);
    return createClient(this.config.url, this.config.key, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  private validateConfig(): void {
    if (!this.config.url || !this.config.key) {
      throw new HttpException(
        'Variáveis de ambiente do Supabase não configuradas corretamente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findAll(tableName: string, token: string) {
    const supabase = this.createSupabaseClient(token);
    const { data, error } = await supabase.from(tableName).select('*');

    if (error) {
      throw new HttpException(
        `Erro ao buscar dados da tabela ${tableName}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return data;
  }

  async signUp(
    email: string,
    password: string,
    userData: Partial<IUser>,
  ): Promise<SignInResponse> {
    // Check if the email is already registered
    const supabase = this.createSupabaseClient('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    console.log('Result:', data);
    console.log('Error:', error);

    if (error) {
      throw new HttpException(
        `Erro no cadastro: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!data.user) {
      throw new HttpException(
        'Erro no cadastro: verifique seu e-mail para confirmar a conta.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = data.user.id;

    // Insere os dados do usuário na tabela 'users'
    const { error: insertError } = await supabase
      .from('users')
      .insert({ ...userData, id: userId });

    console.log('Insert Error:', insertError);

    if (insertError) {
      throw new HttpException(
        `Erro ao salvar dados do usuário: ${insertError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const advancedUser = await this.getUserById(
      userId,
      data.session?.access_token,
    );

    return {
      user: {
        id: userId,
        email: data.user.email,
        name: advancedUser?.name || '',
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at,
      },
      accessToken: data.session?.access_token || null,
      refreshToken: data.session?.refresh_token || null,
    };
  }

  async signIn(
    emailAddress: string,
    password: string,
  ): Promise<SignInResponse> {
    const supabase = this.createSupabaseClient('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailAddress,
      password,
    });

    if (error) {
      throw new HttpException(
        `Erro de autenticação: ${error.message}`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!data.user) {
      throw new HttpException(
        'Erro de autenticação: usuário não encontrado.',
        HttpStatus.NOT_FOUND,
      );
    }

    const advancedUser = await this.getUserById(
      data.user.id,
      data.session?.access_token,
    );

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: advancedUser?.name || '',
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at,
      },
      accessToken: data.session?.access_token || null,
      refreshToken: data.session?.refresh_token || null,
    };
  }

  private async getUserById(
    userId: string,
    token: string,
  ): Promise<IUser | null> {
    const supabase = this.createSupabaseClient(token);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new HttpException(
        `Erro ao buscar usuário com ID ${userId}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return data;
  }
}
