import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import app from '../../../src/app.js';
import request from 'supertest';
import mongoose from "mongoose";

describe('DELETE /rules/:id', () => {
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
            .delete(`/rules/${ruleId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .delete(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should delete the rules according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .delete(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
        const againPolicyObj = await Policy.findOne({"rule._id": new mongoose.Types.ObjectId(ruleId)});
        expect(againPolicyObj).toBeNull();
    });

    it('should not delete a rule of a policy whose tenant is not in the JWT', async () => {
        const policyObj = await Policy.findOne({tenantId: 25});
        const ruleId = policyObj.toObject().rules[0]._id.toString();
        await request(app)
            .delete(`/rules/${ruleId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(409);
        const againPolicyObj = await Policy.findOne({"rules._id": new mongoose.Types.ObjectId(ruleId)});
        expect(againPolicyObj).not.toBeNull();
    });
})