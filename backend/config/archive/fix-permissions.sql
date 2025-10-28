-- Fix permissions for contact_messages table
-- Run this to grant all permissions to deekshita user

-- Grant all privileges on the contact_messages table
GRANT ALL PRIVILEGES ON TABLE contact_messages TO deekshita;

-- Grant usage and select on the sequence (for auto-increment id)
GRANT USAGE, SELECT ON SEQUENCE contact_messages_id_seq TO deekshita;

-- Also grant on all other tables while we're at it
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO deekshita;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO deekshita;

-- Verify permissions
\dp contact_messages

SELECT 'Permissions fixed for deekshita user!' AS status;

