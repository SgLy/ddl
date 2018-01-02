DROP DATABASE IF EXISTS ddl;
CREATE DATABASE ddl;
USE ddl;
CREATE USER IF NOT EXISTS 'ddl'@'localhost' IDENTIFIED BY 'ddl';
GRANT ALL PRIVILEGES ON ddl.* TO 'ddl'@'localhost';
CREATE TABLE deadline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(1024) NOT NULL,
    time DATETIME NOT NULL,
    description TEXT NOT NULL,
    course_id INT,
    user_id INT
);
CREATE TABLE notice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(1024) NOT NULL,
    description TEXT NOT NULL,
    course_id INT,
    user_id INT
);
CREATE TABLE chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    time DATETIME NOT NULL,
    content TEXT NOT NULL
);
CREATE TABLE course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(1024) NOT NULL,
    admin_id INT NOT NULL
);
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(1024) NOT NULL,
    password VARCHAR(32) NOT NULL,
    nickname VARCHAR(1024) NOT NULL
);
CREATE TABLE user_course (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (user_id, course_id)
);
