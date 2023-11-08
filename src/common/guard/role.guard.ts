import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/module/user/user.service'; // Gantilah dengan layanan yang digunakan untuk mengambil data pengguna

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService, // Gantilah dengan layanan yang digunakan untuk mengambil data pengguna
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // Jika tidak ada peran yang didefinisikan pada handler, maka izinkan akses
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub; // Anda perlu menentukan cara untuk mengambil ID pengguna dari request

    const user = await this.userService.findUserRole(userId); // Mengambil data pengguna dari basis data berdasarkan ID pengguna

    if (!user || !user.role) {
      return false; // Jika pengguna tidak ditemukan atau tidak memiliki peran, tolak akses
    }

    return roles.includes(user.role); // Periksa apakah peran pengguna termasuk dalam daftar peran yang diperbolehkan
  }
}
