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
import { CreateItemDto, ItemCategoryDto } from './dto/create-item.dto';
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
  getItem(
    @Query('keyword') keyword: any,
    @Query('type') type: string,
    @Query('category') category: string,
  ) {
    return this.itemService.getAllItem(keyword, type, category);
  }

  @Put(':itemCode')
  update(
    @Param('itemCode') itemCode: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(itemCode, updateItemDto);
  }

  @Put('/assign-category/:itemId')
  assignCategory(@Param('itemId') itemId: string, @Body() categoryId: string) {
    return this.itemService.assignItemCat(itemId, categoryId);
  }

  @Delete(':itemId')
  remove(@Param('itemId') itemId: string) {
    return this.itemService.remove(itemId);
  }

  // Category Item
  @Post('/category')
  createCategory(@Body() itemCategoryDto: ItemCategoryDto) {
    return this.itemService.createItemCategory(itemCategoryDto);
  }

  @Put('/category/:categoryId')
  updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() itemCategoryDto: ItemCategoryDto,
  ) {
    return this.itemService.udpateCategory(categoryId, itemCategoryDto);
  }

  @Get('/category')
  @UseInterceptors(ResponseInterceptor)
  getItemCategory(@Query('keyword') keyword: any) {
    return this.itemService.findAllCategory(keyword);
  }
}
