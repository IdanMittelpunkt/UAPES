import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import app from '../../../src/app.js';
import request from 'supertest';
import mongoose from "mongoose";

describe('DELETE /policies/:id', () => {
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
        const policyId = policyObj.toObject()._id.toString();
        await request(app)
            .delete(`/policies/${policyId}`)
            .expect(401);
    });

    it('should be allowed to call with a valid authentication header', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const policyId = policyObj.toObject()._id.toString();
        await request(app)
            .delete(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
    });

    it('should delete the policy according to the specified id', async () => {
        const policyObj = await Policy.findOne({tenantId: 15});
        const policyId = policyObj.toObject()._id.toString();
        await request(app)
            .delete(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(200);
        const againPolicyObj = await Policy.findOne({_id: new mongoose.Types.ObjectId(policyId)});
        expect(againPolicyObj).toBeNull();
    });

    it('should not delete a policy of a tenant that is not in the JWT', async () => {
        const policyObj = await Policy.findOne({tenantId: 25});
        const policyId = policyObj.toObject()._id.toString();
        await request(app)
            .delete(`/policies/${policyId}`)
            .set('Authorization', 'Bearer ' + process.env.JWT_TOKEN)
            .expect(404);
        const againPolicyObj = await Policy.findOne({_id: new mongoose.Types.ObjectId(policyId)});
        expect(againPolicyObj).not.toBeNull();
    });
});
