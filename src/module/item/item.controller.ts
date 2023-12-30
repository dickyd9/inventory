import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ResponseInterceptor } from 'src/common/response/response.interceptor';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  createItem(@Body() createItemDto: CreateItemDto) {
    return this.itemService.createItem(createItemDto);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  getItem(@Query('keyword') keyword: any, @Query('type') type: string) {
    return this.itemService.getAllItem(keyword, type);
  }

  @Put(':itemCode')
  update(
    @Param('itemCode') itemCode: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(itemCode, updateItemDto);
  }

  @Delete(':itemId')
  remove(@Param('itemId') itemId: string) {
    return this.itemService.remove(itemId);
  }
}
