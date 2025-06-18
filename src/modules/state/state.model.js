import mongoose from 'mongoose';
import Constants from '../../common/config/constants.js';

/*
    A mongodb collection of states.
    For now, it holds a single "state", which is the last time we had a successful rule distribution
 */

export const StateSchema = new mongoose.Schema(
    {
        'type': {
            type: "String",
            default: Constants.RULE_LAST_DISTRIBUTION_TYPE,
            trim: true,
        }
    },
    {
        timestamps: true
    }
);

export const State = mongoose.model('State', StateSchema);