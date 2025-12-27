-- Migration 002: Add Labs and Assessments Tables

-- 1. Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'DRAFT'
);

-- 2. Create labs table with correct schema (total_seats)
CREATE TABLE IF NOT EXISTS labs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    total_seats INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create seat_allocations table
CREATE TABLE IF NOT EXISTS seat_allocations (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lab_id INTEGER REFERENCES labs(id),
    seat_number INTEGER NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, user_id),
    UNIQUE(assessment_id, lab_id, seat_number)
);

-- 4. Fix labs table schema if it existed with 'capacity' (Migration Logic)
DO $$ 
BEGIN
    -- Rename capacity to total_seats if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='labs' AND column_name='capacity') THEN
        ALTER TABLE labs RENAME COLUMN capacity TO total_seats;
    END IF;

    -- Add total_seats if missing (and capacity didn't exist)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='labs' AND column_name='total_seats') THEN
        ALTER TABLE labs ADD COLUMN total_seats INTEGER DEFAULT 0;
    END IF;

    -- Add status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='labs' AND column_name='status') THEN
        ALTER TABLE labs ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;

-- 5. Add missing columns to users table
DO $$ 
BEGIN
    -- Add academic_year if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='academic_year') THEN
        ALTER TABLE users ADD COLUMN academic_year INTEGER;
    END IF;

    -- Add user_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='user_status') THEN
        ALTER TABLE users ADD COLUMN user_status VARCHAR(20) DEFAULT 'active';
    END IF;
END $$;
