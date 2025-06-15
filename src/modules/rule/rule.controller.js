import asyncHandler from "../../common/utils/asyncHandler.js";
import ruleService from "./rule.service.js";
import Constants from "../../common/config/constants.js";

const ruleController = {
    /**
     * Get rules
     * Expecting:
     *  req.query['policy.status']
     *  req.query['policy.author']
     *  req.query['policy.tenantId']
     *  req.query['name']
     *  req.query['description']
     *  req.query['status']
     *  req.query['target.scope']
     *  req.query['target.id']
     *  req.query['geographies']
     *  req.query['action.type']
     *  req.query['with_policy']
     */
    getRules: asyncHandler(async (req, res) => {
        const rules = await ruleService.getRules({
            policy_status: req.query['policy.status'],
            policy_author: req.query['policy.author'],
            policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : req.query['policy.tenantId'],
            rule_name: req.query['name'],
            rule_description: req.query['description'],
            rule_status: req.query['status'],
            rule_target_scope: req.query['target.scope'],
            rule_target_id: req.query['target.id'],
            rule_geographies: req.query['geographies'],
            rule_action_type: req.query['action.type'],
            with_policy: req.query['with_policy']
        })
        res.json(rules);
    }),
    /**
     * Get a rule
     * Expecting:
     *  req.params['id']
     */
    getRule: asyncHandler(async (req, res) => {
        const rule = await ruleService.getRules({
            rule_id: req.params.id,
            policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
        });
        if (rule && rule.length > 0) {
            res.json(rule[0]);
        } else {
            res.status(404).json({message: 'Rule not found.'});
        }
    }),
    /**
     * Update a rule
     */
    updateRule: asyncHandler(async (req, res) => {
        const rule = await ruleService.updateRule({
            rule_id: req.params.id,
            policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined
        }, req.body)
        res.status(200).json(rule);
    })
};

export default ruleController;