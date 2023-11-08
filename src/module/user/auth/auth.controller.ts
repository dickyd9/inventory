import {
  Body,
  Controller,
  Get,
  Next,
  Param,
  Post,
  Put,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/config/database/meta';
import { UserService } from '../user.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('signIn')
  async signIn(
    @Req() req,
    @Body() payload: { username: string; password: string },
  ) {
    return await this.authService.validateUser(req, payload);
  }

  @Get('validateToken')
  async validateToken(@Request() req, @Res() res, @Next() next) {
    return req.user;
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    const newAccessToken = await this.authService.refreshAccessToken(
      dto.refreshToken,
    );
    return { accessToken: newAccessToken };
  }

  @Post('generate-reset')
  async requestResetPassword(@Request() req) {
    // Kirim tanggapan sukses atau kirim email notifikasi ke pengguna
    const auth = req.user;

    const user = await this.userService.findUser(auth.username);
    return user;
  }

  // @Put('reset-password')
  // async resetPassword(@Body('')) {
  //   return await this.authService.sendEmailPassword(email);
  // }

  @Public()
  @Put('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return await this.userService.generateResetPassword(email);
  }

  @Public()
  @Put('change-password')
  async changePassword(
    @Body('resetToken') resetToken: string,
    @Body('password')
    password: {
      oldPassword: string | null;
      newPassword: string;
      newConfirmPassword: string;
    },
  ) {
    return await this.userService.resetPassword(resetToken, password);
  }
}
