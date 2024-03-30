const { nanoid } = require("nanoid");
const books = require('./books');


const addBooksHandler = (request, h) => {
    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    if (name === null || name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        })
        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage ? true : false;

    const newBook = {
        id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt
    }

    books.push(newBook);

    return h.response({
        "status": "success",
        "message": "Buku berhasil ditambahkan",
        "data": {
            "bookId": id
        }
    }).code(201);

};

const getAllBooksHandler = (request, h) => {
    let books_filter = books;
    const { name, reading, finished } = request.query;

    if (name) {
        const search = name.toLowerCase();
        books_filter = books_filter.filter(book =>
            book.name.toLowerCase().includes(search));
    }

    if (reading !== undefined && (reading === '0' || reading === '1')) {
        const isReading = reading === '1';
        books_filter = books_filter.filter(book => book.reading === isReading);
    }

    if (finished !== undefined && (finished === '0' || finished === '1')) {
        const isFinished = finished === '1';
        books_filter = books_filter.filter(book => book.finished === isFinished);
    }


    return {
        status: 'success',
        data: {
            books: books_filter.map(book => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    };
}

const getBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const book = books.filter((n) => n.id === bookId)[0];
    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book,
            },
        };
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
};

const editBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

    const index = books.findIndex((book) => book.id === bookId);

    if (name === null || name === undefined) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);
        return response;
    }

    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
        })
        response.code(400);
        return response;
    }

    if (index !== -1) {
        books[index] = {
            ...books[index],
            name, year, author, summary, publisher, pageCount, readPage, reading
        };

        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;


};

const deleteBookByIdHandler = (request, h) => {
    const { bookId } = request.params;

    const index = books.findIndex((book) => book.id === bookId);
    console.log(index);

    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
};


module.exports = { addBooksHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler,deleteBookByIdHandler };