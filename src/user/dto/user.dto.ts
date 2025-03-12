import { IsEmail, IsString, Length, Matches } from 'class-validator';

export interface IUser {
  id: string;
  email?: string;
  name: string;
  family_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CreateUserDto {
  @IsEmail(undefined, { message: 'E-mail inválido' })
  email: string;

  @IsString({ message: 'Nome inválido' })
  @Length(2, 60, { message: 'Nome deve ter entre 2 e 60 caracteres' })
  name: string;

  @IsString({ message: 'Senha inválida' })
  @Length(8, 50, { message: 'Senha deve ter entre 8 e 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
    },
  )
  password: string;
}
