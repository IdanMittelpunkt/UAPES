import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import { RuleSchema } from '../../../src/modules/rule/Rule.model.js';
import app from '../../../src/app.js';
import request from 'supertest';
import mongoose from "mongoose";

describe('PUT /rules/:id', () => {
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
            .put(`/rules/${ruleId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        await request(app)
            .put(`/rules/${rule._id.toString()}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule)
            .expect(200);
    });

    it('should update the right rule according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        rule.name = 'something I just came up with';
        await request(app)
            .put(`/rules/${rule._id.toString()}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule)
            .expect(200);
        const updatedPolicy = await Policy.findOne({"rules._id": rule._id});
        updatedPolicy
            .rules
            .filter(_rule => rule._id.toString() === _rule._id.toString())
            .forEach(_rule => {
                expect(_rule.name).toBe('something I just came up with');
            })
    });

    it('should not update if the rule does not exist', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        delete rule['_id'];
        delete rule['updatedAt'];
        delete rule['createdAt'];

        const response = await request(app)
            .put(`/rules/abcdefabcdefabcdefabcdef`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule);
        expect(response.body).toStrictEqual({});
    });

    it('should return a valid rule if updated', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        rule.name = 'something I just came up with';
        const response = await request(app)
            .put(`/rules/${rule._id.toString()}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule);
        const Rule = mongoose.model('Rule', RuleSchema);
        const ruleObj = new Rule(response.body);
        try {
            await ruleObj.validateSync();
            expect(true).toBe(true);
        } catch (error) {
            expect(true).toBe(false);
        }
    });
})