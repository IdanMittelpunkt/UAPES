import { __beforeAll, __beforeEach, __afterAll } from '../setup.js'
import app from '../../../src/app.js';
import request from 'supertest';
import { Rule } from "../../../src/modules/rule/rule.model.js";
import Constants from "../../../src/common/config/constants.js";


describe('GET /rules', () => {
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
            .get('/rules')
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        await request(app)
            .get('/rules')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should return array of object of type Rule', async () => {
        const response = await request(app)
            .get('/rules')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN);
        const rules = response.body;
        expect(rules.length).toBeGreaterThan(0);
        rules.forEach(rule => {
            const _rule = new Rule(rule);
            try {
                _rule.validateSync();
                expect(true).toBe(true);
            } catch (error) {
                expect(true).toBe(false);
            }
        });
    });

    it('should not return rules of a policy whose tenant is not in the JWT', async () => {
        const response = await request(app)
            .get('/rules')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN);
        const rules = response.body;
        rules.forEach(rule => {
            expect(rule.name).not.toEqual('test rule #7 of policy #4');
            expect(rule.name).not.toEqual('test rule #8 of policy #4');
        });
    });

    it('should filter based on specified filters - ', async () => {
        const response = await request(app)
            .get('/rules')
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .query({
                policy_status: Constants.POLICY_STATUS_ACTIVE,
                rule_target_scope: 'group'
            });
        response.body.forEach(rule => {
            expect([
                'test rule #1 of policy #1',
                'test rule #3 of policy #2',
                'test rule #4 of policy #2',
                'test rule #5 of policy #3',
                'test rule #6 of policy #3'
            ]).toContain(rule.name)
        });
    });
})