import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import { RuleSchema } from '../../../src/modules/rule/Rule.model.js';
import app from '../../../src/app.js';
import request from 'supertest';
import mongoose from "mongoose";


describe('GET /policies/:id', () => {
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
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .get(`/rules/${ruleId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .get(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should return a rule according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        const response = await request(app)
            .get(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN);
        expect(response.body._id).toBe(ruleId);
    });

    it('should return an object of type Rule', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        const response = await request(app)
            .get(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
        const Rule = mongoose.model('Rule', RuleSchema);
        const rule = new Rule(response.body);
        try {
            await rule.validateSync();
            expect(true).toBe(true);
        } catch (error) {
            expect(true).toBe(false);
        }
    });

    it('should not return a policy of a tenant that is not in the JWT', async () => {
        const policyObj = await Policy.findOne({tenantId: 25});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .get(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(404);
    });
});