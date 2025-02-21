import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from 'src/auth/dto';
import { Roles } from 'src/utils/roles.enum';

@Injectable()
export class AdminSetupService {

    constructor(private readonly authService: AuthService) {}

    async createAdminIfNotExist() {
        try {
            const createAdminDto: CreateUserDto = {
              email: process.env.EMAIL,
              name: "franco",
              surname: "rodriguez",
              nickname: "fran",
              roles: [Roles.MASTER],
              password: process.env.PASSWORD,
            };
          const master = await this.authService.findOneByEmail(createAdminDto.email);
          if (!master) {
            await this.authService.create(createAdminDto);
            console.log('Administrador creado exitosamente');
          }
        } catch (error) {
          console.error('Error al crear el administrador:', error);
          throw new Error('No se pudo crear el administrador');
        }
      }
      
}
