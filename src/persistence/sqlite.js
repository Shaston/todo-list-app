// src/persistence/sqlite.js
//---------------------------------------------------------
//  Configuración de una base SQLite segura para la app
//  - Guarda la BD en /app/data/todo.db   (WORKDIR del contenedor)
//  - Si se define la variable DATA_DIR, usará esa carpeta.
//  - Sin rutas bajo /etc, así la app puede correr como usuario no-root
//---------------------------------------------------------

const path    = require('path');
const fs      = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Carpeta donde se guarda la base de datos
const DATA_DIR = process.env.DATA_DIR || '/app/data';
const location = path.join(DATA_DIR, 'todo.db');

// Creamos el objeto DB en init(); lo declaramos aquí para que
// esté accesible en los demás métodos.
let db;

/* ------------------------------------------------------- *
 *  init(): abre/crea la BD y la tabla si no existe
 * ------------------------------------------------------- */
function init() {
    // Asegurarse de que la carpeta existe
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test') {
                console.log(`Using sqlite database at ${location}`);
            }

            // Crear tabla si no existe
            db.run(
                `CREATE TABLE IF NOT EXISTS todo_items (
                    id        VARCHAR(36),
                    name      VARCHAR(255),
                    completed BOOLEAN
                )`,
                err2 => (err2 ? rej(err2) : acc())
            );
        });
    });
}

/* ------------------------------------------------------- *
 *  teardown(): cierra la BD (para tests o shutdown limpio)
 * ------------------------------------------------------- */
function teardown() {
    return new Promise((acc, rej) => {
        db.close(err => (err ? rej(err) : acc()));
    });
}

/* ------------------------------------------------------- *
 *  Operaciones CRUD
 * ------------------------------------------------------- */
function getItems() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item => ({ ...item, completed: item.completed === 1 }))
            );
        });
    });
}

function getItem(id) {
    return new Promise((acc, rej) => {
        db.get('SELECT * FROM todo_items WHERE id = ?', [id], (err, row) => {
            if (err) return rej(err);
            acc(row ? { ...row, completed: row.completed === 1 } : undefined);
        });
    });
}

function storeItem(item) {
    return new Promise((acc, rej) => {
        db.run(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => (err ? rej(err) : acc())
        );
    });
}

function updateItem(id, item) {
    return new Promise((acc, rej) => {
        db.run(
            'UPDATE todo_items SET name = ?, completed = ? WHERE id = ?',
            [item.name, item.completed ? 1 : 0, id],
            err => (err ? rej(err) : acc())
        );
    });
}

function removeItem(id) {
    return new Promise((acc, rej) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], err =>
            err ? rej(err) : acc()
        );
    });
}

/* ------------------------------------------------------- *
 *  Exportamos las funciones públicas
 * ------------------------------------------------------- */
module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
