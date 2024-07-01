import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/entity/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from 'src/entity/post.entity';
import { User } from 'src/entity/user.entity';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<Comment>,
    @InjectModel(Post.name)
    private postModel: Model<Post>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private notificationService: NotificationService,
  ) {}

  async getCommetsByPostId(postId: string): Promise<any> {
    let comments;
    try {
      comments = await this.commentModel
        .find({ parentPost: postId })
        .populate('author');
      if (!comments || comments.length === 0) {
        return [];
      }
    } catch (err) {
      throw new HttpException(
        'Could not fetch comments, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return comments.map((comment) => comment.toObject({ getters: true }));
  }

  async createComment(comment: CreateCommentDto, userId: string): Promise<any> {
    let post;
    try {
      post = await this.postModel.findById(comment.parentPost);
      if (!post) {
        throw new HttpException(
          'Could not find post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Could not create comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let user;
    try {
      user = await this.userModel.findById(userId);
      if (!user) {
        throw new HttpException(
          'Could not find user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Could not create comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      const createdComment = new this.commentModel({
        ...comment,
        author: userId,
      });
      await createdComment.save();

      await this.postModel.updateOne(
        { _id: comment.parentPost },
        { $push: { comments: createdComment } },
      );

      await this.userModel.updateOne(
        { _id: userId },
        { $push: { comments: createdComment } },
      );
      if (post.author != userId) {
        await this.notificationService.commentNotification(
          userId,
          post.id,
          createdComment.id,
          post.author.toString(),
        );
      }

      return (
        await this.commentModel.findById(createdComment.id).populate('author')
      ).toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not create comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateComment(
    commentId: string,
    body: string,
    userId: string,
  ): Promise<any> {
    let commentToUpdate;
    try {
      commentToUpdate = await (
        await this.commentModel.findById(commentId)
      ).populate('author');
      if (!commentToUpdate) {
        throw new HttpException(
          'Could not find comment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Could not update comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (commentToUpdate.author._id.toString() != userId) {
      throw new HttpException(
        'You are not allowed to update this comment',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const updatedComment = await this.commentModel.findByIdAndUpdate(
        commentId,
        {
          body: body,
        },
        { new: true },
      );
      return updatedComment.toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not update comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<any> {
    let commentToDelete;
    try {
      commentToDelete = await this.commentModel
        .findById(commentId)
        .populate('author')
        .populate('parentPost');
      if (!commentToDelete) {
        throw new HttpException(
          'Could not find comment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (err) {
      throw new HttpException(
        'Could not delete comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (commentToDelete.author._id.toString() != userId) {
      throw new HttpException(
        'You are not allowed to delete this comment',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const deletedComment =
        await this.commentModel.findByIdAndDelete(commentId);
      await this.postModel.updateOne(
        { _id: commentToDelete.parentPost },
        { $pull: { comments: commentId } },
      );
      await this.userModel.updateOne(
        { _id: userId },
        { $pull: { comments: commentId } },
      );
      await this.notificationService.removeCommentNotification(
        commentToDelete.author.id,
        commentToDelete.parentPost.id,
        commentId,
        commentToDelete.parentPost.author,
      );
      return deletedComment.toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not delete comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async likeComment(commentId: string, userId: string): Promise<any> {
    let comment;
    try {
      comment = await this.commentModel
        .findByIdAndUpdate(
          commentId,
          {
            $addToSet: { likes: userId },
          },
          { new: true },
        )
        .populate('author');
      if (!comment) {
        throw new HttpException(
          'Could not find comment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return comment.toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not like comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<any> {
    let comment;
    try {
      comment = await this.commentModel
        .findByIdAndUpdate(
          commentId,
          {
            $pull: { likes: userId },
          },
          { new: true },
        )
        .populate('author');
      if (!comment) {
        throw new HttpException(
          'Could not find comment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return comment.toObject({ getters: true });
    } catch (err) {
      throw new HttpException(
        'Could not unlike comment, please try again',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
