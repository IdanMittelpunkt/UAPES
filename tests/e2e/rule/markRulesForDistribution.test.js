import { __beforeAll, __beforeEach, __afterAll } from '../setup.js';
import { Policy } from '../../../src/modules/policy/policy.model.js';
import Constants from "../../../src/common/config/constants.js";
import app from '../../../src/app.js';
import request from 'supertest';

describe('POST /rules/distribute/mark', () => {
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
            .post('/rules/distribute/mark')
            .query({group_ids: '100'})
            .expect(200);
    });

    it('should be disallowed to call without group_ids', async () => {
        await request(app)
            .post('/rules/distribute/mark')
            .expect(500);
    });

    it('should accept group_ids as an array', async () => {
        await request(app)
            .post('/rules/distribute/mark')
            .query({group_ids: '100,200,300,400'})
            .expect(200);
    });

    it('should mark the rules with the specified group_ids as distributed - single value', async () => {
        await request(app)
            .post('/rules/distribute/mark')
            .query({group_ids: '100'})
            .expect(200);
        const policies = await Policy.find();
        policies.forEach(policy => {
           policy.rules.forEach(rule => {
             if (rule.markedForDistribution) {
                 expect(policy.status).toBe(Constants.POLICY_STATUS_ACTIVE);
                 expect(rule.status).toBe(Constants.RULE_STATUS_ACTIVE);
                 expect(rule.target.scope).toBe('group');
                 expect(rule.target.id).toBe('100')
             }
             if (policy.status === Constants.POLICY_STATUS_ACTIVE) {
                 if (rule.status === Constants.RULE_STATUS_ACTIVE) {
                     if (rule.target.scope === 'group') {
                         if (rule.target.id === '100') {
                             expect(rule.markedForDistribution).toBe(true);
                         }
                     }
                 }
             }
           });
        });
    });

    it('should mark the rules with the specified group_ids as distributed - multiple values', async () => {
        await request(app)
            .post('/rules/distribute/mark')
            .query({group_ids: '100,200'})
            .expect(200);
        const policies = await Policy.find();
        policies.forEach(policy => {
            policy.rules.forEach(rule => {
                if (rule.markedForDistribution) {
                    expect(policy.status).toBe(Constants.POLICY_STATUS_ACTIVE);
                    expect(rule.status).toBe(Constants.RULE_STATUS_ACTIVE);
                    expect(rule.target.scope).toBe('group');
                    expect(['100', '200']).toContain(rule.target.id);
                }
                if (policy.status === Constants.POLICY_STATUS_ACTIVE) {
                    if (rule.status === Constants.RULE_STATUS_ACTIVE) {
                        if (rule.target.scope === 'group') {
                            if ( (rule.target.id === '100') || (rule.target.id === '200') ) {
                                expect(rule.markedForDistribution).toBe(true);
                            }
                        }
                    }
                }
            });
        });
    });

});