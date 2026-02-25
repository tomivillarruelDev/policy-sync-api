import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '../../common/base/base.service';
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

@Injectable()
export class PolicyService extends BaseService<Policy, PolicyDto> {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
    private readonly dataSource: DataSource,
  ) {
    super(policyRepository);
  }

  // Crear póliza con transacción robusta
  async create(createDto: CreatePolicyDto): Promise<PolicyDto> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const policyRepo = qr.manager.getRepository(Policy);
      const installmentRepo = qr.manager.getRepository(PolicyInstallment);
      const vehicleRepo = qr.manager.getRepository(PolicyInsuredVehicle);
      const propertyRepo = qr.manager.getRepository(PolicyInsuredProperty);
      const dependentRepo = qr.manager.getRepository(PolicyDependent);
      const beneficiaryRepo = qr.manager.getRepository(PolicyBeneficiary);
      const coverageRepo = qr.manager.getRepository(PolicyAdditionalCoverage);

      const exists = await policyRepo.findOne({
        where: { policyNumber: createDto.policyNumber },
      });
      if (exists) {
        throw new BadRequestException(`Policy number ${createDto.policyNumber} already exists`);
      }

      // Separar datos principales de entidades hijas
      const {
        vehicles,
        properties,
        dependents,
        beneficiaries,
        additionalCoverages,
        installments,
        policyStatusId,
        policyCategoryId,
        clientId,
        agentId,
        insurerId,
        planId,
        previousPolicyId,
        ...policyData
      } = createDto;

      // Crear póliza principal
      const policy = policyRepo.create({
        ...policyData,
        policyStatus: { id: policyStatusId } as any,
        policyCategory: { id: policyCategoryId } as any,
        client: { id: clientId } as any,
        agent: { id: agentId } as any,
        insurer: { id: insurerId } as any,
        plan: { id: planId } as any,
        previousPolicy: previousPolicyId ? ({ id: previousPolicyId } as any) : undefined,
      });

      const savedPolicy = await policyRepo.save(policy);

      // Guardar entidades hijas asociadas
      if (vehicles && vehicles.length > 0) {

        for (const vehicleData of vehicles) {
          const { usageTypeId, vehicleTypeId, countryId, ...vehicleFields } = vehicleData;
          const vehicle = vehicleRepo.create({
            ...vehicleFields,
            policy: { id: savedPolicy.id } as any,
            usageType: usageTypeId ? { id: usageTypeId } as any : null,
            vehicleType: vehicleTypeId ? { id: vehicleTypeId } as any : null,
            country: countryId ? { id: countryId } as any : null,
          });
          await vehicleRepo.save(vehicle);
        }
      }


      if (properties && properties.length > 0) {
        for (const propertyData of properties) {
          const { cityId, propertyTypeId, roofMaterialId, ...propertyFields } = propertyData;
          const property = propertyRepo.create({
            ...propertyFields,
            policy: { id: savedPolicy.id } as any,
            city: { id: cityId } as any,
            propertyType: propertyTypeId ? { id: propertyTypeId } as any : null,
            roofMaterial: roofMaterialId ? { id: roofMaterialId } as any : null,
          });
          await propertyRepo.save(property);
        }
      }


      if (dependents && dependents.length > 0) {
        for (const dependentData of dependents) {
          const { realPersonId, relationTypeId, ...dependentFields } = dependentData;
          const dependent = dependentRepo.create({
            ...dependentFields,
            policy: { id: savedPolicy.id } as any,
            realPerson: { id: realPersonId } as any,
            relationType: { id: relationTypeId } as any,
          });
          await dependentRepo.save(dependent);
        }
      }


      if (beneficiaries && beneficiaries.length > 0) {
        for (const beneficiaryData of beneficiaries) {
          const { realPersonId, relationTypeId, ...beneficiaryFields } = beneficiaryData;
          const beneficiary = beneficiaryRepo.create({
            ...beneficiaryFields,
            policy: { id: savedPolicy.id } as any,
            realPerson: { id: realPersonId } as any,
            relationType: { id: relationTypeId } as any,
          });
          await beneficiaryRepo.save(beneficiary);
        }
      }


      if (additionalCoverages && additionalCoverages.length > 0) {
        for (const coverageData of additionalCoverages) {
          const coverage = coverageRepo.create({
            ...coverageData,
            policy: { id: savedPolicy.id } as any,
          });
          await coverageRepo.save(coverage);
        }
      }


      if (installments && installments.length > 0) {
        for (const installmentData of installments) {
          const installment = installmentRepo.create({
            ...installmentData,
            policy: { id: savedPolicy.id } as any,
          });
          await installmentRepo.save(installment);
        }
      }

      await qr.commitTransaction();
      return this.findOne(savedPolicy.id);
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

      const {
        policyStatusId,
        policyCategoryId,
        clientId,
        agentId,
        insurerId,
        planId,
        previousPolicyId,
        // Excluir arrays anidados del objeto raíz
        vehicles,
        properties,
        dependents,
        beneficiaries,
        additionalCoverages,
        installments,
        ...updateData
      } = updateDto;

      // Whitelist: limpiar undefined
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );
      Object.assign(policy, updateData);

      // Relaciones por ID
      if (policyStatusId) policy.policyStatus = { id: policyStatusId } as any;
      if (policyCategoryId) policy.policyCategory = { id: policyCategoryId } as any;
      if (clientId) policy.client = { id: clientId } as any;
      if (agentId) policy.agent = { id: agentId } as any;
      if (insurerId) policy.insurer = { id: insurerId } as any;
      if (planId) policy.plan = { id: planId } as any;
      if (previousPolicyId) policy.previousPolicy = { id: previousPolicyId } as any;

      await policyRepo.save(policy);
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
      version: v.vehicleVersion,
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
}
