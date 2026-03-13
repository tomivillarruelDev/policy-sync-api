import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class BranchDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    code: string;

    @Expose()
    insurerId: string;

    @Expose()
    insurerName?: string;

    @Expose()
    riskType: string;
}
