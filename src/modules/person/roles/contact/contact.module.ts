import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { Contact } from './entities/contact.entity';
import { RealPerson } from 'src/modules/person/entities/real-person.entity';
import { LegalPerson } from 'src/modules/person/entities/legal-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, RealPerson, LegalPerson])],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
