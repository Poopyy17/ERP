import bcrypt from 'bcryptjs';

const data = {
    users:[
        {
            name: 'admin',
            email: 'admin@dev.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: true,
        },
        {
            name: 'inspector',
            email: 'inspector@dev.com',
            password: bcrypt.hashSync('123456'),
            isAdmin: false,
        },
    ],

    products: [
        {
            // _id: '1',
            name: 'Steel Bar',
            slug: 'steel-bar',
            category: 'Metal',
            image: '/images/steelbar.png',
            price: 200,
            countInStock: 5,
            brand: 'Metal',
            description: '• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            // _id: '2',
            name: 'Plywood',
            slug: 'plywood-mat',
            category: 'Wood',
            image: '/images/plywood.png',
            price: 100,
            countInStock: 5,
            brand: 'Wood',
            description: '• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            // _id: '3',
            name: 'Paint',
            slug: 'paint-mat',
            category: 'Paint',
            image: '/images/paint.png',
            price: 300,
            countInStock: 5,
            brand: 'Paint',
            description: '• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
        {
            // _id: '4',
            name: 'Nails',
            slug: 'nail-mat',
            category: 'Misc',
            image: '/images/nails.png',
            price: 20,
            countInStock: 0,
            brand: 'Misc',
            description: '• Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        },
    
    ],
}

export default data