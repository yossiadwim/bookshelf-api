const { nanoid } = require("nanoid");

const { MongoClient } = require("mongodb");
require('dotenv').config();

const db_user = process.env.DB_USERNAME
const db_password = process.env.DB_PASSWORD
const db_name = process.env.DATABASE_NAME
const db_cluster = process.env.DATABASE_CLUSTER

const uri = `mongodb+srv://${db_user}:${db_password}@${db_cluster}.75mez32.mongodb.net/?retryWrites=true&w=majority&appName=${db_cluster}`;

const client = new MongoClient(uri);
const database = client.db(db_name);
const books = database.collection('books');

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

    books.insertOne(newBook);

    return h.response({
        "status": "success",
        "message": "Buku berhasil ditambahkan",
        "data": {
            "bookId": id
        }
    }).code(201);

}

const getAllBooks = async (request, h) => {
    const allBooks = await books.find({}).toArray();

    const responseBody = {
        status: 'success',
        data: {
            books: allBooks.map(book => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    }

    return h.response(responseBody).code(200);
}

const getBooksByIdHandler = async (request, h) => {
    const { bookId } = request.params;
    const book = await books.findOne({ id: bookId },{ projection: { _id: 0 }});

    if (!books) {
        return h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan'
        }).code(404);
    }

    const responseBody = {
        status: 'success',
        data: {
            book    
        }
    }

    return h.response(responseBody).code(200);

};

module.exports = { addBooksHandler, getAllBooks, getBooksByIdHandler }