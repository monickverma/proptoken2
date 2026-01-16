import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export enum EntityType {
    SPV = 'SPV',
    REIT = 'REIT',
    TRUST = 'TRUST',
    DAO_LLC = 'DAO_LLC',
}

export interface LegalEntity {
    id: string;
    assetId: string;
    entityType: EntityType;
    jurisdiction: string;
    legalName: string;
    taxId: string;
    incorporationDate: string;
    registeredAddress: string;
    directors: string[];
    bankAccount: any;
    status: string;
    documents: any[];
}

@Injectable()
export class LegalEntitiesService {
    private readonly logger = new Logger(LegalEntitiesService.name);
    private entities = new Map<string, LegalEntity>();

    async formEntity(request: {
        assetId: string;
        entityType: EntityType;
        jurisdiction: string;
        purpose: string;
    }): Promise<LegalEntity> {
        this.logger.log(`Forming ${request.entityType} in ${request.jurisdiction} for asset ${request.assetId}`);

        // Mocking India-specific formation (e.g., via Vakilsearch)
        const entityId = uuidv4();
        const isMock = request.assetId.startsWith('MOCK-');

        const legalName = isMock
            ? `[MOCK] PropToken ${request.entityType} - ${request.assetId.slice(5, 13).toUpperCase()}`
            : `PropToken ${request.entityType} - ${request.assetId.slice(0, 8).toUpperCase()}`;

        const taxId = isMock
            ? `MOCK-PAN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            : `PAN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

        const address = isMock
            ? 'Mock Street, Virtual City, Testnet 10101, Metaverse'
            : '123, BKC Hub, Mumbai, Maharashtra 400051, India';

        const entity: LegalEntity = {
            id: entityId,
            assetId: request.assetId,
            entityType: request.entityType,
            jurisdiction: request.jurisdiction,
            legalName: legalName,
            taxId: taxId,
            incorporationDate: new Date().toISOString().split('T')[0],
            registeredAddress: address,
            directors: ['PropToken Authorized Signatory', 'Asset Custodian Ltd'],
            bankAccount: {
                bankName: isMock ? 'Mock Bank of Testnet' : 'ICICI Bank',
                accountNumber: `XXXXXX${Math.floor(100000 + Math.random() * 900000)}`,
                ifsc: isMock ? 'MOCK0000000' : 'ICIC0001234'
            },
            status: 'ACTIVE',
            documents: [
                { type: 'Articles of Association', url: 'https://cdn.proptoken.com/docs/articles.pdf' },
                { type: 'Certificate of Incorporation', url: 'https://cdn.proptoken.com/docs/coi.pdf' }
            ]
        };

        this.entities.set(entityId, entity);
        return entity;
    }

    async getEntity(id: string): Promise<LegalEntity> {
        return this.entities.get(id);
    }
}
