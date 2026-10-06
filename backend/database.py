"""
VLAN NEXUS - SQLite Database Storage Layer
Manages persistent storage for VLANs, Devices, Subinterfaces, ACL Rules, Connectivity Tests, and Logs.
"""

import sqlite3
import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "vlan_nexus.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. VLANs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vlans (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            network TEXT NOT NULL,
            subnet_mask TEXT NOT NULL,
            gateway TEXT NOT NULL,
            description TEXT,
            color TEXT NOT NULL,
            active_devices_count INTEGER DEFAULT 0,
            total_capacity INTEGER DEFAULT 254,
            status TEXT DEFAULT 'Active'
        )
    """)

    # 2. Devices Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            mac_address TEXT NOT NULL,
            vlan_id INTEGER NOT NULL,
            switch_port TEXT NOT NULL,
            gateway TEXT NOT NULL,
            status TEXT DEFAULT 'Online',
            last_seen TEXT DEFAULT 'Just now'
        )
    """)

    # 3. Router Subinterfaces Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subinterfaces (
            name TEXT PRIMARY KEY,
            vlan_id INTEGER NOT NULL,
            vlan_name TEXT NOT NULL,
            encapsulation TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            subnet_mask TEXT NOT NULL,
            status TEXT DEFAULT 'UP',
            rx_bytes TEXT DEFAULT '12.4 MB',
            tx_bytes TEXT DEFAULT '24.8 MB'
        )
    """)

    # 4. ACL Rules Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS acl_rules (
            id TEXT PRIMARY KEY,
            source_vlan_id TEXT NOT NULL,
            destination_vlan_id TEXT NOT NULL,
            protocol TEXT DEFAULT 'IP',
            port TEXT DEFAULT 'Any',
            action TEXT NOT NULL,
            enabled INTEGER DEFAULT 1,
            description TEXT,
            hit_count INTEGER DEFAULT 0
        )
    """)

    # 5. Connectivity Tests Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS connectivity_tests (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            source_device_id TEXT NOT NULL,
            source_name TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            source_vlan_id INTEGER NOT NULL,
            destination_device_id TEXT NOT NULL,
            destination_name TEXT NOT NULL,
            destination_ip TEXT NOT NULL,
            destination_vlan_id INTEGER NOT NULL,
            protocol TEXT DEFAULT 'ICMP',
            packet_size INTEGER DEFAULT 64,
            status TEXT NOT NULL,
            latency_ms INTEGER DEFAULT 0,
            packets_sent INTEGER DEFAULT 4,
            packets_received INTEGER DEFAULT 4,
            packet_loss_percent INTEGER DEFAULT 0,
            failure_reason TEXT,
            is_same_vlan INTEGER DEFAULT 0,
            path_steps_json TEXT
        )
    """)

    # 6. Activity Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            category TEXT NOT NULL,
            event_type TEXT NOT NULL,
            details TEXT NOT NULL,
            source_ip TEXT,
            dest_ip TEXT,
            vlan_id INTEGER,
            severity TEXT DEFAULT 'info'
        )
    """)

    conn.commit()

    # Seed Default Data if empty
    cursor.execute("SELECT COUNT(*) FROM vlans")
    if cursor.fetchone()[0] == 0:
        seed_default_data(conn)

    conn.close()

def seed_default_data(conn):
    cursor = conn.cursor()

    # Clear any old entries to ensure clean seed
    cursor.execute("DELETE FROM vlans")
    cursor.execute("DELETE FROM devices")
    cursor.execute("DELETE FROM subinterfaces")
    cursor.execute("DELETE FROM acl_rules")

    # Default VLANs
    vlans = [
        (10, 'STUDENTS', '192.168.10.0/24', '255.255.255.0', '192.168.10.1', 'Student workstation network segment', '#3B82F6', 2, 254, 'Active'),
        (20, 'FACULTY', '192.168.20.0/24', '255.255.255.0', '192.168.20.1', 'Faculty and academic staff segment', '#8B5CF6', 2, 254, 'Active'),
        (30, 'ADMINISTRATION', '192.168.30.0/24', '255.255.255.0', '192.168.30.1', 'Secure administration network segment', '#06B6D4', 2, 254, 'Active'),
    ]
    cursor.executemany("INSERT INTO vlans VALUES (?,?,?,?,?,?,?,?,?,?)", vlans)

    # Default Packet Tracer Devices (6 PCs)
    devices = [
        ('dev-101', 'Student-PC1', 'PC', '192.168.10.10', '00:50:79:66:68:01', 10, 'Fa0/2', '192.168.10.1', 'Online', 'Just now'),
        ('dev-102', 'Student-PC2', 'PC', '192.168.10.11', '00:50:79:66:68:02', 10, 'Fa0/3', '192.168.10.1', 'Online', 'Just now'),
        ('dev-201', 'Faculty-PC1', 'PC', '192.168.20.10', '00:50:79:77:68:01', 20, 'Fa0/4', '192.168.20.1', 'Online', 'Just now'),
        ('dev-202', 'Faculty-PC2', 'PC', '192.168.20.11', '00:50:79:77:68:02', 20, 'Fa0/5', '192.168.20.1', 'Online', 'Just now'),
        ('dev-301', 'Admin-PC1', 'PC', '192.168.30.10', '00:50:79:88:68:01', 30, 'Fa0/6', '192.168.30.1', 'Online', 'Just now'),
        ('dev-302', 'Admin-PC2', 'PC', '192.168.30.11', '00:50:79:88:68:02', 30, 'Fa0/7', '192.168.30.1', 'Online', 'Just now'),
    ]
    cursor.executemany("INSERT INTO devices VALUES (?,?,?,?,?,?,?,?,?,?)", devices)

    # Subinterfaces (R1-ROUTER)
    subinterfaces = [
        ('G0/0.10', 10, 'STUDENTS', '802.1Q 10', '192.168.10.1', '255.255.255.0', 'UP', '14.2 MB', '28.6 MB'),
        ('G0/0.20', 20, 'FACULTY', '802.1Q 20', '192.168.20.1', '255.255.255.0', 'UP', '42.8 MB', '51.3 MB'),
        ('G0/0.30', 30, 'ADMINISTRATION', '802.1Q 30', '192.168.30.1', '255.255.255.0', 'UP', '89.1 MB', '112.4 MB'),
    ]
    cursor.executemany("INSERT INTO subinterfaces VALUES (?,?,?,?,?,?,?,?,?)", subinterfaces)

    # Default ACL Rules
    acl_rules = [
        ('ACL-001', '10', '20', 'ICMP', 'Any', 'ALLOW', 1, 'Allow Students to communicate with Faculty', 142),
        ('ACL-002', '10', '30', 'IP', 'Any', 'DENY', 1, 'Block Students from Administration', 89),
        ('ACL-003', '20', '30', 'IP', 'Any', 'ALLOW', 1, 'Allow Faculty access to Administration', 264),
        ('ACL-004', '30', 'ALL', 'IP', 'Any', 'ALLOW', 1, 'Allow Administration access to all segments', 512),
    ]
    cursor.executemany("INSERT INTO acl_rules VALUES (?,?,?,?,?,?,?,?,?)", acl_rules)

    # Initial Audit Logs
    now_str = time.strftime("%H:%M:%S")
    logs = [
        ('log-101', now_str, 'ROUTING', 'Inter-VLAN Route Used', 'Packet routed via G0/0.10 -> G0/0.20 subinterfaces', '192.168.10.10', '192.168.20.10', 10, 'success'),
        ('log-102', now_str, 'ACL', 'ACL Policy Match (Blocked)', 'ACL-002 denied traffic from Student-PC1 (192.168.10.10) to Admin-PC1 (192.168.30.10)', '192.168.10.10', '192.168.30.10', 10, 'error'),
        ('log-103', now_str, 'SYSTEM', 'ICMP Ping Test Success', 'Student-PC1 (192.168.10.10) -> Faculty-PC1 (192.168.20.10) (0% loss, 4ms)', '192.168.10.10', '192.168.20.10', 10, 'info'),
        ('log-104', now_str, 'DEVICE', 'Device Connected', 'Student-PC1 (192.168.10.10) link state changed to UP on Fa0/2', '192.168.10.10', None, 10, 'info'),
    ]
    cursor.executemany("INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)", logs)

    conn.commit()

if __name__ == "__main__":
    init_db()
    print("SQLite database initialized successfully at:", DB_PATH)
