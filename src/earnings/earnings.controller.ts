import { Controller } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Controller('earnings')
export class EarningsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(tableName: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from(tableName)
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }

  async create(tableName: string, data: object): Promise<any> {
    const { data: newData, error } = await this.supabaseService
      .getClient()
      .from(tableName)
      .insert([data])
      .single();

    if (error) throw new Error(error.message);
    return newData;
  }
}
