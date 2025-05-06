# energy_analysis_pipeline.py

from pymongo import MongoClient
import pandas as pd
from datetime import datetime

# Constants
BASELINE_KWH_PER_M3 = {
    "Bedroom": 0.21,
    "Living": 0.28,
    "Kitchen": 0.50,
    "Bathroom": 0.17,
    "Office": 0.50
}

ROOM_TYPE_LIMITS = {
    "Bedroom": {"temp": (22, 26), "humidity": (30, 60), "co2": 1000, "light": (100, 300)},
    "Living": {"temp": (23, 27), "humidity": (30, 60), "co2": 1000, "light": (150, 500)},
    "Kitchen": {"temp": (None, 32), "humidity": (30, 70), "co2": 1200, "light": (None, None)},
    "Bathroom": {"temp": (22, 26), "humidity": (40, 70), "co2": 1200, "light": (50, 200)},
    "Office": {"temp": (22, 25), "humidity": (30, 60), "co2": 800, "light": (300, 750)}
}

MONGO_URI = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'

# 1. Load data from MongoDB
def load_data():
    client = MongoClient(MONGO_URI)
    db = client['esp32_data']
    rooms = list(db['rooms'].find())
    readings = list(db['readings'].find())
    df_rooms = pd.DataFrame(rooms)
    df_readings = pd.DataFrame(readings)

    # Convert strings to proper types
    numeric_fields = ['temperature', 'humidity', 'energy', 'light', 'pressure', 'CO2']
    for field in numeric_fields:
        df_readings[field] = pd.to_numeric(df_readings[field], errors='coerce')

    df_readings['Occupancy'] = df_readings['Occupancy'].astype(str).str.lower().map({'true': True, 'false': False})
    df_readings['timestamp'] = pd.to_datetime(df_readings['timestamp'], errors='coerce')

    return df_readings, df_rooms, db

# 2. Analyze data with flags and metrics
def analyze_energy(df_readings, df_rooms, rate_per_kwh=0.30, fixed_goal=None):
    df = df_readings.merge(df_rooms, on="room", suffixes=("", "_room"))
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['date'] = df['timestamp'].dt.date

    summary = []

    for (room_id, date), group in df.groupby(['room', 'date']):
        group = group.sort_values('timestamp').reset_index(drop=True)
        room_type = group['room_type_room'].iloc[0]
        limits = ROOM_TYPE_LIMITS.get(room_type, ROOM_TYPE_LIMITS['Bedroom'])

        volume = group['width'].iloc[0] * group['length'].iloc[0] * group['height'].iloc[0]
        goal_kwh = fixed_goal if fixed_goal is not None else round(volume * BASELINE_KWH_PER_M3.get(room_type, 0.025), 2)

        group['delta'] = group['energy'].diff()
        deltas = group['delta'].dropna()
        clean_deltas = deltas[(deltas > 0) & (deltas < 3)]

        used = round(clean_deltas.sum(), 2)
        cost = round(used * rate_per_kwh, 2)
        occupancy_ratio = group['Occupancy'].mean()
        avg_temp = round(group['temperature'].mean(), 1)
        max_co2 = group['CO2'].max()
        avg_light = round(group['light'].mean(), 1)
        valid_readings = len(clean_deltas) + 1
        total_readings = len(group)
        dropped_readings = total_readings - valid_readings

        flags = []

        # Temperature compliance
        t_min, t_max = limits['temp']
        if t_min and group['temperature'].min() < t_min:
            flags.append(f"Temperature below {t_min}°C for {room_type} (SBC)")
        if t_max and group['temperature'].max() > t_max:
            flags.append(f"Temperature above {t_max}°C for {room_type} (SBC)")
        if group['temperature'].max() - group['temperature'].min() > 5:
            flags.append("[Comfort] Rapid temperature fluctuation (>5°C)")

        # Humidity compliance
        h_min, h_max = limits['humidity']
        if group['humidity'].min() < h_min or group['humidity'].max() > h_max:
            flags.append(f"Humidity out of range {h_min}-{h_max}% for {room_type} (SBC)")
        if group['humidity'].mean() > 65:
            flags.append("[Comfort] Consistently high humidity (>65%)")

        # CO2 compliance
        if max_co2 > limits['co2']:
            flags.append(f"CO₂ exceeded {limits['co2']} ppm limit for {room_type} (SBC)")
        if (group['CO2'] > 1000).any() and (group['Occupancy'] == False).all():
            flags.append("[Ventilation] High CO₂ despite zero occupancy")

        # Light compliance (if range is defined)
        l_min, l_max = limits['light']
        if l_min and l_max and ((group['light'] < l_min).any() or (group['light'] > l_max).any()) and (group['Occupancy'] == True).any():
            flags.append(f"[Comfort] Lighting outside comfort range ({l_min}-{l_max} lux) while occupied in {room_type}")

        # Energy & usage flags
        if occupancy_ratio < 0.2 and used > 0.5:
            flags.append("Energy waste while mostly unoccupied")
        if occupancy_ratio > 0 and used < 0.5:
            flags.append("Occupancy but no energy use")
        if used == 0:
            flags.append("[Anomaly] No energy usage recorded")

        # Data integrity flags
        if total_readings < 85:
            flags.append("Sensor data gap")
        if group['timestamp'].duplicated().any():
            flags.append("[Data] Duplicate timestamps found")
        if (group['delta'] > 20).any():
            flags.append("[Anomaly] Sudden spike in energy usage (Δ > 20 kWh)")

        summary.append({
            "room": room_id,
            "room_type": room_type,
            "date": str(date),
            "volume_m3": volume,
            "daily_goal_kwh": goal_kwh,
            "daily_energy_kwh": used,
            "daily_cost_sar": cost,
            "over_goal": used > goal_kwh,
            "occupancy_ratio": round(occupancy_ratio, 2),
            "avg_temperature": avg_temp,
            "max_CO2": max_co2,
            "avg_light": avg_light,
            "valid_readings": valid_readings,
            "dropped_readings": dropped_readings,
            "flags": flags
        })

    return pd.DataFrame(summary)

# 3. Save summary back to MongoDB
def save_summary_to_db(summary_df, db):
    records = summary_df.to_dict(orient="records")
    db['daily_summary'].insert_many(records)
    print("✅ Summary inserted into MongoDB.")

# 4. Main function
if __name__ == "__main__":
    readings, rooms, db = load_data()
    summary = analyze_energy(readings, rooms, fixed_goal=9)  # or None to auto-calc
    save_summary_to_db(summary, db)
    print(summary.head())
