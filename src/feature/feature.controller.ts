import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('feature')
@UseGuards(RolesGuard)
export class FeatureController {
  constructor() {}

  @Get('public')
  getPublicFeature() {
    return 'This is a public feature.';
  }

  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivateFeature() {
    return 'This is a private feature.';
  }

  @Get('admin')
  @Roles(['admin'])
  @UseGuards(JwtAuthGuard)
  getAdminFeature() {
    return 'This is a private feature.';
  }
}
