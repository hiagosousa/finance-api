import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        'Variáveis de ambiente do Supabase não configuradas corretamente:',
      );

      throw new Error('Variáveis de ambiente do Supabase são obrigatórias');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient() {
    return this.supabase;
  }

  async findAll(tableName: string) {
    const { data, error } = await this.getClient().from(tableName).select('*');

    if (error) {
      throw error;
    }

    return data;
  }
}
