CREATE DATABASE todoapp;

CREATE TABLE todos (
    id VARCHAR(255) PRIMARY KEY,
    user_email VARCHAR(255),
    title VARCHAR(255),
    progress INT,
    date VARCHAR(300)
);

CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    hashed_password VARCHAR(255)
);

/* Demo INSERT queries */
INSERT INTO todos(id, user_email, title, progress, date) VALUES (0, 'Mugisha@gmail.com', 'First todo', 10, '16 Aug 2024');