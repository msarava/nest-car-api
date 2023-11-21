import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockedUserService: Partial<UsersService>;
  let mockedAuthService: Partial<AuthService>;

  beforeEach(async () => {
    // const users:User[] = [];

    mockedUserService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@test.com',
          password: 'password',
        } as User);
      },

      find: (email: string) => {
        return Promise.resolve([
          { id: 123, email, password: 'password' } as User,
        ]);
      },

      // update:()=>{return Promise.resolve()},
      // remove:()=>{return Promise.resolve()}
    };

    mockedAuthService = {
      // signUp:()=>{return Promise.resolve()}
      signIn: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UsersService, useValue: mockedUserService },
        { provide: AuthService, useValue: mockedAuthService },
      ],
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers return list users with given email', async () => {
    const users = await controller.findAllUser('test@test.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns a single user with given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
  });

  it('findUser throws error if  user with given id is not found', async () => {
    mockedUserService.findOne = () => null;
    expect(controller.findUser('12345')).rejects.toThrow(NotFoundException);
  });

  it('signIn update session object and returns user', async () => {
    const session = { userId: -10 };

    const user = await controller.signIn(
      { email: 'test@test.com', password: 'password' },
      session,
    );
    // test find user
    expect(user.id).toEqual(1);
    // test session object is passed
    expect(session.userId).toEqual(1);
  });
});
