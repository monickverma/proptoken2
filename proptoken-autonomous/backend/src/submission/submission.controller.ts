import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@Controller('submissions')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) { }

    @Post()
    async create(@Body() createSubmissionDto: CreateSubmissionDto): Promise<SubmissionResponseDto> {
        return this.submissionService.create(createSubmissionDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const submission = this.submissionService.getSubmission(id);
        if (!submission) {
            throw new NotFoundException(`Submission ${id} not found`);
        }
        return submission;
    }

    @Get()
    async findAll() {
        return this.submissionService.getAll();
    }
}
