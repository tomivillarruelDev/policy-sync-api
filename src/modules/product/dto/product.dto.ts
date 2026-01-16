import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    code: string;

    @Expose()
    branch: string;

    @Expose()
    insuredAmount: number;

    @Expose()
    insurerId: string;

    @Expose()
    insurerName: string;
}
