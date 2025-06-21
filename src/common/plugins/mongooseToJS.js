/*
    A plugin to hide away from the consumers of the Service layer that we are dealing with MongoDB/Mongoose
 */
export default function mongooseToJS(schema) {
    function deletePropertyRecursively(obj, propertyToDelete) {
        // If the current item is an array, iterate over its elements and apply the function
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                deletePropertyRecursively(obj[i], propertyToDelete);
            }
        }
        // If the current item is an object (and not null), process its properties
        else if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                // Check if the object has the property directly
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    // If the current key matches the property to delete, remove it
                    if (key === propertyToDelete) {
                        delete obj[key];
                    }
                    // If the value of the current key is an object or array, recurse
                    else if (typeof obj[key] === 'object' && obj[key] !== null) {
                        deletePropertyRecursively(obj[key], propertyToDelete);
                    }
                }
            }
        }
    }

    function transform(doc, ret, options) {
        ret.id = ret._id.toString();
        deletePropertyRecursively(ret, '_id');
        deletePropertyRecursively(ret, '__v');
        if (ret.rules && ret.rules.length === 0) {
            delete ret.rules;
        }
        return ret;
    }

    schema.set('toObject', {
        transform: transform,
        virtuals: false,
        versionKey: false
    })
    schema.set('toJSON', {
        transform: transform,
        virtuals: false,
        versionKey: false
    })

}