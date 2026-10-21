import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CreateCategoryDto,
  CreateMenuItemDto,
  ListMenuItemsQueryDto,
  UpdateMenuItemDto,
} from "./dto/menu.dto";
import { MenuService } from "./menu.service";

@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get("categories")
  listCategories() {
    return this.menuService.listCategories();
  }

  @Roles("admin")
  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Public()
  @Get("items")
  listItems(@Query() query: ListMenuItemsQueryDto) {
    return this.menuService.listItems({
      categorySlug: query.category,
      includeUnavailable: query.includeUnavailable === "true",
    });
  }

  @Public()
  @Get("items/:slug")
  getItem(@Param("slug") slug: string) {
    return this.menuService.getItemBySlug(slug);
  }

  @Roles("staff", "admin")
  @Post("items")
  createItem(@Body() dto: CreateMenuItemDto) {
    return this.menuService.createItem(dto);
  }

  @Roles("staff", "admin")
  @Patch("items/:id")
  updateItem(@Param("id") id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateItem(id, dto);
  }

  @Roles("admin")
  @Put("items/:id")
  replaceItem(@Param("id") id: string, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.updateItem(id, dto);
  }

  @Roles("admin")
  @Delete("items/:id")
  deleteItem(@Param("id") id: string) {
    return this.menuService.deleteItem(id);
  }
}
