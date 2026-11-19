const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const app = require('../src/app');
const { pool, prisma } = require('../src/config/db');

let server;
let baseUrl;
const state = {};

async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
    const text = await response.text();

    let body = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }

    return { status: response.status, body };
}

test.before(async () => {
    await pool.query('TRUNCATE TABLE productos, usuarios RESTART IDENTITY CASCADE');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
    if (server) {
        if (typeof server.closeAllConnections === 'function') {
            server.closeAllConnections();
        }
        await new Promise((resolve) => server.close(resolve));
    }
    await prisma.$disconnect();
    await pool.end();
});

test('GET / responde el health check de la API', async () => {
    const { status, body } = await request('/');

    assert.equal(status, 200);
    assert.equal(body.exito, true);
    assert.equal(body.endpoints.usuarios, '/api/v1/usuarios');
    assert.equal(body.endpoints.productos, '/api/v1/productos');
});

test('GET /api/v1/usuarios devuelve listado paginado vacío', async () => {
    const { status, body } = await request('/api/v1/usuarios?page=1&limit=10');

    assert.equal(status, 200);
    assert.equal(body.exito, true);
    assert.deepEqual(body.datos, []);
    assert.equal(body.paginacion.totalRegistros, 0);
    assert.equal(body.paginacion.paginaActual, 1);
});

test('POST /api/v1/usuarios valida campos obligatorios', async () => {
    const { status, body } = await request('/api/v1/usuarios', {
        method: 'POST',
        body: JSON.stringify({ nombre: 'Sin correo' })
    });

    assert.equal(status, 400);
    assert.equal(body.exito, false);
});

test('POST /api/v1/usuarios crea un usuario', async () => {
    const { status, body } = await request('/api/v1/usuarios', {
        method: 'POST',
        body: JSON.stringify({
            nombre: 'Ana Torres',
            email: 'ana.torres@example.com',
            rol: 'admin',
            activo: true
        })
    });

    assert.equal(status, 201);
    assert.equal(body.exito, true);
    assert.equal(body.datos.nombre, 'Ana Torres');
    assert.equal(body.datos.email, 'ana.torres@example.com');
    assert.equal(body.datos.rol, 'admin');
    assert.ok(body.datos.id);

    state.usuarioId = body.datos.id;
});

test('POST /api/v1/usuarios rechaza correos duplicados con 409', async () => {
    const { status, body } = await request('/api/v1/usuarios', {
        method: 'POST',
        body: JSON.stringify({
            nombre: 'Otra Ana',
            email: 'ana.torres@example.com'
        })
    });

    assert.equal(status, 409);
    assert.equal(body.exito, false);
});

test('GET /api/v1/usuarios/:id obtiene el usuario creado', async () => {
    const { status, body } = await request(`/api/v1/usuarios/${state.usuarioId}`);

    assert.equal(status, 200);
    assert.equal(body.datos.id, state.usuarioId);
    assert.equal(body.datos.email, 'ana.torres@example.com');
});

test('GET /api/v1/usuarios/:id devuelve 404 si no existe', async () => {
    const { status, body } = await request('/api/v1/usuarios/999999');

    assert.equal(status, 404);
    assert.equal(body.exito, false);
});

test('GET /api/v1/usuarios/:id valida el formato del ID', async () => {
    const { status } = await request('/api/v1/usuarios/abc');

    assert.equal(status, 400);
});

test('PATCH /api/v1/usuarios/:id actualiza parcialmente', async () => {
    const { status, body } = await request(`/api/v1/usuarios/${state.usuarioId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rol: 'auditor', activo: false })
    });

    assert.equal(status, 200);
    assert.equal(body.datos.rol, 'auditor');
    assert.equal(body.datos.activo, false);
});

test('PUT /api/v1/usuarios/:id actualiza nombre y correo', async () => {
    const { status, body } = await request(`/api/v1/usuarios/${state.usuarioId}`, {
        method: 'PUT',
        body: JSON.stringify({
            nombre: 'Ana Torres Actualizada',
            email: 'ana.actualizada@example.com'
        })
    });

    assert.equal(status, 200);
    assert.equal(body.datos.nombre, 'Ana Torres Actualizada');
    assert.equal(body.datos.email, 'ana.actualizada@example.com');
});

test('GET /api/v1/usuarios aplica paginación y búsqueda', async () => {
    const { status, body } = await request('/api/v1/usuarios?page=1&limit=1&busqueda=Actualizada');

    assert.equal(status, 200);
    assert.equal(body.datos.length, 1);
    assert.equal(body.paginacion.limitePorPagina, 1);
    assert.equal(body.paginacion.totalRegistros, 1);
});

test('DELETE /api/v1/usuarios/:id elimina con 204', async () => {
    const { status } = await request(`/api/v1/usuarios/${state.usuarioId}`, { method: 'DELETE' });

    assert.equal(status, 204);
});

test('DELETE /api/v1/usuarios/:id devuelve 404 si ya no existe', async () => {
    const { status } = await request(`/api/v1/usuarios/${state.usuarioId}`, { method: 'DELETE' });

    assert.equal(status, 404);
});

test('GET /api/v1/productos devuelve listado vacío', async () => {
    const { status, body } = await request('/api/v1/productos');

    assert.equal(status, 200);
    assert.deepEqual(body.datos, []);
    assert.equal(body.paginacion.totalRegistros, 0);
});

test('POST /api/v1/productos valida datos obligatorios', async () => {
    const { status } = await request('/api/v1/productos', {
        method: 'POST',
        body: JSON.stringify({ codigo: 'X' })
    });

    assert.equal(status, 400);
});

test('POST /api/v1/productos crea un producto con url-imagen', async () => {
    const { status, body } = await request('/api/v1/productos', {
        method: 'POST',
        body: JSON.stringify({
            codigo: 'PROD-TEST-001',
            nombre: 'Teclado Mecánico de Prueba',
            descripcion: 'Producto creado por la suite de integración',
            categoria: 'Periféricos',
            precio: 79.99,
            stock: 25,
            estado: true,
            'url-imagen': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'
        })
    });

    assert.equal(status, 201);
    assert.equal(body.datos.codigo, 'PROD-TEST-001');
    assert.equal(body.datos['url-imagen'], 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80');
    assert.ok(body.datos.id);

    state.productoId = body.datos.id;
});

test('POST /api/v1/productos rechaza códigos duplicados con 409', async () => {
    const { status } = await request('/api/v1/productos', {
        method: 'POST',
        body: JSON.stringify({
            codigo: 'PROD-TEST-001',
            nombre: 'Otro teclado',
            categoria: 'Periféricos',
            precio: 10,
            stock: 1,
            'url-imagen': 'https://example.com/imagen.png'
        })
    });

    assert.equal(status, 409);
});

test('GET /api/v1/productos/:id obtiene el producto creado', async () => {
    const { status, body } = await request(`/api/v1/productos/${state.productoId}`);

    assert.equal(status, 200);
    assert.equal(body.datos.id, state.productoId);
    assert.equal(body.datos.nombre, 'Teclado Mecánico de Prueba');
});

test('PATCH /api/v1/productos/:id actualiza precio y stock', async () => {
    const { status, body } = await request(`/api/v1/productos/${state.productoId}`, {
        method: 'PATCH',
        body: JSON.stringify({ precio: 89.5, stock: 30 })
    });

    assert.equal(status, 200);
    assert.equal(Number(body.datos.precio), 89.5);
    assert.equal(body.datos.stock, 30);
});

test('GET /api/v1/productos filtra por categoría', async () => {
    const { status, body } = await request('/api/v1/productos?categoria=Periféricos&limit=5');

    assert.equal(status, 200);
    assert.equal(body.datos.length, 1);
    assert.equal(body.datos[0].codigo, 'PROD-TEST-001');
});

test('DELETE /api/v1/productos/:id elimina el producto', async () => {
    const { status, body } = await request(`/api/v1/productos/${state.productoId}`, { method: 'DELETE' });

    assert.equal(status, 200);
    assert.equal(body.exito, true);
});

test('GET /api/v1/productos/:id devuelve 404 tras eliminarlo', async () => {
    const { status } = await request(`/api/v1/productos/${state.productoId}`);

    assert.equal(status, 404);
});

test('Ruta inexistente devuelve 404', async () => {
    const { status, body } = await request('/api/v1/inexistente');

    assert.equal(status, 404);
    assert.equal(body.exito, false);
});

test('JSON malformado devuelve 400', async () => {
    const { status } = await request('/api/v1/usuarios', {
        method: 'POST',
        body: '{ esto no es json }'
    });

    assert.equal(status, 400);
});
