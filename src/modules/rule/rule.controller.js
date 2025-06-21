import asyncHandler from "../../common/utils/asyncHandler.js";
import ruleService from "./rule.service.js";
import Constants from "../../common/config/constants.js";

export default {
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
     */
    getRules: asyncHandler(async (req, res, next) => {
        try {
            const rules = await ruleService.getRules({
                policy_status: req.query['policy.status'],
                policy_author: req.query['policy.author'],
                policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : req.query['policy.tenantId'],
                rule_name: req.query['name'],
                rule_description: req.query['description'],
                rule_status: req.query['status'],
                rule_target_scope: req.query['target.scope'],
                rule_target_id: req.query['target.id'],
                rule_geographies: req.query['geographies'] ? req.query['geographies'].split(',') : undefined,
                rule_action_type: req.query['action.type']
            })
            res.json(rules);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Get a rule
     * Expecting:
     *  req.params['id']
     */
    getRule: asyncHandler(async (req, res, next) => {
        try {
            const rule = await ruleService.getRuleById({
                id: req.params.id,
                tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
            });
            res.json(rule);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Update a rule
     * Expecting:
     *  req.params['id']
     */
    updateRule: asyncHandler(async (req, res, next) => {
        try {
            const rule = await ruleService.updateRule({
                id: req.params.id,
                policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined
            }, req.body)
            res.status(200).json(rule);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Delete a rule
     * Expecting:
     *  req.params['id']
     */
    deleteRule: asyncHandler(async (req, res, next) => {
        try {
            await ruleService.deleteRule({
                rule_id: req.params.id,
                policy_tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined
            })
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Distribute all new/updated rules to live agents
     */
    distributeRules: asyncHandler(async (req, res) => {
        const state = await ruleService.distributeRules();
        res.status(200).json(state);
    }),
    /**
     * Mark rules for distribution
     * Relevant when a group of users (from the IdP) referenced in a rule was modified
     *  Expecting:
     *      req.query['group_ids'] (e.g. '100,200,300,400')
     */
    markRulesForDistribution: asyncHandler(async (req, res) => {
        await ruleService.markRulesForDistribution(req.query['group_ids'].split(','));
        res.status(200).json({message: 'Rules marked for distribution.'});
    })
};