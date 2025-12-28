import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';

// Khi update thì không được sửa productId, chỉ sửa rating và comment
export class UpdateReviewDto extends PartialType(OmitType(CreateReviewDto, ['productId'] as const)) {}