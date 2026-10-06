"""
VLAN NEXUS - Python Network Management & Inter-VLAN Routing Engine
FastAPI Backend Service with SQLite Persistence
"""

import sqlite3
import random
import time
import json
from typing import List, Optional, Union
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection, init_db, seed_default_data

app = FastAPI(
    title="VLAN NEXUS Network Management API",
    description="Python backend engine with SQLite persistence for VLAN segmentation, 802.1Q trunking, and Router-on-a-Stick Inter-VLAN routing.",
    version="2.5.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic Schemas
class VlanSchema(BaseModel):
    id: int
    name: str
    network: str
    subnetMask: str
    gateway: str
    description: str = ""
    color: str = "#3B82F6"
    activeDevicesCount: int = 0
    totalCapacity: int = 254
    status: str = "Active"

class DeviceSchema(BaseModel):
    id: str
    name: str
    type: str
    ipAddress: str
    macAddress: str
    vlanId: int
    switchPort: str
    gateway: str
    status: str = "Online"
    lastSeen: str = "Just now"

class SubinterfaceSchema(BaseModel):
    name: str
    vlanId: int
    vlanName: str
    encapsulation: str
    ipAddress: str
    subnetMask: str
    status: str = "UP"
    rxBytes: str = "12.4 MB"
    txBytes: str = "24.8 MB"

class AclRuleSchema(BaseModel):
    id: str
    sourceVlanId: Union[int, str]
    destinationVlanId: Union[int, str]
    protocol: str = "IP"
    port: str = "Any"
    action: str = "ALLOW"
    enabled: bool = True
    description: str = ""
    hitCount: int = 0

class PingRequest(BaseModel):
    sourceDeviceId: str
    destinationDeviceId: str
    protocol: str = "ICMP"
    packetSize: int = 64

# Helpers
def row_to_vlan(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "network": row["network"],
        "subnetMask": row["subnet_mask"],
        "gateway": row["gateway"],
        "description": row["description"],
        "color": row["color"],
        "activeDevicesCount": row["active_devices_count"],
        "totalCapacity": row["total_capacity"],
        "status": row["status"],
    }

def row_to_device(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "type": row["type"],
        "ipAddress": row["ip_address"],
        "macAddress": row["mac_address"],
        "vlanId": row["vlan_id"],
        "switchPort": row["switch_port"],
        "gateway": row["gateway"],
        "status": row["status"],
        "lastSeen": row["last_seen"],
    }

def row_to_subinterface(row):
    return {
        "name": row["name"],
        "vlanId": row["vlan_id"],
        "vlanName": row["vlan_name"],
        "encapsulation": row["encapsulation"],
        "ipAddress": row["ip_address"],
        "subnetMask": row["subnet_mask"],
        "status": row["status"],
        "rxBytes": row["rx_bytes"],
        "txBytes": row["tx_bytes"],
    }

def row_to_acl(row):
    src = row["source_vlan_id"]
    dst = row["destination_vlan_id"]
    return {
        "id": row["id"],
        "sourceVlanId": int(src) if src.isdigit() else src,
        "destinationVlanId": int(dst) if dst.isdigit() else dst,
        "protocol": row["protocol"],
        "port": row["port"],
        "action": row["action"],
        "enabled": bool(row["enabled"]),
        "description": row["description"],
        "hitCount": row["hit_count"],
    }

def row_to_log(row):
    return {
        "id": row["id"],
        "timestamp": row["timestamp"],
        "category": row["category"],
        "event": row["event_type"],
        "details": row["details"],
        "sourceIp": row["source_ip"],
        "destIp": row["dest_ip"],
        "vlanId": row["vlan_id"],
        "severity": row["severity"],
    }

# API Endpoints
@app.get("/")
def root():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM vlans")
    v_count = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM devices")
    d_count = c.fetchone()[0]
    conn.close()
    return {
        "system": "VLAN NEXUS Network Management System",
        "engine": "Python 3.11 / SQLite3 / FastAPI",
        "status": "Optimal",
        "database": "vlan_nexus.db",
        "active_vlans": v_count,
        "active_devices": d_count,
    }

# 1. VLANs CRUD
@app.get("/api/vlans")
def get_vlans():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM vlans ORDER BY id ASC")
    rows = c.fetchall()

    # Recalculate active device count for each VLAN from devices table
    result = []
    for r in rows:
        v_dict = row_to_vlan(r)
        c.execute("SELECT COUNT(*) FROM devices WHERE vlan_id = ? AND status = 'Online'", (r["id"],))
        v_dict["activeDevicesCount"] = c.fetchone()[0]
        result.append(v_dict)

    conn.close()
    return result

@app.post("/api/vlans")
def create_vlan(vlan: VlanSchema):
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO vlans VALUES (?,?,?,?,?,?,?,?,?,?)",
            (vlan.id, vlan.name, vlan.network, vlan.subnetMask, vlan.gateway, vlan.description, vlan.color, 0, vlan.totalCapacity, vlan.status)
        )
        # Also insert matching subinterface
        c.execute(
            "INSERT OR REPLACE INTO subinterfaces VALUES (?,?,?,?,?,?,?,?,?)",
            (f"G0/0.{vlan.id}", vlan.id, vlan.name, f"802.1Q {vlan.id}", vlan.gateway, vlan.subnetMask, 'UP', '0 KB', '0 KB')
        )
        # Log event
        now_str = time.strftime("%H:%M:%S")
        c.execute(
            "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
            (f"log-{int(time.time()*1000)}", now_str, 'VLAN', 'VLAN Created', f"Created VLAN {vlan.id} ({vlan.name}) - {vlan.network}", None, None, vlan.id, 'success')
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail=f"VLAN ID {vlan.id} already exists")
    conn.close()
    return vlan

@app.delete("/api/vlans/{vlan_id}")
def delete_vlan(vlan_id: int):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM vlans WHERE id = ?", (vlan_id,))
    c.execute("DELETE FROM devices WHERE vlan_id = ?", (vlan_id,))
    c.execute("DELETE FROM subinterfaces WHERE vlan_id = ?", (vlan_id,))
    now_str = time.strftime("%H:%M:%S")
    c.execute(
        "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
        (f"log-{int(time.time()*1000)}", now_str, 'VLAN', 'VLAN Deleted', f"Removed VLAN segment ID {vlan_id}", None, None, vlan_id, 'warning')
    )
    conn.commit()
    conn.close()
    return {"message": f"VLAN {vlan_id} deleted"}

# 2. Devices CRUD
@app.get("/api/devices")
def get_devices():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM devices ORDER BY id ASC")
    rows = c.fetchall()
    conn.close()
    return [row_to_device(r) for r in rows]

@app.post("/api/devices")
def create_device(dev: DeviceSchema):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO devices VALUES (?,?,?,?,?,?,?,?,?,?)",
        (dev.id, dev.name, dev.type, dev.ipAddress, dev.macAddress, dev.vlanId, dev.switchPort, dev.gateway, dev.status, dev.lastSeen)
    )
    now_str = time.strftime("%H:%M:%S")
    c.execute(
        "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
        (f"log-{int(time.time()*1000)}", now_str, 'DEVICE', 'Device Registered', f"Registered {dev.name} ({dev.ipAddress}) on port {dev.switchPort} (VLAN {dev.vlanId})", dev.ipAddress, None, dev.vlanId, 'info')
    )
    conn.commit()
    conn.close()
    return dev

@app.delete("/api/devices/{device_id}")
def delete_device(device_id: str):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM devices WHERE id = ?", (device_id,))
    row = c.fetchone()
    if row:
        dev_name = row["name"]
        c.execute("DELETE FROM devices WHERE id = ?", (device_id,))
        now_str = time.strftime("%H:%M:%S")
        c.execute(
            "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
            (f"log-{int(time.time()*1000)}", now_str, 'DEVICE', 'Device Removed', f"De-registered host {dev_name}", row["ip_address"], None, row["vlan_id"], 'warning')
        )
        conn.commit()
    conn.close()
    return {"message": f"Device {device_id} deleted"}

# 3. Subinterfaces
@app.get("/api/subinterfaces")
def get_subinterfaces():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM subinterfaces ORDER BY name ASC")
    rows = c.fetchall()
    conn.close()
    return [row_to_subinterface(r) for r in rows]

# 4. ACL Rules
@app.get("/api/acl")
def get_acl_rules():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM acl_rules ORDER BY id ASC")
    rows = c.fetchall()
    conn.close()
    return [row_to_acl(r) for r in rows]

# 5. Dynamic Dashboard Summary Stats API
@app.get("/api/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM vlans")
    total_vlans = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM devices")
    total_devices = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM devices WHERE status = 'Online'")
    online_devices = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM devices WHERE status = 'Offline'")
    offline_devices = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM subinterfaces WHERE status = 'UP'")
    active_routes = c.fetchone()[0]

    # Calculate VLAN Distribution
    c.execute("SELECT id, name, color FROM vlans ORDER BY id ASC")
    vlans_rows = c.fetchall()
    distribution = []
    for v in vlans_rows:
        c.execute("SELECT COUNT(*) FROM devices WHERE vlan_id = ?", (v["id"],))
        dev_count = c.fetchone()[0]
        percentage = round((dev_count / total_devices * 100), 1) if total_devices > 0 else 0
        distribution.append({
            "vlanId": v["id"],
            "name": v["name"],
            "color": v["color"],
            "count": dev_count,
            "percentage": percentage
        })

    health_percent = round((online_devices / total_devices * 100), 1) if total_devices > 0 else 100.0

    conn.close()
    return {
        "totalVlans": total_vlans,
        "totalDevices": total_devices,
        "onlineDevices": online_devices,
        "offlineDevices": offline_devices,
        "activeRoutes": active_routes,
        "networkHealth": health_percent,
        "vlanDistribution": distribution,
        "deviceStatus": {
            "online": online_devices,
            "offline": offline_devices,
            "onlineRate": health_percent
        }
    }

# 6. Interactive Network Simulator Ping Endpoint
@app.post("/api/ping")
def execute_ping(req: PingRequest):
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("SELECT * FROM devices WHERE id = ?", (req.sourceDeviceId,))
    src_row = c.fetchone()
    c.execute("SELECT * FROM devices WHERE id = ?", (req.destinationDeviceId,))
    dst_row = c.fetchone()

    if not src_row or not dst_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Source or destination device not found")

    src = row_to_device(src_row)
    dst = row_to_device(dst_row)

    is_same_vlan = src["vlanId"] == dst["vlanId"]
    now_time = time.strftime("%H:%M:%S")
    test_id = f"ping-{int(time.time()*1000)}"

    # 1. Check ACL Rules
    c.execute("SELECT * FROM acl_rules WHERE enabled = 1 ORDER BY id ASC")
    acl_rows = c.fetchall()

    matching_deny = None
    for r in acl_rows:
        rule = row_to_acl(r)
        if rule["action"] == "DENY":
            s_match = (rule["sourceVlanId"] == "ALL" or rule["sourceVlanId"] == src["vlanId"])
            d_match = (rule["destinationVlanId"] == "ALL" or rule["destinationVlanId"] == dst["vlanId"])
            if s_match and d_match:
                matching_deny = rule
                break

    if matching_deny:
        # Increment hit count in SQLite DB
        c.execute("UPDATE acl_rules SET hit_count = hit_count + 1 WHERE id = ?", (matching_deny["id"],))

        reason = f"PACKET BLOCKED — {matching_deny['id']}: {matching_deny['description']}"
        path_steps = [
            {"name": src["name"], "type": "SOURCE", "ip": src["ipAddress"], "detail": f"VLAN {src['vlanId']}"},
            {"name": "S1-SWITCH", "type": "SWITCH", "detail": f"Access Port {src['switchPort']}"},
            {"name": "802.1Q TRUNK", "type": "TRUNK", "detail": "Port Fa0/1"},
            {"name": f"R1-ROUTER (G0/0.{src['vlanId']})", "type": "ROUTER", "detail": f"{matching_deny['id']} DENY Applied"},
            {"name": dst["name"], "type": "DESTINATION", "ip": dst["ipAddress"], "detail": "Packet Blocked"},
        ]

        c.execute(
            "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
            (f"log-{int(time.time()*1000)}", now_time, 'ACL', 'ACL Policy Blocked', f"{matching_deny['id']} denied traffic from {src['name']} (VLAN {src['vlanId']}) to {dst['name']} (VLAN {dst['vlanId']})", src["ipAddress"], dst["ipAddress"], src["vlanId"], 'error')
        )
        conn.commit()
        conn.close()

        return {
            "id": test_id,
            "timestamp": now_time,
            "sourceDeviceName": src["name"],
            "sourceIp": src["ipAddress"],
            "sourceVlanId": src["vlanId"],
            "destinationDeviceName": dst["name"],
            "destinationIp": dst["ipAddress"],
            "destinationVlanId": dst["vlanId"],
            "protocol": req.protocol,
            "packetSize": req.packetSize,
            "status": "BLOCKED",
            "isSameVlan": is_same_vlan,
            "latencyMs": 0,
            "packetsSent": 4,
            "packetsReceived": 0,
            "packetLossPercent": 100,
            "failureReason": reason,
            "pathSteps": path_steps
        }

    # 2. Check Host Status
    if dst["status"] == "Offline":
        conn.close()
        return {
            "id": test_id,
            "timestamp": now_time,
            "sourceDeviceName": src["name"],
            "sourceIp": src["ipAddress"],
            "sourceVlanId": src["vlanId"],
            "destinationDeviceName": dst["name"],
            "destinationIp": dst["ipAddress"],
            "destinationVlanId": dst["vlanId"],
            "protocol": req.protocol,
            "packetSize": req.packetSize,
            "status": "FAILED",
            "isSameVlan": is_same_vlan,
            "latencyMs": 0,
            "packetsSent": 4,
            "packetsReceived": 0,
            "packetLossPercent": 100,
            "failureReason": f"Destination host {dst['name']} ({dst['ipAddress']}) is offline.",
            "pathSteps": [
                {"name": src["name"], "type": "SOURCE", "ip": src["ipAddress"]},
                {"name": "S1-SWITCH", "type": "SWITCH"},
                {"name": dst["name"], "type": "DESTINATION", "detail": "Host Offline"},
            ]
        }

    # 3. Successful Communication
    latency = random.randint(1, 2) if is_same_vlan else random.randint(3, 5)

    if is_same_vlan:
        path_steps = [
            {"name": src["name"], "type": "SOURCE", "ip": src["ipAddress"], "detail": f"VLAN {src['vlanId']} Host"},
            {"name": "S1-SWITCH", "type": "SWITCH", "detail": f"Port {src['switchPort']} -> Port {dst['switchPort']} (Direct L2)"},
            {"name": dst["name"], "type": "DESTINATION", "ip": dst["ipAddress"], "detail": f"VLAN {dst['vlanId']} Host"},
        ]
    else:
        path_steps = [
            {"name": src["name"], "type": "SOURCE", "ip": src["ipAddress"], "detail": f"VLAN {src['vlanId']} (Gateway: {src['gateway']})"},
            {"name": "S1-SWITCH", "type": "SWITCH", "detail": f"Access Port {src['switchPort']} -> Trunk Fa0/1"},
            {"name": f"802.1Q TRUNK", "type": "TRUNK", "detail": f"VLAN {src['vlanId']} Tagged Frame"},
            {"name": f"R1-ROUTER (G0/0.{src['vlanId']})", "type": "ROUTER", "detail": "802.1Q Tag Stripped & L3 Routed"},
            {"name": f"R1-ROUTER (G0/0.{dst['vlanId']})", "type": "ROUTER", "detail": f"802.1Q Tag {dst['vlanId']} Encapsulated"},
            {"name": "S1-SWITCH", "type": "SWITCH", "detail": f"Trunk Fa0/1 -> Access Port {dst['switchPort']}"},
            {"name": dst["name"], "type": "DESTINATION", "ip": dst["ipAddress"], "detail": f"VLAN {dst['vlanId']} Host"},
        ]

    c.execute(
        "INSERT INTO activity_logs VALUES (?,?,?,?,?,?,?,?,?)",
        (f"log-{int(time.time()*1000)}", now_time, 'ROUTING', 'Inter-VLAN Route Success', f"{src['name']} (VLAN {src['vlanId']}) -> R1-ROUTER -> {dst['name']} (VLAN {dst['vlanId']})", src["ipAddress"], dst["ipAddress"], src["vlanId"], 'success')
    )
    conn.commit()
    conn.close()

    return {
        "id": test_id,
        "timestamp": now_time,
        "sourceDeviceName": src["name"],
        "sourceIp": src["ipAddress"],
        "sourceVlanId": src["vlanId"],
        "destinationDeviceName": dst["name"],
        "destinationIp": dst["ipAddress"],
        "destinationVlanId": dst["vlanId"],
        "protocol": req.protocol,
        "packetSize": req.packetSize,
        "status": "SUCCESS",
        "isSameVlan": is_same_vlan,
        "latencyMs": latency,
        "packetsSent": 4,
        "packetsReceived": 4,
        "packetLossPercent": 0,
        "pathSteps": path_steps
    }

# 7. Audit Logs API
@app.get("/api/logs")
def get_logs():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT 100")
    rows = c.fetchall()
    conn.close()
    return [row_to_log(r) for r in rows]

# 8. Reset Database Endpoint
@app.post("/api/reset")
def reset_database():
    conn = get_db_connection()
    seed_default_data(conn)
    conn.close()
    return {"message": "Database reset to Cisco Packet Tracer default state"}
