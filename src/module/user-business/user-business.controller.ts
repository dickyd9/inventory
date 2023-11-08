import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { UserBusinessService } from './user-business.service';
import { CreateUserBusinessDto } from './dto/create-user-business.dto';
import { UpdateUserBusinessDto } from './dto/update-user-business.dto';
import { AuthGuard } from '../user/auth/auth.guard';
import { ResponseInterceptor } from 'src/common/response/response.interceptor'

@Controller('user-business')
@UseGuards(AuthGuard)
export class UserBusinessController {
  constructor(private readonly userBusinessService: UserBusinessService) {}

  @Post()
  create(@Req() req, @Body() payload: { userId: string; businessId: string }) {
    payload.userId = req.user.sub;
    return this.userBusinessService.createUserBusiness(payload);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll() {
    return this.userBusinessService.findAll();
  }

  @Get(':businessId')
  findOne(@Req() req, @Param('businessCode') businessCode: string) {
    const userId = req.user;
    return this.userBusinessService.findOne(userId.sub, businessCode);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserBusinessDto: UpdateUserBusinessDto,
  ) {
    return this.userBusinessService.update(+id, updateUserBusinessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userBusinessService.remove(+id);
  }
}
