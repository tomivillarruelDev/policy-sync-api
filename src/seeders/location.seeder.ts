import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { Country } from '../modules/person/common/address/entities/country.entity';
import { State } from '../modules/person/common/address/entities/state.entity';
import { City } from '../modules/person/common/address/entities/city.entity';

@Injectable()
export class LocationSeeder {
  private readonly logger = new Logger(LocationSeeder.name);
  private readonly dataPath = path.join(__dirname, 'data', 'dr5hn', 'full.json');

  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) { }

  async seed() {
    this.logger.log('Iniciando la carga de datos de localización (Source: dr5hn)...');

    if (!fs.existsSync(this.dataPath)) {
      this.logger.error(`Archivo de datos no encontrado en: ${this.dataPath}`);
      return;
    }

    await this.clearData();

    // Load full JSON
    this.logger.log('Leyendo archivo full.json...');
    const rawData = fs.readFileSync(this.dataPath, 'utf8');
    const allCountries = JSON.parse(rawData);
    this.logger.log(`Archivo leído. Procesando ${allCountries.length} países...`);

    const countriesMap = await this.seedCountries(allCountries);
    await this.seedStatesAndCities(allCountries, countriesMap);

    await this.cleanupCountries();

    this.logger.log('Carga de datos de localización completada con éxito.');
  }

  async clearData() {
    this.logger.log('Eliminando datos existentes...');
    await this.cityRepo.createQueryBuilder().delete().where('1=1').execute();
    await this.stateRepo.createQueryBuilder().delete().where('1=1').execute();
    await this.countryRepo.createQueryBuilder().delete().where('1=1').execute();
    this.logger.log('Datos existentes eliminados.');
  }

  async seedCountries(allCountries: any[]): Promise<Map<string, Country>> {
    this.logger.log('Cargando países...');
    const countryMap = new Map<string, Country>();

    for (const c of allCountries) {
      const code = (c.iso2 || '').toUpperCase();

      // Name Logic: Spanish translation > Native > English Name
      const nameEs = c.translations?.es || c.native || c.name;

      const newCountry = this.countryRepo.create({
        name: c.name,
        nameEs: nameEs,
        code: c.iso2,
        flag: c.emoji || '',
      });

      const saved = await this.countryRepo.save(newCountry);
      countryMap.set(c.id, saved); // Map by ID from JSON to link states
    }

    this.logger.log(`${countryMap.size} países cargados.`);
    return countryMap;
  }

  async seedStatesAndCities(
    allCountries: any[],
    countryMap: Map<string, Country>,
  ) {
    this.logger.log('Cargando estados y ciudades...');
    let stateCount = 0;
    let cityCount = 0;

    for (const c of allCountries) {
      const countryEntity = countryMap.get(c.id);
      if (!countryEntity) continue;

      if (!c.states || c.states.length === 0) continue;

      for (const s of c.states) {
        // State Name Logic: Native (often localized) > Es > Name
        // Fixes "Community of Madrid" vs "Comunidad de Madrid"
        const stateNameEs = s.native || s.translations?.es || s.name;

        // Ensure we don't save "undefined" if fields are missing
        const finalStateNameEs = stateNameEs || s.name;

        const newState = this.stateRepo.create({
          name: s.name,
          nameEs: finalStateNameEs,
          country: countryEntity,
        });

        const savedState = await this.stateRepo.save(newState);
        stateCount++;

        if (s.cities && s.cities.length > 0) {
          const cityEntities = s.cities.map((city) =>
            this.cityRepo.create({
              name: city.name,
              nameEs: city.name, // Cities usually don't have translations in this dataset
              state: savedState,
            }),
          );

          // Batch save cities for performance
          // TypeORM save can handle arrays, but let's chunk if huge (rarely per state)
          // 1000 limit is safe
          const batchSize = 1000;
          for (let i = 0; i < cityEntities.length; i += batchSize) {
            await this.cityRepo.save(cityEntities.slice(i, i + batchSize));
          }
          cityCount += cityEntities.length;
        }
      }

      // Periodic log to show progress
      if (stateCount % 500 === 0) {
        this.logger.log(`Procesados estados: ${stateCount}, ciudades: ${cityCount}...`);
      }
    }

    this.logger.log(`Total: ${stateCount} estados/provincias y ${cityCount} ciudades cargados.`);
  }

  async cleanupCountries() {
    this.logger.log('Validando y limpiando países no requeridos...');
    try {
      const sqlPath = path.join(__dirname, 'data', 'cleanup-locations.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await this.countryRepo.query(sql);
      this.logger.log('Limpieza de países completada.');
    } catch (error) {
      this.logger.error('Error al limpiar países:', error);
    }
  }
}
