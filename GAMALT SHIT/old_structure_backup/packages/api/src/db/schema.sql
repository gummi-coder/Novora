-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_questions table
CREATE TABLE IF NOT EXISTS survey_questions (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options JSONB,
    required BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id INTEGER REFERENCES surveys(id),
    user_id INTEGER REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_answers table
CREATE TABLE IF NOT EXISTS survey_answers (
    id SERIAL PRIMARY KEY,
    response_id INTEGER REFERENCES survey_responses(id),
    question_id INTEGER REFERENCES survey_questions(id),
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 