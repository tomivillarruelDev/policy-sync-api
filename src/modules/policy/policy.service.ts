import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, QueryRunner, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '../../common/base/base.service';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { Policy } from './entities/policy.entity';
import { PolicyInstallment } from './entities/policy-installment.entity';
import { PolicyInsuredVehicle } from './entities/policy-insured-vehicle.entity';
import { PolicyInsuredProperty } from './entities/policy-insured-property.entity';
import { PolicyDependent } from './entities/policy-dependent.entity';
import { PolicyBeneficiary } from './entities/policy-beneficiary.entity';
import { PolicyAdditionalCoverage } from './entities/policy-additional-coverage.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { PolicyDto } from './dto/policy.dto';
import { POLICY_RELATIONS } from '../person/common/constants/relations.constant';
import { handleDBErrors } from 'src/common/utils/typeorm-errors.util';
import { generateAutoCode } from 'src/common/utils/code-generator.util';

@Injectable()
export class PolicyService extends BaseService<Policy, PolicyDto> {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    private readonly dataSource: DataSource,
  ) {
    super(policyRepository);
  }

  async create(createDto: CreatePolicyDto): Promise<PolicyDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const policyRepo = qr.manager.getRepository(Policy);

      // Validar unicidad del número de póliza
      const policyNumber = generateAutoCode('POL');
      const exists = await policyRepo.findOne({
        where: { policyNumber },
      });
      if (exists) {
        throw new BadRequestException(`Policy number ${policyNumber} already exists`);
      }

      // Separar campos escalares de relaciones e hijas
      const {
        vehicles, properties, dependents, beneficiaries,
        additionalCoverages, installments,
        policyStatusId, policyCategoryId, clientId,
        agentId, insurerId, planId, previousPolicyId,
        policyNumber: _ignoredNumber,
        ...policyData
      } = createDto;

      // Crear y guardar póliza principal
      const policy = policyRepo.create({
        ...policyData,
        policyNumber
      });
      this.assignRelationIds(policy, createDto);
      const saved = await policyRepo.save(policy);

      // Guardar entidades hijas
      const r = this.getChildRepos(qr);
      if (vehicles?.length) await this.saveChildren(r.vehicle, vehicles, d => this.mapVehicle(d, saved.id));
      if (properties?.length) await this.saveChildren(r.property, properties, d => this.mapProperty(d, saved.id));
      if (dependents?.length) await this.saveChildren(r.dependent, dependents, d => this.mapDependent(d, saved.id));
      if (beneficiaries?.length) await this.saveChildren(r.beneficiary, beneficiaries, d => this.mapBeneficiary(d, saved.id));
      if (additionalCoverages?.length) await this.saveChildren(r.coverage, additionalCoverages, d => this.mapCoverage(d, saved.id));
      if (installments?.length) await this.saveChildren(r.installment, installments, d => this.mapInstallment(d, saved.id));

      await qr.commitTransaction();
      return this.findOne(saved.id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }


  async findAll(): Promise<PolicyDto[]> {
    const entities = await super.findAll({
      relations: POLICY_RELATIONS,
    });
    return entities.map(item => this.toDto(item as unknown as Policy));
  }

  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<PolicyDto>> {
    const result = await super.findAllPaginated(paginationDto, {
      relations: POLICY_RELATIONS,
    });
    return {
      ...result,
      data: result.data.map(item => this.toDto(item as unknown as Policy)),
    };
  }

  async findLatest(limit: number = 10): Promise<PolicyDto[]> {
    const entities = await this.policyRepository.find({
      relations: POLICY_RELATIONS,
      order: {
        audit: {
          createdAt: 'DESC',
        },
      },
      take: limit,
    });
    return entities.map(item => this.toDto(item));
  }


  async findOne(id: string): Promise<PolicyDto> {
    const entity = await super.findOne(id, {
      relations: POLICY_RELATIONS,
    });
    return this.toDto(entity as unknown as Policy);
  }

  async update(id: string, updateDto: UpdatePolicyDto): Promise<PolicyDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const policyRepo = qr.manager.getRepository(Policy);
      const policy = await policyRepo.findOne({
        where: { id },
        relations: POLICY_RELATIONS,
      });

      if (!policy) {
        throw new NotFoundException(`Policy with id ${id} not found`);
      }

      // Separar campos escalares de relaciones e hijas
      const {
        vehicles, properties, dependents, beneficiaries,
        additionalCoverages, installments,
        policyStatusId, policyCategoryId, clientId,
        agentId, insurerId, planId, previousPolicyId,
        policyNumber: _ignoredNumber,
        ...updateData
      } = updateDto;

      // Actualizar campos escalares
      Object.assign(policy, this.stripUndefined(updateData));
      this.assignRelationIds(policy, updateDto);
      await policyRepo.save(policy);

      // Reemplazar entidades hijas (delete + insert)
      const r = this.getChildRepos(qr);
      await this.replaceChildren(r.vehicle, id, vehicles, d => this.mapVehicle(d, id));
      await this.replaceChildren(r.property, id, properties, d => this.mapProperty(d, id));
      await this.replaceChildren(r.dependent, id, dependents, d => this.mapDependent(d, id));
      await this.replaceChildren(r.beneficiary, id, beneficiaries, d => this.mapBeneficiary(d, id));
      await this.replaceChildren(r.coverage, id, additionalCoverages, d => this.mapCoverage(d, id));
      await this.replaceChildren(r.installment, id, installments, d => this.mapInstallment(d, id));

      await qr.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await qr.rollbackTransaction();
      handleDBErrors(error);
    } finally {
      await qr.release();
    }
  }


  async remove(id: string): Promise<void> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Policy with id ${id} not found`);
    }
    await this.policyRepository.softDelete(id);
  }

  // Transformar entidad a DTO con IDs aplanados (Strict ID Pattern)
  private toDto(entity: Policy): PolicyDto {
    const dto = plainToInstance(PolicyDto, {
      ...entity,

      // Flat Catalog IDs + Names
      policyStatusId: entity.policyStatus?.id,
      policyStatusName: entity.policyStatus?.name,
      policyStatusNameEs: entity.policyStatus?.nameEs,
      policyCategoryId: entity.policyCategory?.id,
      policyCategoryName: entity.policyCategory?.name,

      // Flat Actor IDs
      clientId: entity.client?.id,
      agentId: entity.agent?.id,
      insurerId: entity.insurer?.id,
      planId: entity.plan?.id,
      branchId: entity.plan?.product?.branch?.id,
      previousPolicyId: entity.previousPolicy?.id,

      // Flat Display Names
      clientName: entity.client?.realPerson?.firstName && entity.client?.realPerson?.lastName
        ? `${entity.client.realPerson.firstName} ${entity.client.realPerson.lastName}`
        : undefined,
      agentName: entity.agent?.realPerson?.firstName && entity.agent?.realPerson?.lastName
        ? `${entity.agent.realPerson.firstName} ${entity.agent.realPerson.lastName}`
        : undefined,
      insurerName: entity.insurer?.legalPerson?.organizationName,
      planName: entity.plan?.name,
    }, { excludeExtraneousValues: true });

    // Paso 2: Asignar arrays de riesgo FUERA de plainToInstance
    // para evitar que excludeExtraneousValues descarte sus propiedades
    dto.insuredVehicles = (entity.insuredVehicles || []).map(v => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      vehicleVersion: v.vehicleVersion,
      year: v.year,
      plate: v.plate,
      chassis: v.chassis,
      engine: v.engine,
      insuredValue: v.insuredValue,
      address: v.address,
      countryId: v.country?.id || null,
      usageTypeId: v.usageType?.id || null,
      vehicleTypeId: v.vehicleType?.id || null,
    })) as any;

    dto.insuredProperties = (entity.insuredProperties || []).map(p => ({
      id: p.id,
      street: p.street,
      streetNumber: p.streetNumber,
      zipCode: p.zipCode,
      apartment: p.apartment,
      floor: p.floor,
      isPermanentResidence: p.isPermanentResidence,
      totalSquareMeters: p.totalSquareMeters,
      builtSquareMeters: p.builtSquareMeters,
      hasAlarm: p.hasAlarm,
      hasReinforcedDoor: p.hasReinforcedDoor,
      windowBars: p.windowBars,
      buildingFireSum: p.buildingFireSum,
      contentFireSum: p.contentFireSum,
      theftSum: p.theftSum,
      cityId: p.city?.id || null,
      propertyTypeId: p.propertyType?.id || null,
      roofMaterialId: p.roofMaterial?.id || null,
    })) as any;

    dto.dependents = (entity.dependents || []).map(d => ({
      id: d.id,
      deductible: d.deductible,
      status: d.status,
      notes: d.notes,
      realPersonId: d.realPerson?.id || null,
      realPersonName: d.realPerson?.firstName
        ? `${d.realPerson.firstName} ${d.realPerson.lastName || ''}`
        : null,
      relationTypeId: d.relationType?.id || null,
    })) as any;

    dto.beneficiaries = (entity.beneficiaries || []).map(b => ({
      id: b.id,
      percentage: b.percentage,
      realPersonId: b.realPerson?.id || null,
      realPersonName: b.realPerson?.firstName
        ? `${b.realPerson.firstName} ${b.realPerson.lastName || ''}`
        : null,
      relationTypeId: b.relationType?.id || null,
    })) as any;

    dto.additionalCoverages = (entity.additionalCoverages || []).map(c => ({
      id: c.id,
      coverageName: c.coverageName,
      percentage: c.percentage,
      insuredValue: c.insuredValue,
    })) as any;

    dto.installments = (entity.installments || []).map(i => ({
      id: i.id,
      installmentNumber: i.installmentNumber,
      dueDate: i.dueDate,
      amount: i.amount,
      status: i.status,
    })) as any;

    return dto;
  }

  // ══════════════════════════════════════════════════════════════
  // ── Private Helpers: Transaction & Child Entities
  // ══════════════════════════════════════════════════════════════

  /** Referencia FK shorthand: `{ id }` o `null` */
  private idRef(id: string | null | undefined): any {
    return id ? { id } : null;
  }

  /** Elimina claves `undefined` de un objeto para Object.assign seguro */
  private stripUndefined(obj: Record<string, any>): Record<string, any> {
    for (const key of Object.keys(obj)) {
      if (obj[key] === undefined) delete obj[key];
    }
    return obj;
  }

  /** Asigna relaciones FK por ID a una entidad Policy */
  private assignRelationIds(
    policy: Policy,
    { policyStatusId, policyCategoryId, clientId, agentId, insurerId, planId, previousPolicyId }:
      Partial<CreatePolicyDto>,
  ): void {
    if (policyStatusId) policy.policyStatus = this.idRef(policyStatusId);
    if (policyCategoryId) policy.policyCategory = this.idRef(policyCategoryId);
    if (clientId) policy.client = this.idRef(clientId);
    if (agentId) policy.agent = this.idRef(agentId);
    if (insurerId) policy.insurer = this.idRef(insurerId);
    if (planId) policy.plan = this.idRef(planId);
    if (previousPolicyId) policy.previousPolicy = this.idRef(previousPolicyId);
  }

  /** Obtiene repositorios de entidades hijas desde un QueryRunner */
  private getChildRepos(qr: QueryRunner) {
    return {
      vehicle: qr.manager.getRepository(PolicyInsuredVehicle),
      property: qr.manager.getRepository(PolicyInsuredProperty),
      dependent: qr.manager.getRepository(PolicyDependent),
      beneficiary: qr.manager.getRepository(PolicyBeneficiary),
      coverage: qr.manager.getRepository(PolicyAdditionalCoverage),
      installment: qr.manager.getRepository(PolicyInstallment),
    };
  }

  /** Guarda un array de entidades hijas (usado en create) */
  private async saveChildren<T extends ObjectLiteral>(
    repo: Repository<T>,
    items: any[],
    mapFn: (item: any) => any,
  ): Promise<void> {
    for (const item of items) {
      await repo.save(repo.create(mapFn(item)));
    }
  }

  /** Reemplaza entidades hijas: delete existentes + insert nuevas (usado en update) */
  private async replaceChildren<T extends ObjectLiteral>(
    repo: Repository<T>,
    policyId: string,
    items: any[] | undefined,
    mapFn: (item: any) => any,
  ): Promise<void> {
    if (items === undefined) return;
    await (repo as any).delete({ policy: { id: policyId } });
    if (items.length > 0) {
      await this.saveChildren(repo, items, mapFn);
    }
  }

  // ── Child Entity Mappers ──

  private mapVehicle(data: any, policyId: string) {
    const { usageTypeId, vehicleTypeId, countryId, ...fields } = data;
    return {
      ...fields,
      policy: this.idRef(policyId),
      usageType: this.idRef(usageTypeId),
      vehicleType: this.idRef(vehicleTypeId),
      country: this.idRef(countryId),
    };
  }

  private mapProperty(data: any, policyId: string) {
    const { cityId, propertyTypeId, roofMaterialId, ...fields } = data;
    return {
      ...fields,
      policy: this.idRef(policyId),
      city: this.idRef(cityId),
      propertyType: this.idRef(propertyTypeId),
      roofMaterial: this.idRef(roofMaterialId),
    };
  }

  private mapDependent(data: any, policyId: string) {
    const { realPersonId, relationTypeId, ...fields } = data;
    return {
      ...fields,
      policy: this.idRef(policyId),
      realPerson: this.idRef(realPersonId),
      relationType: this.idRef(relationTypeId),
    };
  }

  private mapBeneficiary(data: any, policyId: string) {
    const { realPersonId, relationTypeId, ...fields } = data;
    return {
      ...fields,
      policy: this.idRef(policyId),
      realPerson: this.idRef(realPersonId),
      relationType: this.idRef(relationTypeId),
    };
  }

  private mapCoverage(data: any, policyId: string) {
    return { ...data, policy: this.idRef(policyId) };
  }

  private mapInstallment(data: any, policyId: string) {
    return { ...data, policy: this.idRef(policyId) };
  }
}
