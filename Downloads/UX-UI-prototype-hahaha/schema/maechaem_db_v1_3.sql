-- ============================================================
-- Maechaem DB — Version 1.3
-- Phase 1 | PostgreSQL + PostGIS
-- อัปเดต: UUID PK ทุก table, users, farmer_groups,
--          watershed_classes, tree_types, audit UUID FK,
--          survival_status BOOLEAN, flowering_status VARCHAR,
--          growth child tables แยก 6 กลุ่ม
-- ============================================================

-- ต้องเปิด extension ก่อน migrate
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- สำหรับ gen_random_uuid()

-- ============================================================
-- REFERENCE TABLES
-- ============================================================

CREATE TABLE users (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    username         VARCHAR(100)  NOT NULL UNIQUE,
    email            VARCHAR(255)  NOT NULL UNIQUE,
    password_hash    VARCHAR(255)  NOT NULL,
    role             VARCHAR(10)   NOT NULL CHECK (role IN ('admin', 'viewer')),
    is_active        BOOLEAN       NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ   DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   DEFAULT NOW(),
    -- nullable: user แรกยังไม่มี creator
    created_by       UUID,
    updated_by       UUID
);

-- ────────────────────────────────────────────────────────────

CREATE TABLE farmer_groups (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    group_number         SMALLINT      NOT NULL UNIQUE CHECK (group_number BETWEEN 1 AND 4),
    watershed_classes    VARCHAR(20)   NOT NULL,   -- e.g. '3,4,5' | '1,2'
    cabinet_period       VARCHAR(10)   NOT NULL CHECK (cabinet_period IN ('before', 'after')),
    planting_rule        TEXT          NOT NULL,
    created_at           TIMESTAMPTZ   DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   DEFAULT NOW(),
    created_by           UUID          REFERENCES users(id) ON DELETE SET NULL,
    updated_by           UUID          REFERENCES users(id) ON DELETE SET NULL
);

-- Seed data
INSERT INTO farmer_groups (group_number, watershed_classes, cabinet_period, planting_rule) VALUES
(1, '3,4,5', 'before', 'ไม่กำหนดจำนวนต้น'),
(2, '3,4,5', 'after',  '50% ของพื้นที่'),
(3, '1,2',   'before', '20 ต้น/ไร่ + มาตรการอนุรักษ์ดินและน้ำ หรือ 60 ต้น/ไร่'),
(4, '1,2',   'after',  '70 ต้น/ไร่ สัดส่วนไม้ป่า:ไม้ผล:ไม้โตเร็ว = 35:20:15');

-- ────────────────────────────────────────────────────────────

CREATE TABLE watershed_classes (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    class_number SMALLINT     NOT NULL UNIQUE CHECK (class_number BETWEEN 1 AND 5),
    description  TEXT,
    created_at   TIMESTAMPTZ  DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  DEFAULT NOW(),
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by   UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- Seed data
INSERT INTO watershed_classes (class_number, description) VALUES
(1, 'พื้นที่ต้นน้ำชั้น 1 — ควบคุมเข้มงวดที่สุด'),
(2, 'พื้นที่ต้นน้ำชั้น 2 — ควบคุมเข้มงวด'),
(3, 'พื้นที่ต้นน้ำชั้น 3 — ควบคุมปานกลาง'),
(4, 'พื้นที่ต้นน้ำชั้น 4 — ควบคุมน้อย'),
(5, 'พื้นที่ต้นน้ำชั้น 5 — ควบคุมน้อยที่สุด');

-- ────────────────────────────────────────────────────────────

CREATE TABLE tree_types (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    type_code     VARCHAR(20)  NOT NULL UNIQUE,  -- 'forest','rubber','fruit','bamboo','banana','herb'
    type_name_th  VARCHAR(50)  NOT NULL,
    created_at    TIMESTAMPTZ  DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  DEFAULT NOW(),
    created_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by    UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- Seed data
INSERT INTO tree_types (type_code, type_name_th) VALUES
('forest',  'ไม้ป่า'),
('rubber',  'ยางพารา'),
('fruit',   'ไม้ผล'),
('bamboo',  'ไผ่'),
('banana',  'กล้วย'),
('herb',    'สมุนไพร');

-- ────────────────────────────────────────────────────────────

CREATE TABLE provinces (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name_th        VARCHAR(100) NOT NULL,
    created_at     TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW(),
    created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by     UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE districts (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name_th        VARCHAR(100) NOT NULL,
    province_id    UUID         NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW(),
    created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by     UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE subdistricts (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name_th        VARCHAR(100) NOT NULL,
    district_id    UUID         NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ  DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  DEFAULT NOW(),
    created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by     UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE plots (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    plot_code            VARCHAR(4)   NOT NULL UNIQUE,  -- e.g. 'P01'
    plot_name            VARCHAR(100) NOT NULL,
    village              VARCHAR(100),
    subdistrict_id       UUID         REFERENCES subdistricts(id) ON DELETE SET NULL,
    district_id          UUID         REFERENCES districts(id) ON DELETE SET NULL,
    province_id          UUID         REFERENCES provinces(id) ON DELETE SET NULL,
    area_sqm             DECIMAL(10,2),
    area_rai             DECIMAL(8,4),  -- คำนวณที่ application layer: area_sqm / 1600
    farmer_group_id      UUID         NOT NULL REFERENCES farmer_groups(id) ON DELETE RESTRICT,
    watershed_class_id   UUID         REFERENCES watershed_classes(id) ON DELETE SET NULL,
    planting_month       DATE,          -- เก็บ วว/ดด/ปปปป โดย วัน = 01 เสมอ
    planting_objective   VARCHAR(100),
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  DEFAULT NOW(),
    created_by           UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by           UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────

CREATE TABLE species (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    species_code     VARCHAR(4)   NOT NULL UNIQUE,  -- e.g. 'A01', 'B14', 'C03'
    species_name_th  VARCHAR(100) NOT NULL,
    species_name_en  VARCHAR(100),
    species_name_sci VARCHAR(150),
    hex_color        CHAR(6),                       -- e.g. 'F94144' สำหรับ dashboard
    tree_type_id     UUID         NOT NULL REFERENCES tree_types(id) ON DELETE RESTRICT,
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────

CREATE TABLE trees (
    id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_code         VARCHAR(10)  NOT NULL UNIQUE,  -- e.g. 'P05A01045'
    plot_id           UUID         NOT NULL REFERENCES plots(id) ON DELETE RESTRICT,
    species_id        UUID         NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
    tree_type_id      UUID         NOT NULL REFERENCES tree_types(id) ON DELETE RESTRICT,
    planting_spacing  VARCHAR(10),                   -- e.g. '4x4'
    survival_status   BOOLEAN      NOT NULL DEFAULT true,  -- true=alive, false=dead
    is_replanted      BOOLEAN      DEFAULT false,
    replant_round     SMALLINT     DEFAULT 0,
    parent_tree_id    UUID         REFERENCES trees(id) ON DELETE SET NULL,
    created_at        TIMESTAMPTZ  DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  DEFAULT NOW(),
    created_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by        UUID         REFERENCES users(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────

CREATE TABLE growth_logs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    tree_id         UUID         NOT NULL REFERENCES trees(id) ON DELETE RESTRICT,
    measured_at     DATE         NOT NULL,
    recorder_name   VARCHAR(100),
    survival_status BOOLEAN      NOT NULL,  -- สถานะ ณ วันที่วัดรอบนี้
    is_flagged      BOOLEAN      DEFAULT false,
    flag_reason     VARCHAR(255),
    notes           VARCHAR(500),
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW(),
    created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE (tree_id, measured_at)
);

-- ============================================================
-- GROWTH CHILD TABLES (1-to-1 กับ growth_logs)
-- ============================================================

CREATE TABLE growth_forest (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    rcd_cm           DECIMAL(6,2),
    height_m         DECIMAL(5,2),
    flowering_status VARCHAR(10)  CHECK (flowering_status IN ('มี', 'ไม่มี')),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE growth_rubber (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    rcd_cm           DECIMAL(6,2),
    height_m         DECIMAL(5,2),
    flowering_status VARCHAR(10)  CHECK (flowering_status IN ('มี', 'ไม่มี')),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE growth_fruit (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    rcd_cm           DECIMAL(6,2),
    height_m         DECIMAL(5,2),
    flowering_status VARCHAR(10)  CHECK (flowering_status IN ('มี', 'ไม่มี')),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE growth_bamboo (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    culm_count       SMALLINT,
    rcd_1_cm         DECIMAL(6,2),
    rcd_2_cm         DECIMAL(6,2),
    rcd_3_cm         DECIMAL(6,2),
    height_m         DECIMAL(5,2),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE growth_banana (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    rcd_cm           DECIMAL(6,2),
    height_m         DECIMAL(5,2),
    sucker_count     SMALLINT,
    bunch_count      SMALLINT,
    hand_count       SMALLINT,
    price_per_hand   DECIMAL(8,2),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE growth_herb (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    growth_log_id    UUID         NOT NULL UNIQUE REFERENCES growth_logs(id) ON DELETE CASCADE,
    sample_plot_no   SMALLINT,
    clump_no         SMALLINT,
    clump_count      SMALLINT,
    new_shoot_count  SMALLINT,
    length_1_cm      DECIMAL(6,2),
    length_2_cm      DECIMAL(6,2),
    length_3_cm      DECIMAL(6,2),
    growth_rating    VARCHAR(10)  CHECK (growth_rating IN ('ดี', 'ปานกลาง', 'ไม่ดี')),
    price_per_kg     DECIMAL(8,2),
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       UUID         REFERENCES users(id) ON DELETE SET NULL,
    updated_by       UUID         REFERENCES users(id) ON DELETE SET NULL
);
