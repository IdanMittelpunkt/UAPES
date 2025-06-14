import Policy from './policy.model.js';

const policyService = {
    createPolicy: async (policy, tenantId) => {
        const newPolicy = new Policy(policy);
        newPolicy.tenantId = tenantId;
        return await newPolicy.save();
    }
};

export default policyService;
