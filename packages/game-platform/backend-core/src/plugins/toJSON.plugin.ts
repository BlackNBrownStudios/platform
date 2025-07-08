/**
 * Mongoose plugin to convert documents to JSON
 * Removes _id, __v, and converts _id to id
 */
export const toJSON = (schema: any) => {
  let transform: Function;
  
  if (schema.options.toJSON && schema.options.toJSON.transform) {
    transform = schema.options.toJSON.transform;
  }

  schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
    transform(doc: any, ret: any, options: any) {
      // Remove private fields
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          delete ret[path];
        }
      });

      // Convert _id to id
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      
      // Remove __v
      delete ret.__v;
      
      // Remove password
      delete ret.password;
      
      // Apply any existing transform
      if (transform) {
        return transform(doc, ret, options);
      }
      
      return ret;
    },
  });
};