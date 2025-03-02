import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { SupabaseController } from './supabase.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [SupabaseController],
  providers: [
    {
      provide: 'SUPABASE_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        url: configService.get('SUPABASE_URL'),
        key: configService.get('SUPABASE_KEY'),
      }),
    },
    SupabaseService,
  ],
  exports: [SupabaseService],
})
export class SupabaseModule {}
