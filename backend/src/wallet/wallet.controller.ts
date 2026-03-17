import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { DepositDto, WithdrawDto, PayWithWalletDto, TransferDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Billetera Virtual')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener billetera del usuario autenticado (incluye CVU y alias)' })
  getWallet(@CurrentUser() user: User) {
    return this.walletService.getWallet(user.id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Historial de transacciones con filtros' })
  getTransactions(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.getTransactions(user.id, +page, +limit, { type, from, to });
  }

  @Get('statement')
  @ApiOperation({ summary: 'Extracto bancario detallado del período' })
  getStatement(
    @CurrentUser() user: User,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.walletService.getAccountStatement(user.id, from, to);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Buscar destinatario por CVU, alias o email' })
  lookupRecipient(@Query('q') q: string) {
    return this.walletService.lookupRecipient(q);
  }

  @Get('receipts')
  @ApiOperation({ summary: 'Mis comprobantes de transferencia' })
  getReceipts(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.walletService.getMyReceipts(user.id, +page, +limit);
  }

  @Get('receipts/:id')
  @ApiOperation({ summary: 'Obtener comprobante por ID' })
  getReceipt(@CurrentUser() user: User, @Param('id') id: string) {
    return this.walletService.getReceipt(id, user.id);
  }

  @Post('deposit')
  @ApiOperation({ summary: 'Cargar saldo en la billetera' })
  deposit(@CurrentUser() user: User, @Body() dto: DepositDto) {
    return this.walletService.deposit(user.id, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Retirar saldo a CBU externo' })
  withdraw(@CurrentUser() user: User, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(user.id, dto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pagar orden con saldo de billetera' })
  payOrder(@CurrentUser() user: User, @Body() dto: PayWithWalletDto) {
    return this.walletService.payOrder(user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir a otro usuario (CVU, alias o email)' })
  transfer(@CurrentUser() user: User, @Body() dto: TransferDto) {
    return this.walletService.transfer(user.id, dto);
  }
}
