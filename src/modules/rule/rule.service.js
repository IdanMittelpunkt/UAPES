import { Policy } from '../policy/policy.model.js';
import { State } from '../state/state.model.js';
import Constants from '../../common/config/constants.js';
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
     *          rule_geographies - array
     *          rule_action_type - allow/deny
     *          rule_updatedat_since - javascript Date object
     *          rule_markedForDistribution - boolean
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

        if (query['rule_geographies']) {
            rule_match_obj['rules.geographies'] = {
                $in: query['rule_geographies']
            };
        }

        if (query['rule_action_type']) {
            rule_match_obj['rules.action.type'] = query['rule_action_type'];
        }

        if (query['rule_updatedat_since']) {
            rule_match_obj['rules.updatedAt'] = {
                $gte: query['rule_updatedat_since']
            };
        }

        if (query['rule_markedForDistribution']) {
            if (Object.keys(rule_match_obj).length > 0) {
                rule_match_obj = {
                    $or: [
                        rule_match_obj,
                        {
                            'rules.markedForDistribution': true
                        }
                    ]
                }
            }
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
     * Updates a rule
     * @param query - object with these optional fields
     *          rule_id
     *          policy_tenantId
     * @param rule
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
                runValidators: true,
                context: 'query'
            }
        );
    },
    /**
     * Deletes a rule
     * @param query - object with these optional fields
     *          rule_id
     *          policy_tenantId
     */
    deleteRule: async (query) => {
        const match_obj = {
            'rules._id': new ObjectId(query['rule_id']),
            'tenantId': query['policy_tenantId']
        };
        return await Policy.findOneAndUpdate(
            match_obj,
            {
                $pull: {    // this will delete the rule from the policy
                    rules: {
                        _id: new ObjectId(query['rule_id'])
                    }
                }
            },
            {
                new: true
            }
        );
    },
    /**
     * Distributes rules to agents via Websockets
     */
    distributeRules: async () => {

        async function getLastRuleDistributionTimestamp() {
            let the_state = await State.findOne({
                type: Constants.RULE_LAST_DISTRIBUTION_TYPE
            });
            return the_state ? the_state.toObject().updatedAt : undefined;
        }

        async function updateLastRuleDistributionTimestamp(timestamp) {
            await State.findOneAndUpdate(
                {
                    type: Constants.RULE_LAST_DISTRIBUTION_TYPE
                },
                [
                    {
                        $set: {
                            updatedAt: timestamp
                        }
                    }
                ],
                {
                    timestamps: false,
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            );
        }

        async function actualRuleDistribution(rules) {
            if (rules && rules.length > 0) {
                // TODO:
                //  out of scope of this prototype as it involves more than a single HLD module !
                //  probably since this task is CPU intensive it should be offloaded to a worker thread
            }
        }

        const last_rule_distribution_timestamp = await getLastRuleDistributionTimestamp();
        const current_timestamp = new Date(Date.now());
        // calculate rules candidate for distribution
        const rules = await ruleService.getRules({
            policy_status: Constants.POLICY_STATUS_ACTIVE,
            rule_status: Constants.RULE_STATUS_ACTIVE,
            rule_updatedat_since: last_rule_distribution_timestamp ? last_rule_distribution_timestamp : new  Date(Date.now() - Constants.RULE_LAST_DISTRIBUTION_LOOKBACK_MINUTES * 60 * 1000),
            rule_markedForDistribution: true
        });
        // distribute
        await actualRuleDistribution(rules);
        // clear any marked for distribution rules
        await ruleService.unmarkRulesForDistribution();
        // touch the timestamp after distribution is over
        await updateLastRuleDistributionTimestamp(current_timestamp);
    },
    /**
     * Marks rules for next rule distribution
     * (without touching any parent document or sub-document's updatedAt).
     * E.g., if a group changed then a rule addressing this group (directly or indirectly) should be distributed
     */
    markRulesForDistribution: async (group_id_array) => {
        await Policy.updateMany(
            {
                'status': Constants.POLICY_STATUS_ACTIVE,
                'rules.status': Constants.RULE_STATUS_ACTIVE,
                'rules.target.id': {
                    $in: group_id_array
                },
            },
            [
                {
                    $set: {
                        rules: {
                            $map: {
                                input: '$rules',
                                as: 'rule',
                                in: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                {$eq: ['$$rule.status', Constants.RULE_STATUS_ACTIVE]},
                                                {$in: ['$$rule.target.id', group_id_array]}
                                            ]
                                        },
                                        then: {
                                            $mergeObjects: [
                                                '$$rule',
                                                {
                                                    'markedForDistribution': true
                                                }
                                            ]
                                        },
                                        else: '$$rule'
                                    }
                                }
                            }
                        }
                    }
                }
            ],
            { timestamps: false }
        );
    },
    /**
     * Unmarks rules for next rule distribution
     * (without touching any parent document or sub-document's updatedAt).
     */
    unmarkRulesForDistribution: async () => {
        await Policy.updateMany(
            {
                'rules.markedForDistribution': true
            },
            {
               "$unset": {
                    'rules.$[ruleElem].markedForDistribution': ''
                }
            },
            {
                arrayFilters: [
                    { 'ruleElem.status': 'active', 'ruleElem.markedForDistribution': { $exists: true }}
                ],
                timestamps: false
            }
        );
    }
};

export default ruleService;
