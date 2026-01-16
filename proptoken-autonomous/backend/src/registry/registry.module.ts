import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RegistryService } from './registry.service';

@Module({
    imports: [HttpModule],
    providers: [RegistryService],
    exports: [RegistryService],
})
export class RegistryModule { }
