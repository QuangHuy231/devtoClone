import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from 'src/auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllNotifications(@Req() req: any): Promise<any> {
    const userId = req.user.userId;
    return await this.notificationService.getAllNotifications(userId);
  }

  @Get('/unread')
  @UseGuards(AuthGuard)
  async getUnreadNotifications(@Req() req: any): Promise<any> {
    const userId = req.user.userId;
    return await this.notificationService.getUnreadNotifications(userId);
  }
}
