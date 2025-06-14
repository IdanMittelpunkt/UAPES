import Policy from './policy.model.js';
import Constants from '../../common/config/constants.js';

const policyService = {
    getPolicies: async (app_context, author, status, with_rules) => {
        let match_obj = {
            tenantId: app_context[Constants.APPCONTEXT_TENANT_KEY]
        }

        let project_obj = {
            'rules': 0
        };

        if (author) {
            match_obj['author'] = author;
        }
        if (status) {
            match_obj['status'] = status;
        }
        if (with_rules) {
            delete project_obj['rules']
        }

        let aggregate_pipeline = [
            {$match: match_obj},
        ];
        if (Object.keys(project_obj).length > 0) {
            aggregate_pipeline.push({$project: project_obj});
        }

        return await Policy.aggregate(aggregate_pipeline);
    },
    getPolicyById: async (app_context, id) => {
        return await Policy.findById(id);
    },
    createPolicy: async (app_context, policy) => {
        const newPolicy = new Policy(policy);
        // very important to override the tenantId !!!!
        newPolicy.tenantId = app_context[Constants.APPCONTEXT_TENANT_KEY];
        return await newPolicy.save();
    },
    deletePolicy: async (app_context, id) => {
        return await Policy.deleteOne({
            _id: id,
            tenantId: app_context[Constants.APPCONTEXT_TENANT_KEY]
        });
    }
};

export default policyService;
