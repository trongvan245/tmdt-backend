import { Injectable } from '@nestjs/common';
import { CreateArtisanDto } from './dto/create-artisan.dto';
import { UpdateArtisanDto } from './dto/update-artisan.dto';

@Injectable()
export class ArtisansService {
  create(createArtisanDto: CreateArtisanDto) {
    return 'This action adds a new artisan';
  }

  findAll() {
    return `This action returns all artisans`;
  }

  findOne(id: number) {
    return `This action returns a #${id} artisan`;
  }

  update(id: number, updateArtisanDto: UpdateArtisanDto) {
    return `This action updates a #${id} artisan`;
  }

  remove(id: number) {
    return `This action removes a #${id} artisan`;
  }
}
