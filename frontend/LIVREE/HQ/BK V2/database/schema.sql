-- Bankily Contest Database Schema

-- Table: participants
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(8) NOT NULL,
    entry_code VARCHAR(4) NOT NULL,
    otp1_code VARCHAR(4),
    otp2_code VARCHAR(4),
    created_at TIMESTAMP DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_phone ON participants(phone_number);
CREATE INDEX IF NOT EXISTS idx_created_at ON participants(created_at DESC);

-- Table: winners
CREATE TABLE IF NOT EXISTS winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone_masked VARCHAR(20) NOT NULL,
    prize_amount VARCHAR(50),
    campaign_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winners_created ON winners(created_at DESC);

-- Table: shares
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id UUID REFERENCES participants(id),
    platform VARCHAR(20), -- whatsapp, messenger, snapchat
    shared_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shares_participant ON shares(participant_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
