import Policy from './policy.model.js';

const policyService = {
    createPolicy: async (policy, app_context) => {
        const newPolicy = new Policy(policy);
        // very important to override the tenantId !!!!
        newPolicy.tenantId = app_context.tenant;
        return await newPolicy.save();
    }
};

export default policyService;
