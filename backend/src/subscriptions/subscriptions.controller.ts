import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UseSubscriptionDto } from './dto/use-subscription.dto';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  async create(@Body() dto: CreateSubscriptionDto) {
    const subscription = await this.subscriptionsService.create(dto);
    return {
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  @Patch(':id/use')
  async useSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UseSubscriptionDto,
  ) {
    const subscription = await this.subscriptionsService.useSubscription(id, dto);
    return {
      message: 'Subscription session usage updated successfully',
      data: subscription,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const subscription = await this.subscriptionsService.findOne(id);
    return {
      message: 'Subscription fetched successfully',
      data: subscription,
    };
  }
}
