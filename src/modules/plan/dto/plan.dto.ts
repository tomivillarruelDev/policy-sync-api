import { Expose } from 'class-transformer';

export class PlanDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    code: string;

    @Expose()
    deductibleOne: number;

    @Expose()
    deductibleTwo: number;

    @Expose()
    productId: string;

    @Expose()
    productName: string; // Flattened property

    @Expose()
    branchId: string; // Derivado de product.branch.id

    @Expose()
    branchName: string; // Derivado de product.branch.name
}
