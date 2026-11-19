const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const usuarios = [
    { nombre: 'Ana Torres', email: 'ana.torres@example.com', rol: 'admin', activo: true },
    { nombre: 'Carlos Pérez', email: 'carlos.perez@example.com', rol: 'moderador', activo: true },
    { nombre: 'María Gómez', email: 'maria.gomez@example.com', rol: 'usuario', activo: true },
    { nombre: 'Luis Ramírez', email: 'luis.ramirez@example.com', rol: 'auditor', activo: false }
];

const productos = [
    {
        codigo: 'PROD-000001',
        nombre: 'Laptop Ultrabook Pro',
        descripcion: 'Laptop ligera de alto rendimiento para trabajo y estudio.',
        categoria: 'Computación',
        precio: 1299.99,
        stock: 15,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'
    },
    {
        codigo: 'PROD-000002',
        nombre: 'Mouse Inalámbrico Ergonómico',
        descripcion: 'Mouse inalámbrico con diseño ergonómico y batería recargable.',
        categoria: 'Periféricos',
        precio: 39.5,
        stock: 80,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
    },
    {
        codigo: 'PROD-000003',
        nombre: 'Teclado Mecánico RGB',
        descripcion: 'Teclado mecánico con iluminación RGB y switches táctiles.',
        categoria: 'Periféricos',
        precio: 89.99,
        stock: 45,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'
    },
    {
        codigo: 'PROD-000004',
        nombre: 'Monitor 27 Pulgadas 4K',
        descripcion: 'Monitor IPS 4K con HDR y conectividad USB-C.',
        categoria: 'Computación',
        precio: 549.0,
        stock: 20,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80'
    },
    {
        codigo: 'PROD-000005',
        nombre: 'Auriculares Bluetooth ANC',
        descripcion: 'Auriculares con cancelación activa de ruido y estuche de carga.',
        categoria: 'Audio y Video',
        precio: 199.99,
        stock: 60,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    },
    {
        codigo: 'PROD-000006',
        nombre: 'SSD NVMe 1TB',
        descripcion: 'Unidad de estado sólido NVMe de alta velocidad.',
        categoria: 'Almacenamiento',
        precio: 119.99,
        stock: 100,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80'
    },
    {
        codigo: 'PROD-000007',
        nombre: 'Router Wi-Fi 6',
        descripcion: 'Router inalámbrico de doble banda con tecnología Wi-Fi 6.',
        categoria: 'Redes',
        precio: 149.0,
        stock: 35,
        estado: true,
        urlImagen: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80'
    },
    {
        codigo: 'PROD-000008',
        nombre: 'Cámara Web Full HD',
        descripcion: 'Cámara web 1080p con micrófono integrado para videollamadas.',
        categoria: 'Audio y Video',
        precio: 69.99,
        stock: 50,
        estado: false,
        urlImagen: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80'
    }
];

async function main() {
    for (const usuario of usuarios) {
        await prisma.usuario.upsert({
            where: { email: usuario.email },
            update: {},
            create: usuario
        });
    }

    for (const producto of productos) {
        await prisma.producto.upsert({
            where: { codigo: producto.codigo },
            update: {},
            create: producto
        });
    }

    console.log(`Datos semilla listos: ${usuarios.length} usuarios y ${productos.length} productos.`);
}

main()
    .catch((error) => {
        console.error('Error al ejecutar el seed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
