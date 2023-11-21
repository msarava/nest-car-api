import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserReponseDto } from './dtos/user-response.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guards';

@Controller('auth')
// apply interceptor to all controller responses
@Serialize(UserReponseDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/meold')
  async getMeOld(@Session() session: any) {
    return this.userService.findOne(session.userId);
  }
  @Get('/me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDTO, @Session() session: any) {
    const user = await this.authService.signUp(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signIn(@Body() body: CreateUserDTO, @Session() session: any) {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }
  @Get('/:id')
  @Serialize(UserReponseDto)
  async findUser(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }
  @Get()
  @Serialize(UserReponseDto)
  findAllUser(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const userId = parseInt(id, 10);

    return this.userService.update(userId, body);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id, 10));
  }
}
