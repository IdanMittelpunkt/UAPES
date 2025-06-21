import { __beforeAll, __beforeEach, __afterAll } from '../setup.js'
import app from '../../../src/app.js';
import request from 'supertest';
import {Policy} from "../../../src/modules/policy/policy.model.js";


describe('GET /policies', () => {
    beforeAll(async () => {
        await __beforeAll();
    });

    beforeEach(async () => {
        await __beforeEach();
    });

    afterAll(async () => {
        await __afterAll();
    });

    it('should be disallowed to call without a valid authentication header', async () => {
       await request(app)
           .get('/policies')
           .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should filter out policies not belonging to tenant 15 (from JWT)', async () => {
        const response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)

        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach(policy => {
            expect(policy.tenantId).not.toEqual('15');
        })
    });

    it('should return an array of object of type Policy', async () => {
        const response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)

        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach(policy => {
            const _policy = new Policy(policy);
            try {
                _policy.validateSync();
                expect(true).toBe(true);
            } catch (error) {
                expect(true).toBe(false);
            }
        });
    });


    it('should filter by status if specified', async () => {
        const response_active = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({status: 'active'})

        expect(response_active.body.length).toBeGreaterThan(0);

        response_active.body.forEach(policy => {
            expect(policy.status).toEqual('active');
        })

        const response_inactive = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({status: 'inactive'})

        expect(response_inactive.body.length).toBeGreaterThan(0);

        response_inactive.body.forEach(policy => {
            expect(policy.status).toEqual('inactive');
        })
    });

    it('should filter by author if specified', async () => {
        let response;
        response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({author: 'idan.mittelpunkt@gmail.com'})

        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach(policy => {
            expect(policy.author).toEqual('idan.mittelpunkt@gmail.com');
        })

        response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({author: 'someone.something@gmail.com'})

        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach(policy => {
            expect(policy.author).toEqual('someone.something@gmail.com');
        })
    });

    it('should not show rules by default', async () => {
        const response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(policy => {
            expect(policy.rules).toBeUndefined();
        })
    });

    it('should show rules if specified', async () => {
        const response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({with_rules: 'true'})
        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(policy => {
            expect(policy.rules.length).toBeGreaterThan(0);
        })
    });

    it('should ignore tenantId if specified but contradicts the JWT', async () => {
        const response = await request(app)
            .get('/policies')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({tenantId: 16})

        expect(response.body.length).toBeGreaterThan(0);
        response.body.forEach(policy => {
            expect(policy.tenantId).toEqual(15);
        })
    });

});
