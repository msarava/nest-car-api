import { Expose } from 'class-transformer';

export class UserReponseDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
}
