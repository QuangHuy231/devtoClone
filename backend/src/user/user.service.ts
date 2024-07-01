import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../entity/user.entity';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { NotificationService } from 'src/notification/notification.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private jwtService: JwtService,
    private notificationService: NotificationService,
    private cloudinaryService: CloudinaryService,
  ) {}

  public async generateToken(payload: { userId: string; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }
  async createUser(
    createUserDto: CreateUserDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const { name, email, password } = createUserDto;

    // Kiểm tra xem người dùng đã tồn tại hay chưa
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('User already exists, please login instead');
    }
    const fileName = await this.cloudinaryService.uploadFile(file);

    const hash = await bcrypt.hash(password, 12);

    // Tạo một user mới
    const createdUser = new this.userModel({
      name,
      email,
      password: hash,
      avatar: fileName.secure_url,
    });

    // Lưu user mới
    try {
      await createdUser.save();
    } catch (err) {
      throw new InternalServerErrorException('Signup failed, please try again');
    }

    return {
      name: createdUser.name,
      userId: createdUser.id,
      email: createdUser.email,
      avatar: createdUser.avatar,
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    let existingUser: User | null;
    try {
      existingUser = await this.userModel
        .findOne({ email })
        .populate('followedTags')
        .exec();
    } catch (err) {
      throw new InternalServerErrorException(
        'Logging in failed, please try again.',
      );
    }

    // Kiểm tra nếu người dùng không tồn tại (credentials không hợp lệ)
    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials, login failed!');
    }

    // Validate password
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      throw new InternalServerErrorException(
        'Login failed, please check your credentials!',
      );
    }

    // Mật khẩu không hợp lệ
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials, login failed!');
    }

    // Tạo token
    const token = await this.generateToken({
      userId: existingUser.id,
      email: existingUser.email,
    });

    return {
      name: existingUser.name,
      userId: existingUser.id,
      email: existingUser.email,
      token,
      bio: existingUser.bio,
      avatar: existingUser.avatar,
      tags: existingUser.followedTags,
    };
  }

  async loginWithGithub(code: string): Promise<any> {
    const respone = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );
    const accessToken = respone.data.access_token;
    const { data } = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    const { name, login, avatar_url } = data;

    let existingUser;
    let user;
    try {
      existingUser = await this.userModel
        .findOne({ email: login }, '-password')
        .populate('followedTags')
        .exec();
      user = existingUser;
    } catch (err) {
      throw new InternalServerErrorException(
        'Logging in failed, please try again.',
      );
    }

    if (!existingUser) {
      let hashedPassword = await bcrypt.hash(login, 12);
      user = new this.userModel({
        name,
        email: login,
        password: hashedPassword,
        avatar: avatar_url,
      });
      try {
        await user.save();
      } catch (err) {
        throw new InternalServerErrorException(
          'Logging in failed, please try again.',
        );
      }
    }

    let token = await this.generateToken({
      userId: user.id,
      email: user.email,
    });
    return {
      name: user.name,
      userId: user.id,
      email: user.email,
      token,
      bio: user.bio,
      avatar: user.avatar,
      tags: user.followedTags,
    };
  }
  //Update user
  async updateUser(
    name: string,
    bio: string,
    email: string,
    links: string,
    location: string,
    work: string,
    skills: string,
    file: Express.Multer.File,
    userId: any,
  ): Promise<any> {
    try {
      if (file) {
        const fileName = await this.cloudinaryService.uploadFile(file);
        const user = await this.userModel.findByIdAndUpdate(
          userId,
          {
            name,
            bio,
            email,
            links,
            location,
            work,
            skills,
            avatar: fileName.secure_url,
          },
          { new: true },
        );
        return user;
      } else {
        const user = await this.userModel.findByIdAndUpdate(
          userId,
          {
            name,
            bio,
            email,
            links,
            location,
            work,
            skills,
          },
          { new: true },
        );
        return user;
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Updating user failed, please try again!',
      );
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const user = await this.userModel
        .findById(userId, '-password')
        .populate({
          path: 'posts',
          populate: {
            path: 'tags',
          },
        })
        .populate('followedTags')
        .exec();

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await user.toObject({ getters: true });
    } catch (error) {
      throw new InternalServerErrorException(
        'Getting user failed, please try again!',
      );
    }
  }

  async followUser(userId: string, followId: string): Promise<any> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { following: followId } },
        { new: true },
      );

      await this.userModel
        .findByIdAndUpdate(
          followId,
          { $addToSet: { followedBy: userId } },
          { new: true },
        )
        .exec();

      await this.notificationService.followNotification(userId, followId);

      return user; // Trả về user đã được follow
    } catch (err) {
      throw new HttpException(
        'Follow failed, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async unfollowUser(userId: string, followId: string): Promise<any> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { following: followId } },
        { new: true },
      );

      const userToFollow = await this.userModel
        .findByIdAndUpdate(
          followId,
          { $pull: { followedBy: userId } },
          { new: true },
        )
        .exec();

      await this.notificationService.removeFollowNotification(userId, followId);

      return user; // Trả về user sau khi unfollow
    } catch (err) {
      throw new HttpException(
        'Unfollow failed, please try again',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
