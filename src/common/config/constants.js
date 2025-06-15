/*
    we need to initiatlize first, or otherwise we won't be able to have self reference, as in:
    constants = {
        SOMETHING: constants.SOMETHING_ELSE
    }
 */
let constants = {
    APPCONTEXT_TENANT_KEY: 'tenant',
    APPCONETXT_USER_KEY: 'sub',
    ATTRIBUTE_SOURCE_IP_ADDRESS: 'source_ip_address',
    ATTRIBUTE_DESTINATION_IP_ADDRESS: 'destination_ip_address',
    ATTRIBUTE_DESTINATION_PORT: 'destination_port',
    ATTRIBUTE_DESTINATION_DOMAIN: 'destination_domain',
    ATTRIBUTE_DESTINATION_PROTOCOL: 'destination_protocol',
    BOOLEAN_OPERATOR_AND: 'and',
    BOOLEAN_OPERATOR_NOT: 'not',
    BOOLEAN_OPERATOR_OR: 'or',
    BOOLEAN_VALUE_TRUE: 'true',
    BOOLEAN_VALUE_FALSE: 'false',
    COLLECTION_NAME: 'policies',
    DB_NAME: 'rules',
    ELEMENT_TYPE_LEAF: 'leaf',
    ELEMENT_TYPE_NODE: 'node',
    POLICY_DESCRIPTION_MAX_LENGTH: 1000,
    POLICY_NAME_MAX_LENGTH: 100,
    POLICY_STATUS_ACTIVE: 'active',
    POLICY_STATUS_INACTIVE: 'inactive',
    RULE_ACTION_ALLOW: 'allow',
    RULE_ACTION_DENY: 'deny',
    RULE_SCOPE_USER: 'user',
    RULE_SCOPE_GROUP: 'group',
    RULE_SCOPE_TENANT: 'tenant',
    RULE_SCOPE_GLOBAL: 'global',
    RULE_STATUS_ACTIVE: 'active',
    RULE_STATUS_INACTIVE: 'inactive',
}

let constants_arrays = {
    ATTRIBUTE: [constants.ATTRIBUTE_SOURCE_IP_ADDRESS, constants.ATTRIBUTE_DESTINATION_IP_ADDRESS, constants.ATTRIBUTE_DESTINATION_PORT, constants.ATTRIBUTE_DESTINATION_DOMAIN, constants.ATTRIBUTE_DESTINATION_PROTOCOL],
    BOOLEAN_OPERATOR: [constants.BOOLEAN_OPERATOR_AND, constants.BOOLEAN_OPERATOR_OR, constants.BOOLEAN_OPERATOR_NOT],
    BOOLEAN_VALUE: [constants.BOOLEAN_VALUE_TRUE, constants.BOOLEAN_VALUE_FALSE],
    ELEMENT_TYPE: [constants.ELEMENT_TYPE_LEAF, constants.ELEMENT_TYPE_NODE],
    POLICY_STATUS: [constants.POLICY_STATUS_ACTIVE, constants.POLICY_STATUS_INACTIVE],
    GEOGRAPHY: ['US', 'CA', 'FR', 'IT', 'DE'],
    OPERATOR: ['eq', 'ne', 'lt', 'lte', 'gt', 'gte', 'in', 'not_in', 'contains', 'not_contains', 'starts_with', 'ends_with', 'regex', 'not_regex'],
    OPERATOR_WITH_MORE_VALUES: ['in', 'not_in'],
    RULE_ACTION: [constants.RULE_ACTION_ALLOW, constants.RULE_ACTION_DENY],
    RULE_SCOPE: [constants.RULE_SCOPE_USER, constants.RULE_SCOPE_GROUP, constants.RULE_SCOPE_TENANT, constants.RULE_SCOPE_GLOBAL, constants.RULE_SCOPE_WITH_ID],
    RULE_SCOPE_WITH_ID: [constants.RULE_SCOPE_USER, constants.RULE_SCOPE_GROUP],
    RULE_STATUS: [constants.RULE_STATUS_ACTIVE, constants.RULE_STATUS_INACTIVE],
}

export default { ...constants, ...constants_arrays}