import asyncHandler from "../../common/utils/asyncHandler.js";
import policyService from "./policy.service.js";
import Constants from "../../common/config/constants.js";

export default {
    /**
     * Get Policies
     * Expecting:
     *  req.query['status'] - active/inactive
     *  req.query['author'] - email
     *  req.query['tenantId'] - int
     *  req.query['with_rules'] - true/false
     */
    getPolicies: asyncHandler(async (req, res, next) => {
        try {
            const policies = await policyService.getPolicies({
                status: req.query['status'],
                author: req.query['author'],
                tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : req.query['tenantId'],
                with_rules: req.query['with_rules'] === Constants.BOOLEAN_VALUE_TRUE
            });
            res.json(policies);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Get a policy
     * Expecting:
     *  req.params['id']
     */
    getPolicy: asyncHandler(async (req, res, next) => {
        try {
            const policy = await policyService.getPolicyById({
                id: req.params.id,
                tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
            });
            res.json(policy);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Create a policy
     * Expecting:
     *  request body
     */
    createPolicy: asyncHandler(async (req, res, next) => {
        try {
            const newPolicy = await policyService.createPolicy({
                'tenantId': req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
                'author': req.app_context ? req.app_context[Constants.APPCONETXT_USER_KEY] : undefined
            }, req.body);
            res.status(201).json(newPolicy);
        } catch (error) {
            next(error);
        }
    }),
    /**
     * Delete a policy
     * Expecting:
     *  req.params['id']
     */
    deletePolicy: asyncHandler(async (req, res, next) => {
        try {
            await policyService.deletePolicy({
                'tenantId': req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
                'id': req.params.id,
            });
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    })
};