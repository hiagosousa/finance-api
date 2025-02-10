import { Module } from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  controllers: [EarningsController],
  providers: [EarningsService],
  imports: [SupabaseModule],
})
export class EarningsModule {}
