import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

//transform callback function in proimise function
const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signUp(email: string, password: string) {
    //## check if email is unused
    const users = await this.userService.find(email);
    if (users.length > 0) {
      throw new BadRequestException('Email used');
    }
    //## hash password :
    // 1 - generate salt
    // 2 - hash sald and password - add buffer type because TS doest manage scrypt
    // 3 - join hashed password and salt

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPaswword = salt + '.' + hash.toString('hex');

    // ## create a save new user
    const user = await this.userService.create(email, hashedPaswword);
    return user;
  }

  async signIn(email: string, password: string) {
    //find user
    const [user] = await this.userService.find(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    //get salt, hash provided password and compared to stored password

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash != hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }
    return user;
  }
}
