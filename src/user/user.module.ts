import { Module, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'VALIDATION_PIPE',
      useValue: new ValidationPipe({
        whitelist: true, // Remove propriedades não declaradas no DTO
        forbidNonWhitelisted: true, // Lança erro se houver propriedades não declaradas
        transform: true, // Transforma automaticamente os tipos
        validateCustomDecorators: true, // Ativa validações personalizadas
      }),
    },
  ],
  imports: [SupabaseModule],
})
export class UserModule {}
