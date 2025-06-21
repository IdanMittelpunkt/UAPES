/*
    A plugin to hide away from the consumers of the Service layer that we are dealing with MongoDB/Mongoose
 */
export default function mongooseToJS(schema) {
    function transform(doc, ret, options) {
        delete ret._id;
        delete ret.__v;
        if (ret.rules && ret.rules.length === 0) {
            delete ret.rules;
        }
        return ret;
    }

    schema.set('toObject', {
        transform: transform,
        virtuals: true,
        versionKey: false
    })
    schema.set('toJSON', {
        transform: transform,
        virtuals: true,
        versionKey: false
    })

}