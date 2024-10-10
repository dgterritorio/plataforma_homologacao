export default ({ store }, inject) => {
   
    /**
     * Registers a module if it not registered
     * @param {string} moduleId 
     * @param {object} module 
     */
    function registerModule(name, module, nested) {

        // If nested, this is an array (vuex api)
        let moduleId = !nested ? name : name.split('/');

        try {
            // Check if module is already registerd
            if (store.hasModule(moduleId)) {
                // console.log("[Vuex] Store exists! Skipping..")
                
                return true;
            }

            // Register the module
            store.registerModule(moduleId, module);
        } catch (e) {
            // console.log("[Err] Error registering store");
            return false;
        }
        
        return true;
    }

    /**
     * Registers a module if it not registered
     * @param {string} moduleId 
     * @param {object} module 
     */
    function unregisterModule(moduleId) {
        try {
            // Check if module is already registerd
            if (store.hasModule(moduleId)) {
                // console.log("[Vuex] Store does not exist! Skipping..");

                return true;
            }

            // Register the module
            store.unregisterModule(moduleId);

        } catch (e) {
            // console.log("[Err] Error registering store");
            return false;
        }
        
        return true;
    }



    // Inject api to $vuex
    inject('vuex', {
        registerModule: registerModule,
        unregisterModule: unregisterModule
    });
}