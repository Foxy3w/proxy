import pandas as pd
from pymongo import MongoClient
from fpdf import FPDF
from datetime import datetime
import os
import matplotlib.pyplot as plt

MONGO_URI = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'

# Room-specific cost per kWh
RATE_PER_KWH_PER_ROOM = {
    "Bedroom": 0.30,
    "Living": 0.34,
    "Kitchen": 0.42,
    "Bathroom": 0.26,
    "Office": 0.38
}

client = MongoClient(MONGO_URI)
db = client['esp32_data']
readings = pd.DataFrame(list(db['readings'].find()))
rooms = pd.DataFrame(list(db['rooms'].find()))

# Prepare and clean data
readings['timestamp'] = pd.to_datetime(readings['timestamp'])
readings['hour'] = (readings['timestamp'] - readings['timestamp'].min()).dt.total_seconds() / 3600
readings['date'] = readings['timestamp'].dt.date
readings = readings.merge(rooms, on='room', suffixes=("", "_room"))
readings = readings.sort_values(by=['room', 'timestamp']).reset_index(drop=True)

# Helper: describe flag with duration, energy, and cost
def describe_flag(group, condition_fn, label, estimate_energy=True):
    flagged = group[condition_fn(group)]
    if flagged.empty:
        return None
    duration_min = len(flagged) * 15  # assuming 15 min per reading
    energy_loss = 0.0
    cost = 0.0
    if estimate_energy:
        energy_loss = flagged['energy'].diff().fillna(0)
        energy_loss = energy_loss[(energy_loss > 0) & (energy_loss < 3)].sum()
        room_type = group['room_type'].iloc[0]
        rate = RATE_PER_KWH_PER_ROOM.get(room_type, 0.30)
        cost = round(energy_loss * rate, 2)
    return {
        "label": label,
        "duration": duration_min,
        "energy": round(energy_loss, 2),
        "cost": cost
    }

# PDF Report Generator
class AuditPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'Smart Room-by-Room Audit Report', ln=1, align='C')
        self.ln(5)

    def room_section(self, date, room, room_type, flags):
        self.set_font('Arial', 'B', 11)
        self.cell(0, 10, f"Date: {date} - Room {room} ({room_type})", ln=1)
        if not flags:
            self.set_font('Arial', '', 10)
            self.multi_cell(0, 8, "No issues detected.")
        else:
            for flag in flags:
                self.set_font('Arial', 'B', 10)
                self.multi_cell(0, 8, f"- {flag['label']}")
                self.set_font('Arial', '', 10)
                if flag['duration'] != 'N/A':
                    self.multi_cell(0, 8, f"  - Detected for ~{flag['duration']} minutes")
                if flag['energy'] > 0:
                    self.multi_cell(0, 8, f"  - Estimated extra energy: {flag['energy']} kWh")
                if flag['cost'] > 0:
                    self.multi_cell(0, 8, f"  - Estimated cost: {flag['cost']} SAR")
        self.ln(5)

    def insert_graph(self, image_path):
        if os.path.exists(image_path):
            self.image(image_path, x=10, w=180)
            self.ln(10)

# Main: generate report
pdf = AuditPDF()
pdf.add_page()

graphs_to_add = []

for date in sorted(readings['date'].unique()):
    day_data = readings[readings['date'] == date]
    for room_id, group in day_data.groupby('room'):
        room_type = group['room_type'].iloc[0]
        flags = []

        # Flag: Lights on while unoccupied (relaxed threshold)
        flag = describe_flag(
            group,
            lambda df: (df['light'] > 100) & (df['Occupancy'] == False),
            "[Energy] Lights were on while unoccupied",
            estimate_energy=True
        )
        if flag: flags.append(flag)

        # Flag: High CO2 while unoccupied (relaxed threshold)
        flag = describe_flag(
            group,
            lambda df: (df['CO2'] > 800) & (df['Occupancy'] == False),
            "[Ventilation] High CO2 levels while unoccupied",
            estimate_energy=False
        )
        if flag: flags.append(flag)

        # Flag: Rapid temperature fluctuation (relaxed threshold)
        if group['temperature'].max() - group['temperature'].min() > 3:
            flags.append({
                "label": "[Comfort] Rapid temperature fluctuation (>3°C)",
                "duration": 'N/A',
                "energy": 0,
                "cost": 0.00
            })

        # Flag: Unoccupied but energy used
        flag = describe_flag(
            group,
            lambda df: (df['Occupancy'] == False) & (df['energy'].diff().fillna(0) > 0.05),
            "[Energy] Energy consumed while unoccupied",
            estimate_energy=True
        )
        if flag: flags.append(flag)

        # Flag: Occupied but no energy use
        if (group['Occupancy'] == True).any() and (group['energy'].diff().fillna(0) <= 0).all():
            flags.append({
                "label": "[Anomaly] Occupied but no energy consumption",
                "duration": 'N/A',
                "energy": 0,
                "cost": 0.00
            })

        # Flag: No energy usage recorded
        if (group['energy'].diff().fillna(0) <= 0).all():
            flags.append({
                "label": "[Anomaly] No energy usage recorded",
                "duration": 'N/A',
                "energy": 0,
                "cost": 0.00
            })

        # Flag: Sudden spike in energy usage
        if (group['energy'].diff() > 10).any():
            flags.append({
                "label": "[Anomaly] Sudden spike in energy usage (Δ > 10 kWh)",
                "duration": 'N/A',
                "energy": 0,
                "cost": 0.00
            })

        # Add section to PDF
        pdf.room_section(str(date), room_id, room_type, flags)

# === NEW CROSS-DAY GRAPHS ===
os.makedirs("graphs", exist_ok=True)
for room_id, group in readings.groupby('room'):
    plt.figure(figsize=(10, 4))
    plt.plot(group['hour'], group['light'], label='Light (lux)', color='blue')
    plt.fill_between(group['hour'], 0, group['light'], where=group['Occupancy'], color='orange', alpha=0.3, label='Occupied')
    plt.title(f"Room {room_id} - Light vs Occupancy Across Days")
    plt.xlabel("Hour")
    plt.ylabel("Light (lux)")
    plt.legend()
    path = f"graphs/room_{room_id}_crossday_light_vs_occupancy.png"
    plt.tight_layout()
    plt.savefig(path)
    plt.close()
    graphs_to_add.append(path)

# Add graphs to end of PDF
pdf.add_page()
pdf.set_font('Arial', 'B', 12)
pdf.cell(0, 10, 'Combined Summary Graphs', ln=1, align='C')
pdf.ln(5)
for graph in graphs_to_add:
    pdf.insert_graph(graph)

# Save PDF
output_path = os.path.join(os.getcwd(), "audit_report.pdf")
pdf.output(output_path)
print(f"✅ PDF report generated: {output_path}")
