import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum AssetCategory {
    REAL_ESTATE = 'real-estate',
    PRIVATE_CREDIT = 'private-credit',
    COMMODITY = 'commodity',
    IP_RIGHTS = 'ip-rights',
    TEST = 'test',
}

class LocationDto {
    @IsString()
    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    coordinates: {
        lat: number;
        lng: number;
    };

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsString()
    country: string;
}

class FinancialsDto {
    @IsNumber()
    @IsOptional()
    currentRent?: number;

    @IsNumber()
    expectedYield: number;

    @IsNumber()
    expenses: number;

    @IsNumber()
    cashFlow: number;
}

export class CreateSubmissionDto {
    @IsString()
    @IsNotEmpty()
    did: string;

    @IsString()
    @IsNotEmpty()
    walletSignature: string;

    @IsEnum(AssetCategory)
    category: AssetCategory;

    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsOptional()
    specifications: Record<string, any>;

    @IsArray()
    @IsString({ each: true })
    registryIds: string[];

    // For now, we'll just accept URLs or file paths as strings in the initial DTO
    // In a real app, this might be handled via multipart upload
    @IsArray()
    @IsString({ each: true })
    imageUrls: string[] = [];

    @IsArray()
    @IsString({ each: true })
    documentUrls: string[] = [];

    @ValidateNested()
    @Type(() => FinancialsDto)
    financials: FinancialsDto;

    @IsString()
    tokenizationIntent: string;
}
