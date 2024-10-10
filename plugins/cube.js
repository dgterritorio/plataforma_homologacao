import Vue from 'vue'
import { QueryBuilder } from "@cubejs-client/vue";
import { isQueryPresent, ResultSet } from '@cubejs-client/core';

// Hacking solution obviously,
// but we want to avoid inheriting the parent mounted function
QueryBuilder.mounted = function () { }

// We just add the try catch for the dryRun
Vue.component('cube-query-builder', {
    extends: QueryBuilder,

    mounted: async function () {
        this.meta = await this.cubejsApi.meta();

        this.copyQueryFromProps();

        if (isQueryPresent(this.initialQuery)) {
            try {
                const dryRunResponse = await this.cubejsApi.dryRun(this.initialQuery);

                this.pivotConfig = ResultSet.getNormalizedPivotConfig(
                    dryRunResponse?.pivotQuery || {},
                    this.pivotConfig
                );
            } catch (error) {
                console.error(error)
            }
        }
    },
});
