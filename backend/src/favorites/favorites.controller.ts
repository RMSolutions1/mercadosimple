import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Favoritos')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Mis favoritos' })
  findMyFavorites(@CurrentUser() user: User) {
    return this.favoritesService.findMyFavorites(user.id);
  }

  @Post(':productId/toggle')
  @ApiOperation({ summary: 'Agregar/quitar de favoritos' })
  toggle(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.favoritesService.toggle(user.id, productId);
  }

  @Get(':productId/check')
  @ApiOperation({ summary: 'Verificar si es favorito' })
  isFavorite(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.favoritesService.isFavorite(user.id, productId);
  }
}
