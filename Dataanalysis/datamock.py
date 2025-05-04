from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# MongoDB connection
uri = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'
client = MongoClient(uri)

# Access your collections
db = client['esp32_data']
readings_col = db['readings']

rooms = {
    "1": "Bedroom",
    "2": "Kitchen",
    "3": "Living"
}

# Simulation settings
start_time = datetime(2025, 4, 28, 0, 0, 0)
readings_per_day = 96  # every 15 minutes = 96 per day
days = 2

sensor_data = []

for room, rtype in rooms.items():
    base_kwh = 100.0
    for day in range(days):
        for i in range(readings_per_day):
            timestamp = start_time + timedelta(days=day, minutes=15 * i)
            base_kwh += random.uniform(0.1, 0.3)
            sensor_data.append({
                "room": room,
                "room_type": rtype,
                "temperature": round(random.uniform(22.0, 30.0), 1),
                "humidity": round(random.uniform(35.0, 65.0), 1),
                "energy": round(base_kwh, 2),
                "light": random.randint(100, 600),
                "pressure": random.randint(995, 1025),
                "CO2": random.randint(500, 1600),
                "Occupancy": random.choice([True, False]),
                "timestamp": timestamp
            })

# Insert to MongoDB
readings_col.insert_many(sensor_data)
print(f"✅ Inserted {len(sensor_data)} readings for rooms 1–3 across 2 days.")
