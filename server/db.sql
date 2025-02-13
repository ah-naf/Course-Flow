CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- INSERT INTO users (
--     email, 
--     username, 
--     password_hash, 
--     first_name, 
--     last_name, 
--     created_at, 
--     updated_at, 
--     last_login
-- ) VALUES (
--     'john.doe@example.com',                  -- Dummy email
--     'johndoe',                               -- Dummy username
--     '$2a$10$abcdefghijklmnopqrstuv',         -- Dummy password hash (bcrypt format)
--     'John',                                  -- Dummy first name
--     'Doe',                                   -- Dummy last name
--     '2025-02-13 12:00:00',                    -- Dummy creation timestamp
--     '2025-02-13 12:00:00',                    -- Dummy updated timestamp
--     '2025-02-13 12:00:00'                     -- Dummy last login timestamp
-- );