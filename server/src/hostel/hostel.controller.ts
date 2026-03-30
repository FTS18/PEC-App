import { Controller, Get, Post, Body, Req, Patch, Param, UseGuards } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @UseGuards(AuthGuard)
  @Get('hostelIssues')
  getIssues(@Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.hostelService.findAllForStudent(userId);
  }

  @UseGuards(AuthGuard)
  @Post('hostelIssues')
  createIssue(@Body() data: any, @Req() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.hostelService.create({ ...data, studentId: userId });
  }

  @UseGuards(AuthGuard)
  @Patch('hostelIssues/:id')
  updateIssue(@Param('id') id: string, @Body() data: any) {
    return this.hostelService.update(id, data);
  }
}
