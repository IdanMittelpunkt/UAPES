import asyncHandler from "../../common/utils/asyncHandler.js";
import ruleService from "./rule.service.js";

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
     *  req.query['geography']
     *  req.query['action.type']
     *  req.query['with_policy']
     */
    getRules: asyncHandler(async (req, res) => {
        const rules = await ruleService.getRules({
            policy_status: req.query['policy.status'],
            policy_author: req.query['policy.author'],
            policy_tenantId: req.app_context[req.app_context.APPCONTEXT_TENANT_KEY] || req.query['policy.tenantId'],
            rule_name: req.query['name'],
            rule_description: req.query['description'],
            rule_status: req.query['status'],
            rule_target_scope: req.query['target.scope'],
            rule_target_id: req.query['target.id'],
            rule_geography: req.query['geography'],
            rule_action_type: req.query['action.type'],
            with_policy: req.query['with_policy']
        })
        res.json(rules);
    })
};

export default ruleController;