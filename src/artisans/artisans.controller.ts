import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArtisansService } from './artisans.service';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { UpdateArtisanDto } from './dto/update-artisan.dto';

@Controller('artisans')
export class ArtisansController {
  constructor(private readonly artisansService: ArtisansService) {}

  @Post()
  create(@Body() createArtisanDto: CreateArtisanDto) {
    return this.artisansService.create(createArtisanDto);
  }

  @Get()
  findAll() {
    return this.artisansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artisansService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtisanDto: UpdateArtisanDto) {
    return this.artisansService.update(+id, updateArtisanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artisansService.remove(+id);
  }
}
