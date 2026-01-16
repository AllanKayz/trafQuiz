const { db } = require('../db');

class VehicleModel {
    static all() {
        return db.prepare('SELECT * FROM vehicles').all();
    }

    static find(id) {
        return db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO vehicles (
                make, model, year, registration_number, type, 
                status, mileage, last_service_date, next_service_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            data.make, data.model, data.year, data.registration_number,
            data.type, data.status || 'active', data.mileage || 0,
            data.last_service_date, data.next_service_date
        );
        return this.find(info.lastInsertRowid);
    }

    static update(id, data) {
        // Dynamic update
        const keys = Object.keys(data);
        if (keys.length === 0) return this.find(id);

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        db.prepare(`UPDATE vehicles SET ${setClause} WHERE id = ?`).run(...values);
        return this.find(id);
    }
}

module.exports = VehicleModel;
