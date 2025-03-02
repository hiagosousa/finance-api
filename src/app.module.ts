import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { EarningsModule } from './earnings/earnings.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { FamilyModule } from './family/family.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development.local',
    }),
    SupabaseModule,
    EarningsModule,
    UserModule,
    FamilyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
