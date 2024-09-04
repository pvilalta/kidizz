import { Length, IsEmail, IsOptional } from 'class-validator';

export class UserUpsertDto {
  @Length(3, 20)
  username: string;

  @IsEmail()
  email: string;
}

export class ChildCareCreateDto {
  @Length(3, 30)
  name: string;
}

export class ChildUpsertDto {
  @Length(3, 20)
  firstname: string;

  @Length(3, 20)
  lastname: string;

  @IsOptional()
  childCares: number[];
}
