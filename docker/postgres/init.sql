-- VectraBase AI — PostgreSQL Initialization Script
-- Author: Karthik Kathari (github.com/Karthik-Kathari)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

