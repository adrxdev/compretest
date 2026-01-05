
ALTER TABLE placement_drives 
ADD COLUMN IF NOT EXISTS about_company TEXT,
ADD COLUMN IF NOT EXISTS selection_process TEXT,
ADD COLUMN IF NOT EXISTS bond_details TEXT,
ADD COLUMN IF NOT EXISTS criteria_details TEXT;
