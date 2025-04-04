import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";



export class AuthLoginDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

}