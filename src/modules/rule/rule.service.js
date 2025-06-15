import Policy from '../policy/policy.model.js';

const ruleService = {
    /**
     * Get rules
     * @param query - object with these optional fields
     *          policy_status - active/inactive
     *          policy_author - string
     *          policy_tenantId - int
     *          rule_name - regex
     *          rule_description - regex
     *          rule_status - active/inactive
     *          rule_target_scope
     *          rule_target_id
     *          rule_geographies - array
     *          rule_action_type - allow/deny
     * @returns {Promise<void>}
     */
    getRules: async (query) => {
        let policy_match_obj = {};
        let rule_match_obj = {};
        let aggregate_pipeline = [];

        if (query['policy_status']) {
            policy_match_obj['status'] = query['policy_status'];
        }

        if (query['policy_author']) {
            policy_match_obj['author'] = query['policy_author'];
        }

        if (query['policy_tenantId']) {
            policy_match_obj['tenantId'] = query['policy_tenantId'];
        }

        if (query['rule_name']) {
            rule_match_obj['rules.name'] = {
                $regex: query['rule_name']
            };
        }

        if (query['rule_description']) {
            rule_match_obj['rules.description'] = {
                $regex: query['rule_description']
            };
        }

        if (query['rule_status']) {
            rule_match_obj['rules.status'] = query['rule_status'];
        }

        if (query['rule_target_scope']) {
            rule_match_obj['rules.target.scope'] = query['rule_target_scope'];
        }

        if (query['rule_target_id']) {
            rule_match_obj['rules.target.id'] = query['rule_target_id'];
        }

        if (query['rule_geographies']) {
            rule_match_obj['rules.geographies'] = {
                $in: query['rule_geographies'].split(',')
            };
        }

        if (query['rule_action_type']) {
            rule_match_obj['rules.action.type'] = query['rule_action_type'];
        }

        aggregate_pipeline.push({
            $match: policy_match_obj
        });
        aggregate_pipeline.push({
            $unwind: '$rules'
        });
        aggregate_pipeline.push({
            $match: rule_match_obj
        });
        aggregate_pipeline.push(
            {
                $replaceWith: '$rules'
            }
        );

        return await Policy.aggregate(aggregate_pipeline);
    }
};

export default ruleService;
