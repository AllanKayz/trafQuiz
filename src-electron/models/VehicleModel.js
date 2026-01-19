const { get, query, run } = require('../db');

class VehicleModel {
    static async all() {
        return await query('SELECT * FROM vehicles ORDER BY created_at DESC');
    }

    static async find(id) {
        return await get('SELECT * FROM vehicles WHERE id = ?', [id]);
    }

    static async create(data) {
        const { make, model, year, registration, type, status, notes } = data;
        const info = await run(`
            INSERT INTO vehicles (
                make, model, year, registration, type, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            make, model, year, registration,
            type || 'car', status || 'active', notes
        ]);
        return await this.find(info.lastID);
    }

    static async update(id, data) {
        const allowedFields = ['make', 'model', 'year', 'registration', 'type', 'status', 'notes'];
        const keys = Object.keys(data).filter(k => allowedFields.includes(k));
        
        if (keys.length === 0) return await this.find(id);

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...keys.map(k => data[k]), id];

        await run(`UPDATE vehicles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        return await this.find(id);
    }

    static async delete(id) {
        return await run('DELETE FROM vehicles WHERE id = ?', [id]);
    }

    static async reportIssue(data) {
        const { vehicleId, instructorId, description, severity } = data;
        const info = await run(`
            INSERT INTO vehicle_issues (vehicle_id, instructor_id, description, severity, status)
            VALUES (?, ?, ?, ?, ?)
        `, [vehicleId, instructorId, description, severity || 'low', 'open']);
        
        return { id: info.lastID, ...data, status: 'open' };
    }

    static async logActivity(data) {
        const { vehicleId, instructorId, mileage, fuelLevel, notes } = data;
        const info = await run(`
            INSERT INTO vehicle_logs (vehicle_id, instructor_id, mileage, fuel_level, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [vehicleId, instructorId, mileage, fuelLevel, notes]);
        
        return { id: info.lastID, ...data };
    }
}

module.exports = VehicleModel;
