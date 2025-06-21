import { Policy } from './policy.model.js';
import { ForbiddenCustomError, NotFoundCustomError, ValidationCustomError } from "../../common/errors/customErrors.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const PolicyService = {
    /**
     * Get policies
     * @param query - object with these optional fields
     *          status - enum[active,inactive]
     *          author - string (email)
     *          tenantId - int
     *          with_rules - boolean
     *
     */
    getPolicies: async (query) => {
        let match_obj = {};

        let project_obj = {
            'rules': 0
        };

        if (query['status']) {
            match_obj['status'] = query['status'];
        }

        if (query['author']) {
            match_obj['author'] = query['author'];
        }

        if (query['tenantId']) {
            match_obj['tenantId'] = query['tenantId'];
        }

        if (query['with_rules']) {
            delete project_obj['rules']
        }

        let aggregate_pipeline = [
            {$match: match_obj},
        ];
        if (Object.keys(project_obj).length > 0) {
            aggregate_pipeline.push({$project: project_obj});
        }

        const policies =  await Policy.aggregate(aggregate_pipeline);
        return policies.map(policy => {
            return new Policy(policy).toObject();
        });
    },
    /**
     * Get policy by identifier
     * @param query - object with these optional fields:
     *          tenantId - int
     *          id - int
     */
    getPolicyById: async (query) => {
        const policy = await Policy.findOne({ _id: new ObjectId(query['id']) });

        if (policy && policy.tenantId) {
            if (policy.tenantId !== query.tenantId) {
                throw new ForbiddenCustomError();
            } else {
                return policy.toObject();
            }
        } else {
            throw new NotFoundCustomError();
        }
    },
    /**
     * Create a new policy
     * @param query - object with these optional fields:
     *          tenantId
     *          author
     * @param policy
     */
    createPolicy: async (query, policy) => {
        const newPolicy = new Policy(policy);
        // very important to override the tenantId & author !!!!
        if (query['tenantId']) {
            newPolicy.tenantId = query['tenantId'];
        }
        if (query['author']) {
            newPolicy.author = query['author'];
        }
        newPolicy.rules.forEach(rule => {
            rule.author = query['author'];
        })

        try {
            await newPolicy.validateSync()
        } catch (error) {
            console.log(error);
            throw new ValidationCustomError();
        }

        await newPolicy.save();
        return newPolicy.toObject();
    },
    /**
     * Delete a policy
     * @param query - object with these optional fields:
     *          tenantId
     *          id
     */
    deletePolicy: async (query) => {
        // we need this to maybe throw error if the access to the policy is denied
        await PolicyService.getPolicyById({id: query.id, tenantId: query.tenantId});

        let match_obj = {};

        if (query.id) {
            match_obj['_id'] = query.id;
        }

        if (query.tenantId) {
            match_obj['tenantId'] = query.tenantId;
        }

        const result = await Policy.deleteOne(match_obj);
        if (result) {
            if (result.deletedCount === 1) {
                return true;
            } else {
                throw new NotFoundCustomError();
            }
        }
    }
};

export default PolicyService;
