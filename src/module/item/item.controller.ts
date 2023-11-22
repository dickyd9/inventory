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

  @Post('category')
  createCategoryItem(
    @Body() categoryItem: { categoryCode: string; categoryName: string },
  ) {
    return this.itemService.createCategoryItem(categoryItem);
  }

  @Get()
  @UseInterceptors(ResponseInterceptor)
  getItem(@Query('keyword') keyword: any) {
    return this.itemService.getAllItem(keyword);
  }

  @Get('/menu')
  getMenu(@Query('type') type: string) {
    return this.itemService.getMenu(type);
  }

  // @Get(':id')
  // itemDetail(@Param('id') itemId: string) {
  //   return this.itemService.getDetailItem(itemId);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(id);
  }
}
