import asyncHandler from "../../common/utils/asyncHandler.js";
import policyService from "./policy.service.js";

const policyController = {
    createPolicy: asyncHandler(async (req, res) => {
        const newPolicy = await policyService.createPolicy(req.app_context, req.body);
        res.status(201).json(newPolicy);
    }),
    getPolicies: asyncHandler(async (req, res) => {
        const policies = await policyService.getPolicies(
            req.app_context,
            req.query.author,
            req.query.status,
            req.query.with_rules === 'true'
        );
        res.json(policies);
    }),
    getPolicy: asyncHandler(async (req, res) => {
        const policy = await policyService.getPolicyById(req.app_context, req.params.id);
        if (!policy) {
            res.status(404);
            throw new Error(`Policy with id ${req.params.id} not found.`);
        }
        res.json(policy);
    })
};

export default policyController;