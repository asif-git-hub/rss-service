CREATE TABLE comapny_info(
	id INT NOT NULL,
	name VARCHAR(30) NOT NULL,
	description VARCHAR(10000) NOT NULL,
	street VARCHAR(50),
	postalCode VARCHAR(50),
	city VARCHAR(30),
    country VARCHAR(30),
	email VARCHAR(30),
	fax VARCHAR(30),
	website VARCHAR(30),
	phone VARCHAR(30),
	tags VARCHAR(100),
	PRIMARY KEY(id)
);