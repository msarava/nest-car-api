import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import {
  Serialize,
  SerializeInterceptor,
} from 'src/interceptors/serialize.interceptor';
import { UserReponseDto } from './dtos/user-response.dto';

@Controller('auth')
// apply interceptor to all controller responses
//@Serialize(UserReponseDto)
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post('/signup')
  CreateUser(@Body() body: CreateUserDTO) {
    return this.userService.create(body.email, body.password);
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
