import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import app from '../../../src/app.js';
import request from 'supertest';

describe('POST /rules/distribute', () => {
    beforeAll(async () => {
        await __beforeAll();
    });

    beforeEach(async () => {
        await __beforeEach();
    });

    afterAll(async () => {
        await __afterAll();
    });

    it('should be allowed to call without a valid authentication header', async () => {
        await request(app)
            .post('/rules/distribute')
            .expect(200);
    });

    it('should unmark all previously marked rules', async () => {
        // mark rules for distribution
        await request(app)
            .post('/rules/distribute/mark')
            .query({group_ids: '100'});

        // distribute rules
        await request(app)
            .post('/rules/distribute');

        // expecting no policy to be with rules that are marked for distribution
        const policies = await Policy.find({"rules.markedForDistribution": true});
        expect(policies.length).toBe(0);
    })
})