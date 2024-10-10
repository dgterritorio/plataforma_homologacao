class PGTransaction {

    constructor(client) {
        this.client = client;  // pg client
        this.transac = false;  // is in transaction mode
        this.released = false; // pg client is released
    }

    /**
     * Begins a transaction
     */
    async begin() {
        let error;

        try {
            if (!this.getTransac()) {

                await this.client.query('BEGIN');

                this.setTransac(true);
            }

            error = null;

        } catch (e) {
            error = e;

            await this.release();
        } finally {
            return { error: error };
        }
    }

    /**
     * Commits the transaction
     */
    async commit() {
        let error;

        try {
            if (this.getTransac()) {

                await this.client.query('COMMIT');

                this.setTransac(false);
            }

            error = null;

        } catch (e) {

            error = e;

            if (this.getTransac()) {
                await this.rollback();
            }

            await this.release();
        } finally {
            return { error: error };
        }
    }

    /**
     * Rollbacks the transaction
     */
    async rollback() {
        let error;

        try {
            if (this.getTransac()) {

                await this.client.query('ROLLBACK');

                this.setTransac(false);
            }

            error = null;
        } catch (e) {
            error = e;

            await this.release();
        } finally {
            return { error: error };
        }
    }

    /**
     * Queries the pg client
     * @param {string} sql 
     * @param {array} values 
     */
    async query(sql, values, logParams) {
        let error,
            data,
            total;

        try {
            if (logParams) {
                if (sql.indexOf('returning ') > -1) {
                    sql = sql.replace('returning ', 'returning *, ');
                } else {
                    sql += ' returning *';
                }
            }

            const res = await this.client.query(sql, values);


            if (logParams) {
                const resultValues = res.rows[0];
                const resultId = resultValues.id;

                // logParams['fields'] = res.fields;
                // logParams['values'] = res.rows[0];
                logParams['command'] = res.command;

                if (!logParams.hasOwnProperty('table')) {
                    logParams['table'] = this.getTableName(res.command, sql);
                }

                const logRes = await this.log(logParams, resultId, resultValues);

                if (logRes.error) {
                    throw logRes.error;
                }
            }

            error = null;
            data = res.rows;
            total = res.rowCount;
        } catch (e) {
            error = e;
            data = [];
            total = 0;

            let rollbackError = null;

            if (this.getTransac()) {
                rollbackError = await this.rollback();
            }

            if (!rollbackError) {
                await this.release();
            }
        } finally {
            return {
                error: error,
                data: data,
                total: total
            };
        }
    }

    /**
     * Util to parse table name from an sql query
     * 
     * @param {string} command - sql command
     * @param {string} sql - sql text
     */
    getTableName(command, sql) {
        const split = sql.split(' ');

        let table = split[2];

        switch (command.toLowerCase()) {
            case 'insert':
                table = split[2];

                if (table.indexOf('(') > -1) {
                    table = table.split('(')[0];
                }

                break;
            case 'update':
                table = split[1];
                break;
            case 'delete':
                table = split[2];
                break;
            default:
                break;
        }

        return table;
    }

    /**
     * Given a meta object, logs the values into the logging table
     * 
     * meta: {
     *  logTable  -> logging table
     *  command -> 'insert' | 'update' | 'delete',
     *  userId:   -> user id
     *  table:    -> table where the modification occoured affected table
     *  columns   -> array of columns names (should have the same order as values!)
     * }
     * 
     * @param {object} meta 
     * @param {number} rowId 
     * @param {array} values 
     */
    async log(meta, rowId, row) {
        let error,
            data,
            total;

        try {
            const logTable = meta.logTable ? meta.logTable : 'webapp.logging';
            const command = meta.command.toLowerCase();
            const userId = meta.userId;
            const table = meta.table;

            const strRow = JSON.stringify(row);

            const sql = "insert into " + logTable + "(command, table_id, row_id, user_id, row_values) values($1, $2, $3, $4, $5)";
            const params = [command, table, rowId, userId, strRow];

            const res = await this.client.query(sql, params);

            error = null;
            data = res.rows;
            total = res.rowsCount
        } catch (e) {
            error = e;
            data = [];
            total = 0;
        } finally {
            return {
                error: error,
                data: data,
                total: total
            };
        }
    }

    /**
     * Releases a client back to the pool
     */
    async release() {
        if (!this.getReleased()) {
            await this.client.release();

            this.setReleased(true);
        }
    }

    /**
     * Getters
     */

    // Gets client
    getClient() {
        return this.client;
    }

    // Gets transaction flag
    getTransac() {
        return this.transac;
    }

    // Gets released flag
    getReleased() {
        return this.released;
    }

    /**
     * Setters
     */

    setTransac(flag) {
        this.transac = flag;
    }

    setReleased(released) {
        this.released = released;
    }
}

module.exports = PGTransaction;