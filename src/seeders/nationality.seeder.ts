import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import csc from 'countries-states-cities';
import { Nationality } from '../modules/person/entities/nationality.entity';
import { DEMONYMS } from './nationality.data';

@Injectable()
export class NationalitySeeder {
    constructor(private readonly dataSource: DataSource) { }

    async seed() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const countries = csc.getAllCountries();
            const allowedCountries = [
                'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile',
                'Colombia', 'Peru', 'Venezuela', 'Uruguay', 'Paraguay', 'Bolivia',
                'Ecuador', 'Guatemala', 'Cuba', 'Haiti', 'Dominican Republic', 'Honduras',
                'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Jamaica',
                'Trinidad And Tobago', 'Belize', 'Guyana', 'Suriname', 'French Guiana',
                'Puerto Rico', 'Guadeloupe', 'Martinique', 'Bahamas The', 'Barbados',
                'Saint Lucia', 'Curaçao', 'Aruba', 'Bermuda', 'Greenland', 'Antigua And Barbuda',
                'Saint Kitts And Nevis', 'Dominica', 'Grenada', 'Saint Vincent And The Grenadines',
                'Turks And Caicos Islands', 'Cayman Islands', 'Virgin Islands (US)',
                'Virgin Islands (British)', 'Falkland Islands', 'Anguilla',
                'Saint Pierre and Miquelon', 'Montserrat', 'Saint-Barthelemy', 'Saint-Martin (French part)',
                'Sint Maarten (Dutch part)', 'Bonaire, Sint Eustatius and Saba',
                'Germany', 'United Kingdom', 'France', 'Italy', 'Spain', 'Ukraine', 'Poland',
                'Romania', 'Netherlands The', 'Belgium', 'Czech Republic', 'Greece', 'Portugal',
                'Sweden', 'Hungary', 'Belarus', 'Austria', 'Serbia', 'Switzerland', 'Bulgaria',
                'Denmark', 'Finland', 'Slovakia', 'Norway', 'Ireland', 'Croatia (Hrvatska)',
                'Moldova', 'Bosnia and Herzegovina', 'Albania', 'Lithuania', 'Macedonia',
                'Slovenia', 'Latvia', 'Estonia', 'Montenegro', 'Luxembourg', 'Malta', 'Iceland',
                'Andorra', 'Monaco', 'Liechtenstein', 'San Marino', 'Vatican City State (Holy See)',
                'Russia', 'Jersey', 'Gibraltar', 'Man (Isle of)', 'Faroe Islands',
                'Svalbard And Jan Mayen Islands', 'Guernsey and Alderney', 'Aland Islands',
                'Egypt', 'South Africa', 'Nigeria', 'Morocco', 'Kenya', 'Ethiopia', 'Ghana',
                'Algeria', 'Tunisia', 'Senegal', 'Cameroon', 'Cote D\'Ivoire (Ivory Coast)',
                'Tanzania', 'Madagascar', 'Angola', 'Uganda', 'Turkey', 'Cyprus'
            ];

            for (const country of countries) {
                // The SQL deletes countries NOT IN the list. So we should ONLY keep countries IN the list.
                // Wait, user said "no agregues nacionalidades de los paises que se eliminan".
                // The SQL says: DELETE FROM country WHERE name NOT IN (...list of KEPT countries...)
                // So the list in SQL are the KEPT countries.
                // So I should ONLY add nationalities for countries in that list.

                if (!allowedCountries.includes(country.name)) {
                    continue;
                }

                const demonym = DEMONYMS[country.name];
                if (!demonym) {
                    // If we don't have the demonym, we skip it to avoid saving Country Name as Nationality
                    // as per user feedback "ME ESTAS GUARDANDO NOMBRES DE PAISES NO NACIONALIDADES".
                    // console.warn(`Skipping ${country.name}: No demonym mapping found.`);
                    continue;
                }

                const existing = await queryRunner.manager.findOne(Nationality, {
                    where: { name: demonym.name },
                });

                if (!existing) {
                    const nationality = new Nationality();
                    nationality.name = demonym.name; // e.g. "Argentine"
                    nationality.nameEs = demonym.nameEs; // e.g. "Argentino"

                    await queryRunner.manager.save(Nationality, nationality);
                }
            }

            await queryRunner.commitTransaction();
            console.log('Nationalities seeded successfully');
        } catch (error) {
            console.error('Error seeding nationalities:', error);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

}
