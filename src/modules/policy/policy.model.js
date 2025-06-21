import mongoose from 'mongoose';
import { RuleSchema } from '../rule/rule.model.js';
import Constants from '../../common/config/constants.js';
import mongooseToJS from '../../common/plugins/mongooseToJS.js';

export const PolicySchema = new mongoose.Schema({
    // policy schema version
    version: {
        type: "Number",
        default: 1,
        min: 1,
        integer: true
    },
    // policy name
    name: {
        type: "String",
        "required": true,
        trim: true,
        maxlength: Constants.POLICY_RULE_NAME_MAX_LENGTH,
    },
    // policy description
    description: {
        type: "String",
        trim: true,
        maxlength: Constants.POLICY_RULE_DESCRIPTION_MAX_LENGTH,
    },
    // policy status
    status: {
        type: "String",
        "required": true,
        trim: true,
        enum: Constants.POLICY_STATUS
    },
    // policy author
    author: {
        type: "String",
        "required": true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                // A common and reasonably robust regex for email validation
                // This regex is from: https://emailregex.com/ (modified for Mongoose syntax)
                return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: props => `${props.value} is not a valid email address.`
        }
    },
    // policy-tenant association
    tenantId: {
        type: "Number",
        "required": false,
        min: 1,
        integer: true
    },
    // policy rules
    rules: {
        type: [RuleSchema],
        "required": true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: `Policy must have at least one rule.`
        }
    }
}, {
    timestamps: true
});

PolicySchema.plugin(mongooseToJS);

export const Policy = mongoose.model('Policy', PolicySchema);
