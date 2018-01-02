DROP DATABASE IF EXISTS ddl;
CREATE DATABASE ddl;
USE ddl;
CREATE USER IF NOT EXISTS 'ddl'@'localhost' IDENTIFIED BY 'ddl';
GRANT ALL PRIVILEGES ON ddl.* TO 'ddl'@'localhost';
CREATE TABLE deadline (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    time DATETIME NOT NULL,
    done BOOL NOT NULL DEFAULT false,
    description TEXT NOT NULL,
    course_id INT,
    user_id INT
);
CREATE TABLE notice (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
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
    name VARCHAR(128) NOT NULL,
    semester VARCHAR(128) NOT NULL
);
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(128) NOT NULL UNIQUE,
    password VARCHAR(32) NOT NULL,
    nickname VARCHAR(128) NOT NULL,
    token VARCHAR(36) UNIQUE
);
CREATE TABLE user_course (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (user_id, course_id)
);
