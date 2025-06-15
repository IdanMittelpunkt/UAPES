import asyncHandler from "../../common/utils/asyncHandler.js";
import policyService from "./policy.service.js";
import Constants from "../../common/config/constants.js";

const policyController = {
    /**
     * Get Policies
     * Expecting:
     *  req.query['status']
     *  req.query['author']
     *  req.query['tenantId']
     *  req.query['with_rules']
     */
    getPolicies: asyncHandler(async (req, res) => {
        const policies = await policyService.getPolicies({
            status: req.query['status'],
            author: req.query['author'],
            tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : req.query['tenantId'],
            with_rules: req.query['with_rules'] === Constants.BOOLEAN_VALUE_TRUE
        });
        res.json(policies);
    }),
    /**
     * Get a policy
     * Expecting:
     *  req.params['id']
     */
    getPolicy: asyncHandler(async (req, res) => {
        const policy = await policyService.getPolicyById({
            id: req.params.id,
            tenantId: req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
        });
        if (!policy) {
            res.status(404);
        }
        res.json(policy);
    }),
    /**
     * Create a policy
     */
    createPolicy: asyncHandler(async (req, res) => {
        const newPolicy = await policyService.createPolicy({
            'tenantId': req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
            'author': req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined
        }, req.body);
        res.status(201).json(newPolicy);
    }),
    /**
     * Delete a policy
     * Expecting:
     *  req.params['id']
     */
    deletePolicy: asyncHandler(async (req, res) => {
        const deletedPolicy = await policyService.deletePolicy({
            'tenantId': req.app_context ? req.app_context[Constants.APPCONTEXT_TENANT_KEY] : undefined,
            'id': req.params.id,
        });
        if (deletedPolicy.deletedCount === 0) {
            res.status(404).json({message: 'Policy not found.'});
        } else {
            res.status(200).json({message: 'Policy deleted successfully.'});
        }
    })
};

export default policyController;