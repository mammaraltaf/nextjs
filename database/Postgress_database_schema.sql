CREATE TABLE education_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(26) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    ginicoe_help_description TEXT NOT NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'education_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    processed_by VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

CREATE TABLE government_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(26) NOT NULL,
    last_name VARCHAR(26) NOT NULL,
    job_title VARCHAR(50) NOT NULL,
    office_street_name VARCHAR(255) NOT NULL,
    office_urbanization_number VARCHAR(100) NULL,
    office_city VARCHAR(100) NOT NULL,
    office_state VARCHAR(50) NOT NULL,
    office_county VARCHAR(100) NULL,
    office_zip_code VARCHAR(20) NOT NULL,
    address_verified BOOLEAN DEFAULT FALSE NOT NULL,
    address_verification_service VARCHAR(50) NULL,
    office_primary_telephone VARCHAR(20) NULL,
    office_alternate_telephone VARCHAR(20) NULL,
    agency_type VARCHAR(50) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    agency_description TEXT NULL,
    agency_name VARCHAR(255) NOT NULL,
    agency_description2 TEXT NULL,
    budgeting_procurement_authority BOOLEAN NOT NULL,
    budgeting_authority VARCHAR(100) NULL,
    ginicoe_help_description TEXT NOT NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'government_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    processed_by VARCHAR(255) NULL,
    notes TEXT NULL,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

CREATE TABLE health_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(26) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    ginicoe_help_description TEXT NOT NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'healthcare_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    processed_by VARCHAR(255) NULL,
    notes TEXT NULL,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

CREATE TABLE merchant_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    business_legal_name VARCHAR(255) NOT NULL,
    business_trade_name VARCHAR(255) NULL,
    business_physical_address VARCHAR(500) NOT NULL,
    business_mailing_address VARCHAR(500) NULL,
    same_as_physical_address BOOLEAN DEFAULT TRUE NOT NULL,
    first_name VARCHAR(26) NOT NULL,
    last_name VARCHAR(26) NOT NULL,
    telephone VARCHAR(20) NULL,
    toll_free_number VARCHAR(20) NULL,
    business_email VARCHAR(255) NOT NULL,
    federal_tax_id VARCHAR(15) NOT NULL,
    owner_first_name VARCHAR(26) NOT NULL,
    owner_last_name VARCHAR(26) NOT NULL,
    social_security_number VARCHAR(15) NOT NULL,
    title_in_business VARCHAR(255) NULL,
    owner_telephone VARCHAR(20) NOT NULL,
    owner_percentage_ownership DECIMAL(5,2) NOT NULL,
    owner_dob DATE NOT NULL,
    owner_home_address VARCHAR(500) NOT NULL,
    site_url VARCHAR(500) NULL,
    business_structure VARCHAR(100) NOT NULL,
    are_you_home_based BOOLEAN NOT NULL,
    no_of_employees VARCHAR(50) NOT NULL,
    sales_per_month VARCHAR(50) NOT NULL,
    tier1 BOOLEAN DEFAULT FALSE NOT NULL,
    tier2 BOOLEAN DEFAULT FALSE NOT NULL,
    tier3 BOOLEAN DEFAULT FALSE NOT NULL,
    tier4 BOOLEAN DEFAULT FALSE NOT NULL,
    merchant_bank VARCHAR(255) NOT NULL,
    payment_processor VARCHAR(255) NOT NULL,
    account_manager_first_name VARCHAR(26) NOT NULL,
    account_manager_last_name VARCHAR(26) NOT NULL,
    account_manager_physical_address VARCHAR(500) NOT NULL,
    account_manager_telephone_number VARCHAR(20) NOT NULL,
    account_manager_email_address VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255) NULL,
    naics_number VARCHAR(10) NOT NULL,
    estimated_number_of_pos_terminals INTEGER NOT NULL,
    pos_manufacturer VARCHAR(255) NOT NULL,
    experienced_account_data_compromise DATE NULL,
    pos_hardware_software BOOLEAN DEFAULT FALSE NOT NULL,
    third_party_software_company VARCHAR(255) NULL,
    pos_version_number VARCHAR(50) NULL,
    third_party_web_hosting BOOLEAN NOT NULL,
    third_party_web_hosting_company VARCHAR(255) NULL,
    card_stored_by_user BOOLEAN NOT NULL,
    card_data_storage VARCHAR(255) NULL,
    vendor_pci_compliant BOOLEAN NOT NULL,
    qualified_security_assessor VARCHAR(255) NULL,
    date_of_compliance DATE NULL,
    date_of_last_scan DATE NULL,
    ginicoe_help_description TEXT NOT NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'merchant_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    processed_by VARCHAR(255) NULL,
    notes TEXT NULL,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

CREATE TABLE financial_institution_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    financial_institution_name VARCHAR(255) NOT NULL,
    office_address VARCHAR(500) NOT NULL,
    first_name VARCHAR(26) NOT NULL,
    last_name VARCHAR(26) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    fax_number VARCHAR(20) NULL,
    business_email_address VARCHAR(255) NOT NULL,
    alternate_telephone_number VARCHAR(20) NULL,
    alternate_fax_number VARCHAR(20) NULL,
    mobile_number VARCHAR(20) NOT NULL,
    financial_institutions_selected JSONB NOT NULL,
    charter_type VARCHAR(20) NOT NULL,
    charter_address VARCHAR(500) NOT NULL,
    charter_number VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    operates_across_state_lines BOOLEAN NOT NULL,
    total_asset_size VARCHAR(100) NOT NULL,
    financial_services_selected JSONB NOT NULL,
    bin_number VARCHAR(10) NOT NULL,
    trade_volume VARCHAR(100) NOT NULL,
    portfolio_sizes JSONB NULL,
    ginicoe_help_description TEXT NOT NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'financial_institution_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    processed_by VARCHAR(255) NULL,
    notes TEXT NULL,
    priority_level INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

// Add the consumer_submissions table
CREATE TABLE consumer_submissions (
    id BIGSERIAL PRIMARY KEY,
    guid VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(26) NOT NULL,
    middle_initial VARCHAR(26) NULL,
    last_name VARCHAR(26) NOT NULL,
    suffix VARCHAR(10) NULL,
    nick_name VARCHAR(26) NULL,
    date_of_birth DATE NOT NULL,
    social_security_number VARCHAR(15) NOT NULL,
    verify_social_security_number VARCHAR(15) NOT NULL,
    are_you_us_veteran BOOLEAN DEFAULT FALSE NOT NULL,
    branch_of_service VARCHAR(50) NULL,
    service_start_date DATE NULL,
    service_end_date DATE NULL,
    are_you_an_ex_offender BOOLEAN DEFAULT FALSE NOT NULL,
    consent BOOLEAN DEFAULT FALSE NOT NULL,
    opt_out_checkbox BOOLEAN DEFAULT FALSE NOT NULL,
    face_recognition_completed BOOLEAN DEFAULT FALSE NOT NULL,
    opt_in_see_me BOOLEAN DEFAULT FALSE NOT NULL,
    opt_in_see_lookalike BOOLEAN DEFAULT FALSE NOT NULL,
    current_us_address TEXT NULL,
    move_in_date DATE NULL,
    previous_us_address TEXT NULL,
    previous_address_label VARCHAR(100) NULL,
    identity_at_birth VARCHAR(20) NULL,
    legal_sex VARCHAR(20) NULL,
    self_identity VARCHAR(20) NULL,
    ethnicity VARCHAR(50) NULL,
    right_neighbor_address TEXT NULL,
    verified_right_neighbor_address BOOLEAN DEFAULT FALSE NOT NULL,
    right_neighbor_race TEXT NULL,
    left_neighbor_address TEXT NULL,
    verified_left_neighbor_address BOOLEAN DEFAULT FALSE NOT NULL,
    left_neighbor_race TEXT NULL,
    front_neighbor_address TEXT NULL,
    verified_front_neighbor_address BOOLEAN DEFAULT FALSE NOT NULL,
    front_neighbor_race TEXT NULL,
    back_neighbor_address TEXT NULL,
    verified_back_neighbor_address BOOLEAN DEFAULT FALSE NOT NULL,
    back_neighbor_race TEXT NULL,
    employer_name VARCHAR(100) NULL,
    job_title VARCHAR(100) NULL,
    employer_website VARCHAR(255) NULL,
    financial_picture TEXT NULL,
    card_info JSONB NULL,
    how_did_you_hear_about_us VARCHAR(100) NULL,
    other_source VARCHAR(255) NULL,
    recaptcha_score DECIMAL(3,2) NULL,
    recaptcha_action VARCHAR(50) DEFAULT 'consumer_form',
    ip_address INET NULL,
    user_agent TEXT NULL,
    form_version VARCHAR(10) DEFAULT '1.0' NOT NULL,
    status VARCHAR(20) DEFAULT 'submitted' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

// Add the consumer_documents table for storing uploaded files
CREATE TABLE consumer_documents (
    id BIGSERIAL PRIMARY KEY,
    consumer_submission_id BIGINT NOT NULL REFERENCES consumer_submissions(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'alimony', 'child_support', 'impairment', 'multi_racial', etc.
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image/png', 'application/pdf', etc.
    file_path TEXT NOT NULL, -- Store file path instead of binary data
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

// Add agreement_signatures table for storing digital signatures
CREATE TABLE agreement_signatures (
    id BIGSERIAL PRIMARY KEY,
    agreement_id VARCHAR(255) UNIQUE NOT NULL, -- Unique agreement identifier (e.g., CONSUMER-12345678-1234567890-abc123)
    user_id VARCHAR(255) NOT NULL, -- User GUID
    user_name VARCHAR(255) NOT NULL, -- Full name of signatory
    agreement_type VARCHAR(50) NOT NULL, -- 'consumer' or 'merchant'
    signature_data TEXT NOT NULL, -- Base64 encoded signature image
    signature_date TIMESTAMP WITH TIME ZONE NOT NULL, -- When signature was captured
    ip_address INET NULL, -- IP address of signatory
    user_agent TEXT NULL, -- Browser/device information
    agreement_pdf_path TEXT NULL, -- Path to signed agreement PDF
    status VARCHAR(50) DEFAULT 'signed' NOT NULL, -- 'signed', 'voided', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'system' NOT NULL,
    updated_by VARCHAR(255) DEFAULT 'system' NOT NULL
);

// Link agreement signatures to submissions
CREATE TABLE consumer_agreement_signatures (
    id BIGSERIAL PRIMARY KEY,
    consumer_submission_id BIGINT NOT NULL REFERENCES consumer_submissions(id) ON DELETE CASCADE,
    agreement_signature_id BIGINT NOT NULL REFERENCES agreement_signatures(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(consumer_submission_id, agreement_signature_id)
);

CREATE TABLE merchant_agreement_signatures (
    id BIGSERIAL PRIMARY KEY,
    merchant_submission_id BIGINT NOT NULL REFERENCES merchant_submissions(id) ON DELETE CASCADE,
    agreement_signature_id BIGINT NOT NULL REFERENCES agreement_signatures(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(merchant_submission_id, agreement_signature_id)
);

CREATE INDEX idx_education_submissions_email ON education_submissions(email);
CREATE INDEX idx_education_submissions_status ON education_submissions(status);
CREATE INDEX idx_education_submissions_created_at ON education_submissions(created_at);

CREATE INDEX idx_government_submissions_name ON government_submissions(first_name, last_name);
CREATE INDEX idx_government_submissions_status ON government_submissions(status);
CREATE INDEX idx_government_submissions_agency ON government_submissions(agency_type, agency_name);

CREATE INDEX idx_health_submissions_email ON health_submissions(email);
CREATE INDEX idx_health_submissions_status ON health_submissions(status);
CREATE INDEX idx_health_submissions_created_at ON health_submissions(created_at);

CREATE INDEX idx_merchant_submissions_business ON merchant_submissions(business_legal_name);
CREATE INDEX idx_merchant_submissions_status ON merchant_submissions(status);
CREATE INDEX idx_merchant_submissions_created_at ON merchant_submissions(created_at);

CREATE INDEX idx_financial_institution_submissions_name ON financial_institution_submissions(financial_institution_name);
CREATE INDEX idx_financial_institution_submissions_status ON financial_institution_submissions(status);
CREATE INDEX idx_financial_institution_submissions_created_at ON financial_institution_submissions(created_at);

// Add indexes for consumer tables
CREATE INDEX idx_consumer_submissions_guid ON consumer_submissions(guid);
CREATE INDEX idx_consumer_submissions_name ON consumer_submissions(first_name, last_name);
CREATE INDEX idx_consumer_submissions_status ON consumer_submissions(status);
CREATE INDEX idx_consumer_submissions_created_at ON consumer_submissions(created_at);
CREATE INDEX idx_consumer_documents_submission_id ON consumer_documents(consumer_submission_id);

// Add indexes for agreement signature tables
CREATE INDEX idx_agreement_signatures_agreement_id ON agreement_signatures(agreement_id);
CREATE INDEX idx_agreement_signatures_user_id ON agreement_signatures(user_id);
CREATE INDEX idx_agreement_signatures_type ON agreement_signatures(agreement_type);
CREATE INDEX idx_agreement_signatures_status ON agreement_signatures(status);
CREATE INDEX idx_agreement_signatures_date ON agreement_signatures(signature_date);
CREATE INDEX idx_consumer_agreement_signatures_submission ON consumer_agreement_signatures(consumer_submission_id);
CREATE INDEX idx_consumer_agreement_signatures_agreement ON consumer_agreement_signatures(agreement_signature_id);
CREATE INDEX idx_merchant_agreement_signatures_submission ON merchant_agreement_signatures(merchant_submission_id);
CREATE INDEX idx_merchant_agreement_signatures_agreement ON merchant_agreement_signatures(agreement_signature_id);

ALTER TABLE education_submissions ADD CONSTRAINT education_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE education_submissions ADD CONSTRAINT education_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));
ALTER TABLE education_submissions ADD CONSTRAINT education_submissions_description_length_check CHECK (char_length(trim(ginicoe_help_description)) >= 10);

ALTER TABLE government_submissions ADD CONSTRAINT government_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE government_submissions ADD CONSTRAINT government_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));
ALTER TABLE government_submissions ADD CONSTRAINT government_submissions_description_length_check CHECK (char_length(trim(ginicoe_help_description)) >= 10);
ALTER TABLE government_submissions ADD CONSTRAINT government_submissions_job_title_check CHECK (job_title IN ('Chief', 'Director', 'Manager', 'Coordinator', 'Administrator', 'Other'));
ALTER TABLE government_submissions ADD CONSTRAINT government_submissions_priority_check CHECK (priority_level BETWEEN 1 AND 10);

ALTER TABLE health_submissions ADD CONSTRAINT health_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE health_submissions ADD CONSTRAINT health_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));
ALTER TABLE health_submissions ADD CONSTRAINT health_submissions_description_length_check CHECK (char_length(trim(ginicoe_help_description)) >= 10);
ALTER TABLE health_submissions ADD CONSTRAINT health_submissions_priority_check CHECK (priority_level BETWEEN 1 AND 10);

ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_description_length_check CHECK (char_length(trim(ginicoe_help_description)) >= 10);
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_priority_check CHECK (priority_level BETWEEN 1 AND 10);
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_tier_check CHECK ((tier1::int + tier2::int + tier3::int + tier4::int) = 1);
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_percentage_check CHECK (owner_percentage_ownership >= 0 AND owner_percentage_ownership <= 100);
ALTER TABLE merchant_submissions ADD CONSTRAINT merchant_submissions_pos_terminals_check CHECK (estimated_number_of_pos_terminals >= 1 AND estimated_number_of_pos_terminals <= 10000000);

ALTER TABLE financial_institution_submissions ADD CONSTRAINT financial_institution_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE financial_institution_submissions ADD CONSTRAINT financial_institution_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));
ALTER TABLE financial_institution_submissions ADD CONSTRAINT financial_institution_submissions_description_length_check CHECK (char_length(trim(ginicoe_help_description)) >= 10);
ALTER TABLE financial_institution_submissions ADD CONSTRAINT financial_institution_submissions_priority_check CHECK (priority_level BETWEEN 1 AND 10);

// Add constraints for consumer tables
ALTER TABLE consumer_submissions ADD CONSTRAINT consumer_submissions_recaptcha_score_check CHECK (recaptcha_score IS NULL OR (recaptcha_score >= 0.0 AND recaptcha_score <= 1.0));
ALTER TABLE consumer_submissions ADD CONSTRAINT consumer_submissions_status_check CHECK (status IN ('submitted', 'processing', 'under_review', 'approved', 'completed', 'rejected', 'cancelled', 'archived'));

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER education_submissions_updated_at_trigger
    BEFORE UPDATE ON education_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER government_submissions_updated_at_trigger
    BEFORE UPDATE ON government_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER health_submissions_updated_at_trigger
    BEFORE UPDATE ON health_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER merchant_submissions_updated_at_trigger
    BEFORE UPDATE ON merchant_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER financial_institution_submissions_updated_at_trigger
    BEFORE UPDATE ON financial_institution_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

// Add triggers for consumer tables
CREATE TRIGGER consumer_submissions_updated_at_trigger
    BEFORE UPDATE ON consumer_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER consumer_documents_updated_at_trigger
    BEFORE UPDATE ON consumer_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();