import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockedUserService: Partial<UsersService>;

  beforeEach(async () => {
    //create fake copy of user service

    const users: User[] = [];

    mockedUserService = {
      find: (email: string) => {
        const existingUser = users.filter((u) => u.email === email);

        return Promise.resolve(existingUser);
      },
      create: (email: string, password: string) => {
        const newUser = {
          id: Math.floor(Math.random() * 999),
          email,
          password,
        } as User;
        users.push(newUser);
        return Promise.resolve(newUser);
      },
    };
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockedUserService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of service', async () => {
    expect(service).toBeDefined();
  });

  it('create a new user with salt and hashed password', async () => {
    const user = await service.signUp('test@test.com', 'password');

    expect(user.password).not.toEqual('password');

    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signup with used email', async () => {
    await service.signUp('test@test.com', 'password');

    await expect(service.signUp('test@test.com', 'password')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signIn is called with unused email', async () => {
    await expect(
      service.signIn('asdflkj@asdlfkj.com', 'passdflkj'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws if invalid password provided', async () => {
    await service.signUp('test@test.com', 'password');

    await expect(
      service.signIn('test@test.com', 'wrongHashedPassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('return a user if correct password is provided', async () => {
    await service.signUp('test@test.com', 'password');
    const user = await service.signIn('test@test.com', 'password');
    await expect(user).toBeDefined();
  });
});
