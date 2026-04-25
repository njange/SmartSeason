CREATE TABLE IF NOT EXISTS field_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES users(id),
  image_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_images_field_created_at
  ON field_images (field_id, created_at DESC);
