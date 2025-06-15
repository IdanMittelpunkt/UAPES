import Policy from '../policy/policy.model.js';
import mongoose from 'mongoose';
const {ObjectId} = mongoose.Types;

const ruleService = {
    /**
     * Get rules
     * @param query - object with these optional fields
     *          policy_status - active/inactive
     *          policy_author - string
     *          policy_tenantId - int
     *          rule_id
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

        if (query['rule_id']) {
            rule_match_obj['rules._id'] = new ObjectId(query['rule_id']);
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
        aggregate_pipeline.push({
            $replaceWith: '$rules'
        });

        return await Policy.aggregate(aggregate_pipeline);
    },

    /**
     * Update a rule
     * @param query - object with these optional fields
     *          rule_id
     *          policy_tenantId
     * @param rule
     * @returns {Promise<void>}
     */
    updateRule: async (query, rule) => {
        const match_obj = {
            'rules._id': new ObjectId(query['rule_id']),
            'tenantId': query['policy_tenantId']
        };

        let set_obj = {};

        if (rule.name) {
            set_obj['rules.$.name'] = rule.name;
        }

        if (rule.description) {
            set_obj['rules.$.description'] = rule.description;
        }

        if (rule.status) {
            set_obj['rules.$.status'] = rule.status;
        }

        if (rule.target) {
            set_obj['rules.$.target'] = rule.target;
        }

        if (rule.geographies) {
            set_obj['rules.$.geographies'] = rule.geographies;
        }

        if (rule.condition) {
            set_obj['rules.$.condition'] = rule.condition;
        }

        if (rule.action) {
            set_obj['rules.$.action'] = rule.action;
        }

        return await Policy.findOneAndUpdate(
            match_obj,
            {
                $set: set_obj
            }, {
                new: true,
                upsert: true,
                runValidators: true,
                context: 'query'
            }
        );
    }
};

export default ruleService;
