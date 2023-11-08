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
  HttpCode,
  HttpStatus,
  Query,
  SetMetadata,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { RoleService, UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/config/database/meta';
import { AuthGuard } from './auth/auth.guard';
import { ProfileUserDto } from './dto/profile-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserRoleDto } from './dto/user-role.dto';
import { RolesGuard } from 'src/common/guard/role.guard';
import { ResponseInterceptor } from 'src/common/response/response.interceptor';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  @Public()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Public()
  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  createProfile(@Body() profileUserDto: ProfileUserDto) {
    return this.userService.createProfile(profileUserDto);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.CREATED)
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const jwt = req.user;
    return this.userService.updateProfile(updateProfileDto, jwt.sub);
  }

  @Post('role')
  @HttpCode(HttpStatus.CREATED)
  createRole(@Body() userRoleDto: UserRoleDto) {
    return this.roleService.createRole(userRoleDto);
  }

  @Get('role')
  // @SetMetadata('roles', ['owner']) // If user role change => ['?Role?']
  getUserRole() {
    return this.roleService.getRole();
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  findAll() {
    return this.userService.findAllUser();
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  findOne(@Req() req) {
    const jwt = req.user;
    return this.userService.userProfile(jwt.sub);
  }

  @Get('log/:userId')
  getUserLog(@Param('userId') userId: string) {
    return this.userService.findUserLog(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Delete('role/:roleCode')
  removeRole(@Query('roleCode') roleCode: string) {
    return this.roleService.removeRole(roleCode);
  }
}
