
export default function ({ store }, inject) {

  /**
   * Utility to register vuex-orm models into the database.
   * Returns the registered model.
   * @param {} model 
   */
  async function registerModel(model) {
    try {
      const db = store.$db();

      const entities = db.entities;

      if (entities.find(o => o.name === model.entity)) {
        return db.model(model);
      } else {
        const res = await db.register(model);

        return db.model(model);
      }
    } catch (e) {
      console.log("Error registering store: ");

      return null;
    }
  }

  // Inject to context
  inject('ormutils', {
    registerModel: registerModel
  });
}
