import mongoose from 'mongoose';
import Constants from '../../common/config/constants.js';

// a schema common to both condition tree node or leaf
const ConditionBaseSchema = new mongoose.Schema(
    {
        "element_type": {
            type: "String",
            "required": true,
            trim: true,
            enum: Constants.ELEMENT_TYPE
        },
        "element": {
           type: mongoose.Schema.Types.Mixed,
           required: true,
           validate: {
               validator: function (v) {
                   switch (this.element_type) {
                       case Constants.ELEMENT_TYPE_LEAF:
                           const validationResult = new mongoose.Document(v, ConditionLeafSchema).validateSync()
                           if (validationResult) {
                               return false;
                           }
                           break;
                       case Constants.ELEMENT_TYPE_NODE:
                           const validationResult_ = new mongoose.Document(v, ConditionNodeSchema).validateSync()
                           if (validationResult_) {
                               return false;
                           }
                           break;
                   }
                   return true;
               }
           }
        }
    }
);

// a schema of a condition tree leaf
const ConditionLeafSchema = new mongoose.Schema({
    attribute: {
        type: "String",
        "required": true,
        trim: true,
        enum: Constants.ATTRIBUTE
    },
    operator: {
        type: "String",
        "required": true,
        trim: true,
        enum: Constants.OPERATOR
    },
    values: {
        type: [String],
        "required": true,
        validate: {
            validator: function (v) {
                if (Constants.OPERATOR_WITH_MORE_VALUES.includes(this.operator)) {
                    return v.length >= 1;
                } else {
                    return v.length === 1;
                }
            }
        }
    }
});

// a schema of a condition tree node
const ConditionNodeSchema = new mongoose.Schema({
    operator: {
        type: "String",
        "required": true,
        trim: true,
        enum: Constants.BOOLEAN_OPERATOR
    },

})

// we must build the ConditionNodeSchema this way, in two steps, because of the "chicken and the egg".
ConditionNodeSchema.add({
    operands: {
        type: [ConditionBaseSchema],
        "required": true,
        validate: {
            validator: function (v) {
                switch (this.operator) {
                    case Constants.BOOLEAN_OPERATOR_AND:
                        return v.length > 1;
                    case Constants.BOOLEAN_OPERATOR_OR:
                        return v.length > 1;
                    case Constants.BOOLEAN_OPERATOR_NOT:
                        return v.length === 1;
                }
            },
            message: `Rule must have at least one operand.`
        }
    }
})

export const RuleSchema = new mongoose.Schema({
    // rule schema version
    version: {
        type: "Number",
        default: 1,
        min: 1,
        integer: true
    },
    // rule name
    name: {
        type: "String",
        "required": true,
        trim: true,
        maxlength: Constants.POLICY_RULE_NAME_MAX_LENGTH
    },
    // rule description
    description: {
        type: "String",
        trim: true,
        maxlength: Constants.POLICY_RULE_DESCRIPTION_MAX_LENGTH
    },
    // rule status
    status: {
        type: "String",
        "required": true,
        trim: true,
        enum: Constants.RULE_STATUS
    },
    // rule priority
    priority: {
        type: "Number",
        default: 1,
        min: 1,
        integer: true
    },
    target: new mongoose.Schema({
        scope: {
            type: "String",
            "required": true,
            trim: true,
            enum: Constants.RULE_SCOPE
        },
        id: {
            type: "String",
            "required": function () {
                return Constants.RULE_SCOPE_WITH_ID.includes(this.scope);
            },
            trim: true
        }
    }, {
        "required": true
    }),
    // rule geographies
    geographies: {
        type: [String],
        enum: Constants.GEOGRAPHY,
        "required": true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: `Rule must have at least one geography.`
        }
    },
    condition: {
        type: ConditionBaseSchema,
        "required": true
    },
    action: new mongoose.Schema({
        "type": {
            type: "String",
            "required": true,
            trim: true,
            enum: Constants.RULE_ACTION
        }
    },
    {
            "required": true
    }),
    // rule author
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
    // optional field to mark that the rule MUST be distributed in the next rule distribution
    // but not because it was modified since the previous rule distribution
    markedForDistribution: {
        type: Boolean
    }
}, {
    timestamps: true
});

