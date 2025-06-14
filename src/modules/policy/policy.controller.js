import asyncHandler from "../../common/utils/asyncHandler.js";
import policyService from "./policy.service.js";

const policyController = {
    createPolicy: asyncHandler(async (req, res) => {
        const newPolicy = await policyService.createPolicy(req.body, req.app_context);
        res.status(201).json(newPolicy);
    })
};

export default policyController;