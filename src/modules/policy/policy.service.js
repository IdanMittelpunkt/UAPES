import Policy from './policy.model.js';

const policyService = {
    /**
     * Get policies
     * @param query - object with these optional fields
     *          status - enum[active,inactive]
     *          author - string
     *          tenantId - int
     *          with_rules - boolean
     *
     */
    getPolicies: async (query) => {
        let match_obj = {};

        let project_obj = {
            'rules': 0
        };

        if (query['status']) {
            match_obj['status'] = query['status'];
        }

        if (query['author']) {
            match_obj['author'] = query['author'];
        }

        if (query['tenantId']) {
            match_obj['tenantId'] = query['tenantId'];
        }

        if (query['with_rules']) {
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

    /**
     * Get policy by identifier
     * @param query - object with these optional fields
     *          tenantId - int
     *          id - int
     */
    getPolicyById: async (query) => {
        let match_obj = {};

        if (query.id) {
            match_obj['_id'] = query.id;
        }

        if (query.tenantId) {
            match_obj['tenantId'] = query.tenantId;
        }

        return await Policy.findOne(match_obj);
    },
    /**
     * Create a new policy
     * @param query - object with these optional fields
     *          tenantId
     *          author
     * @param policy
     */
    createPolicy: async (query, policy) => {
        const newPolicy = new Policy(policy);
        // very important to override the tenantId & author !!!!
        if (query['tenantId']) {
            newPolicy.tenantId = query['tenantId'];
        }
        if (query['author']) {
            newPolicy.author = query['author'];
        }
        newPolicy.rules.forEach(rule => {
            rule.author = query['author'];
        })

        return await newPolicy.save();
    },
    /**
     * Delete a policy
     * @param query - object with these optional fields
     *          tenantId
     *          id
     */
    deletePolicy: async (query) => {
        let match_obj = {};

        if (query.id) {
            match_obj['_id'] = query.id;
        }

        if (query.tenantId) {
            match_obj['tenantId'] = query.tenantId;
        }

        return await Policy.deleteOne(match_obj);
    }
};

export default policyService;
