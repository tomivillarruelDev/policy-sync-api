import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import csc from 'countries-states-cities';

import { Country } from '../modules/person/common/address/entities/country.entity';
import { State } from '../modules/person/common/address/entities/state.entity';
import { City } from '../modules/person/common/address/entities/city.entity';

@Injectable()
export class LocationSeeder {
  private readonly logger = new Logger(LocationSeeder.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,

    @InjectRepository(State)
    private readonly stateRepo: Repository<State>,

    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  async seed() {
    this.logger.log('Iniciando la carga de datos de localización...');

    await this.clearData();

    const countriesMap = await this.seedCountries();
    const states = await this.seedStates(countriesMap);
    await this.seedCities(states);

    this.logger.log('Carga de datos de localización completada con éxito.');
  }

  async clearData() {
    this.logger.log('Eliminando datos existentes...');
    await this.cityRepo.createQueryBuilder().delete().where('1=1').execute();
    await this.stateRepo.createQueryBuilder().delete().where('1=1').execute();
    await this.countryRepo.createQueryBuilder().delete().where('1=1').execute();
    this.logger.log('Datos existentes eliminados.');
  }

  async seedCountries(): Promise<Map<string, Country>> {
    this.logger.log('Cargando países...');
    const countryMap = new Map<string, Country>();
    const all = csc.getAllCountries();

    const display = new Intl.DisplayNames(['es'], { type: 'region' });

    for (const c of all) {
      const code = (c.iso2 || '').toUpperCase();
      const nameEs = (code && display.of(code)) || c.name;
      const newCountry = this.countryRepo.create({
        name: c.name,
        nameEs,
        code: c.iso2,
        flag: '',
      });
      const saved = await this.countryRepo.save(newCountry);
      countryMap.set(c.iso2, saved);
    }

    this.logger.log(`${countryMap.size} países cargados.`);
    return countryMap;
  }

  async seedStates(
    countryMap: Map<string, Country>,
  ): Promise<Map<string, State>> {
    this.logger.log('Cargando estados/provincias...');
    const stateMap = new Map<string, State>();
    const all = csc.getAllCountries();

    for (const c of all) {
      const countryEntity = countryMap.get(c.iso2);
      if (!countryEntity) continue;

      const states = csc.getStatesOfCountry(c.id);

      for (const s of states) {
        const nameEs = this.toTitleEs(s.name);
        const newState = this.stateRepo.create({
          name: s.name,
          nameEs,
          country: countryEntity,
        });
        const saved = await this.stateRepo.save(newState);
        const stateCode = s.state_code || this.generateStateCode(s.name);
        stateMap.set(`${c.iso2}-${stateCode}`, saved);
      }
    }

    this.logger.log(`${stateMap.size} estados/provincias cargados.`);
    return stateMap;
  }

  async seedCities(stateMap: Map<string, State>) {
    this.logger.log('Cargando ciudades...');
    let count = 0;
    const all = csc.getAllCountries();

    for (const c of all) {
      const states = csc.getStatesOfCountry(c.id);

      for (const s of states) {
        const stateCode = s.state_code || this.generateStateCode(s.name);
        const stateKey = `${c.iso2}-${stateCode}`;
        const stateEntity = stateMap.get(stateKey);
        if (!stateEntity) continue;

        const cities = csc.getCitiesOfState(s.id);
        const batchSize = 1000;
        for (let i = 0; i < cities.length; i += batchSize) {
          const batch = cities.slice(i, i + batchSize);
          const cityEntities = batch.map((city) =>
            this.cityRepo.create({
              name: city.name,
              nameEs: this.toTitleEs(city.name),
              state: stateEntity,
            }),
          );
          await this.cityRepo.save(cityEntities);
          count += cityEntities.length;
          this.logger.log(`Procesadas ${count} ciudades...`);
        }
      }
    }

    this.logger.log(`${count} ciudades cargadas.`);
  }

  private generateStateCode(stateName: string): string {
    if (!stateName) return 'UN';
    const clean = stateName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length === 0) return 'UN';
    return clean.substring(0, 2).padEnd(2, 'X');
  }

  // Heurística simple para “españolizar”/capitalizar nombres sin dataset
  private toTitleEs(text: string): string {
    if (!text) return text;
    const lower = text.toLowerCase();
    return lower
      .replace(
        /\b(of|the|and)\b/g,
        (m) => ({ of: 'de', the: '', and: 'y' })[m] as string,
      )
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  }
}
