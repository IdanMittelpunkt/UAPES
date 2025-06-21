import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import { Rule } from '../../../src/modules/rule/rule.model.js';
import app from '../../../src/app.js';
import request from 'supertest';
import mongoose from "mongoose";

describe('PATCH /rules/:id', () => {
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
        const ruleId = policyObj.toObject().rules[0].id;
        await request(app)
            .patch(`/rules/${ruleId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        await request(app)
            .patch(`/rules/${rule.id}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule)
            .expect(200);
    });

    it('should update the right rule according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        rule.name = 'something I just came up with';
        await request(app)
            .patch(`/rules/${rule.id}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule)
            .expect(200);
        const updatedPolicy = await Policy.findOne({"rules._id": new mongoose.Types.ObjectId(rule.id)});
        updatedPolicy
            .rules
            .map(_rule => _rule.toObject())
            .filter(_rule => rule.id === _rule._id)
            .forEach(_rule => {
                expect(_rule.name).toBe('something I just came up with');
            })
    });

    it('should not update if the rule does not exist', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        delete rule['id'];
        delete rule['updatedAt'];
        delete rule['createdAt'];

        const ruleId = "abcdefabcdefabcdefabcdef";
        const response = await request(app)
            .patch(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule);
        expect(response.statusCode).toBe(404);
        expect(response.body).toStrictEqual("");
    });

    it('should return a valid rule if updated', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const rule = policyObj.toObject().rules[0];
        rule.name = 'something I just came up with';
        const response = await request(app)
            .patch(`/rules/${rule.id}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .send(rule);
        const ruleObj = new Rule(response.body);
        try {
            await ruleObj.validateSync();
            expect(true).toBe(true);
        } catch (error) {
            expect(true).toBe(false);
        }
    });
})