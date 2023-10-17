import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Cant create Pokemon - Check server logs`,
    );
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      //aca validamos si es un numero para burcarlo por el no
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (isValidObjectId(term) && !pokemon) {
      //aca validamos si es un id de mongo para buscarlo por ahi
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or no ${term} not found`,
      );
    }

    return pokemon;
  }

  async update(id: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      //Si no lo encuentra el otro metodo retorna la respuesta http
      const pokemon = await this.findOne(id);

      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
      }

      //Aca ponemos el new: true para que actualice mi variable pokemon con el objeto actualizado
      await pokemon.updateOne(updatePokemonDto);

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  // async remove(id: string) {
  //   const pokemon = await this.findOne(id);

  //   await pokemon.deleteOne();

  //   return;
  // }

  // async remove(id: string) {
  //   const result = await this.pokemonModel.findByIdAndDelete(id);

  //   return;
  // }

  async remove(id: string) {
    //ojo que no sea el delete many que es como delete *
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if(deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
    return;
  }
}
