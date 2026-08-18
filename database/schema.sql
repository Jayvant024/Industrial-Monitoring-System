CREATE DATABASE IF NOT EXISTS industrial_monitoring_system;

USE industrial_monitoring_system;

CREATE TABLE test (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);


CREATE DATABASE IF NOT EXISTS industrial_monitoring_system;
USE industrial_monitoring_system;

-- ===========================
-- ROLES
-- ===========================
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- DEPARTMENTS
-- ===========================
CREATE TABLE IF NOT EXISTS departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- USERS
-- ===========================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL,
    department_id INT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id),

    CONSTRAINT fk_user_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
);

-- ===========================
-- MACHINE CATEGORIES
-- ===========================
CREATE TABLE IF NOT EXISTS machine_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- MACHINES
-- ===========================
-- ===========================
-- MACHINES
-- ===========================
CREATE TABLE IF NOT EXISTS machines (
    machine_id INT AUTO_INCREMENT PRIMARY KEY,

    machine_code VARCHAR(50) NOT NULL UNIQUE,
    machine_name VARCHAR(150) NOT NULL,

    category_id INT NOT NULL,

    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,

    purchase_date DATE,
    installation_date DATE,
    warranty_expiry DATE,

    operating_hours INT DEFAULT 0,

    machine_health DECIMAL(5,2) DEFAULT 100.00,

    image_url VARCHAR(255),
    qr_code VARCHAR(255),

    location VARCHAR(150),

    status ENUM(
        'Running',
        'Stopped',
        'Maintenance',
        'Fault'
    ) DEFAULT 'Running',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_machine_category
        FOREIGN KEY (category_id)
        REFERENCES machine_categories(category_id)
);

-- ===========================
-- SENSOR TYPES
-- ===========================
CREATE TABLE IF NOT EXISTS sensor_types (
    sensor_type_id INT AUTO_INCREMENT PRIMARY KEY,

    sensor_name VARCHAR(100) NOT NULL UNIQUE,

    unit VARCHAR(20),

    description VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- MACHINE SENSORS
-- ===========================
CREATE TABLE IF NOT EXISTS machine_sensors (

    machine_sensor_id INT AUTO_INCREMENT PRIMARY KEY,

    machine_id INT NOT NULL,

    sensor_type_id INT NOT NULL,

    sensor_code VARCHAR(50) UNIQUE,

    sensor_name VARCHAR(100),

    installation_date DATE,

    status ENUM(
        'Active',
        'Inactive',
        'Faulty'
    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(machine_id)
        REFERENCES machines(machine_id),

    FOREIGN KEY(sensor_type_id)
        REFERENCES sensor_types(sensor_type_id)
);

-- ===========================
-- SENSOR THRESHOLDS
-- ===========================
CREATE TABLE IF NOT EXISTS sensor_thresholds (

    threshold_id INT AUTO_INCREMENT PRIMARY KEY,

    machine_sensor_id INT NOT NULL,

    min_value DECIMAL(10,2),

    max_value DECIMAL(10,2),

    warning_value DECIMAL(10,2),

    critical_value DECIMAL(10,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(machine_sensor_id)
        REFERENCES machine_sensors(machine_sensor_id)
);

-- ===========================
-- SENSOR READINGS
-- ===========================
CREATE TABLE IF NOT EXISTS sensor_readings (

    reading_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    machine_sensor_id INT NOT NULL,

    reading_value DECIMAL(10,2) NOT NULL,

    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(machine_sensor_id)
        REFERENCES machine_sensors(machine_sensor_id)
);

-- ===========================
-- MACHINE STATUS
-- ===========================
CREATE TABLE IF NOT EXISTS machine_status (

    status_id INT AUTO_INCREMENT PRIMARY KEY,

    machine_id INT NOT NULL,

    health_percentage DECIMAL(5,2) DEFAULT 100,

    current_status ENUM(
        'Running',
        'Stopped',
        'Maintenance',
        'Fault'
    ) DEFAULT 'Running',

    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY(machine_id)
        REFERENCES machines(machine_id)
);