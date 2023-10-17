import { IsInt, IsPositive, Min, IsString, MinLength } from "class-validator";


export class CreatePokemonDto {

    //Entero, positivo y >=1
    @IsInt()
    @IsPositive()
    @Min(1)
    no: number;

    //string, min (1)
    @IsString()
    @MinLength(1)
    name: string;
}
