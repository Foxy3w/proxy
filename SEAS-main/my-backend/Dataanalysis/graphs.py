import pandas as pd
from pymongo import MongoClient
import matplotlib.pyplot as plt
import os

# MongoDB connection
MONGO_URI = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'
client = MongoClient(MONGO_URI)
db = client['esp32_data']

# Load data
readings = pd.DataFrame(list(db['readings'].find()))
rooms = pd.DataFrame(list(db['rooms'].find()))

# Preprocess
readings['timestamp'] = pd.to_datetime(readings['timestamp'])
readings['date'] = readings['timestamp'].dt.date
readings = readings.merge(rooms, on='room', suffixes=('', '_room'))
readings = readings.sort_values(by=['room', 'timestamp']).reset_index(drop=True)

# Output folder
output_folder = 'graphs'
os.makedirs(output_folder, exist_ok=True)

# Plot graphs by room and date
def plot_daily_parameter_trends(df):
    grouped = df.groupby(['room', 'date'])
    for (room, date), group in grouped:
        if group.empty:
            continue

        room_type = group['room_type'].iloc[0]
        print(f"Generating graphs for Room {room} on {date}, entries: {len(group)}")

        # Light vs Occupancy
        plt.figure(figsize=(8, 4))
        plt.plot(group['timestamp'], group['light'], color='blue', label='Light Level (lux)')
        for i in range(len(group)):
            if group['Occupancy'].iloc[i]:
                plt.axvspan(group['timestamp'].iloc[i],
                            group['timestamp'].iloc[i] + pd.Timedelta(minutes=15),
                            color='orange', alpha=0.3)
        plt.title(f"Room {room} - Light vs Occupancy on {date}")
        plt.xlabel("Time")
        plt.ylabel("Light (lux)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.legend()
        filename = f"{output_folder}/room_{room}_light_vs_occupancy_{date}.png"
        plt.savefig(filename)
        plt.close()

        # CO2 vs Occupancy
        plt.figure(figsize=(8, 4))
        plt.plot(group['timestamp'], group['CO2'], color='purple', label='CO₂ (ppm)')
        for i in range(len(group)):
            if group['Occupancy'].iloc[i]:
                plt.axvspan(group['timestamp'].iloc[i],
                            group['timestamp'].iloc[i] + pd.Timedelta(minutes=15),
                            color='orange', alpha=0.3)
        plt.title(f"Room {room} - CO₂ vs Occupancy on {date}")
        plt.xlabel("Time")
        plt.ylabel("CO₂ (ppm)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.legend()
        filename = f"{output_folder}/room_{room}_co2_vs_occupancy_{date}.png"
        plt.savefig(filename)
        plt.close()

        # Energy usage vs Occupancy
        group = group.copy()
        group['energy_delta'] = group['energy'].diff().fillna(0)
        plt.figure(figsize=(8, 4))
        plt.plot(group['timestamp'], group['energy_delta'], color='brown', label='Energy Δ (kWh)')
        for i in range(len(group)):
            if group['Occupancy'].iloc[i]:
                plt.axvspan(group['timestamp'].iloc[i],
                            group['timestamp'].iloc[i] + pd.Timedelta(minutes=15),
                            color='orange', alpha=0.3)
        plt.title(f"Room {room} - Energy Δ vs Occupancy on {date}")
        plt.xlabel("Time")
        plt.ylabel("Energy Δ (kWh)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.legend()
        filename = f"{output_folder}/room_{room}_energy_vs_occupancy_{date}.png"
        plt.savefig(filename)
        plt.close()

        # Temperature vs Occupancy
        plt.figure(figsize=(8, 4))
        plt.plot(group['timestamp'], group['temperature'], color='darkred', label='Temperature (°C)')
        for i in range(len(group)):
            if group['Occupancy'].iloc[i]:
                plt.axvspan(group['timestamp'].iloc[i],
                            group['timestamp'].iloc[i] + pd.Timedelta(minutes=15),
                            color='lightblue', alpha=0.3)
        plt.title(f"Room {room} - Temperature vs Occupancy on {date}")
        plt.xlabel("Time")
        plt.ylabel("Temperature (°C)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.legend()
        filename = f"{output_folder}/room_{room}_temperature_vs_occupancy_{date}.png"
        plt.savefig(filename)
        plt.close()

        # CO2 Accumulation Rate during Occupancy
        group = group.copy()
        group['co2_delta'] = group['CO2'].diff().fillna(0)
        plt.figure(figsize=(8, 4))
        plt.plot(group['timestamp'], group['co2_delta'], color='teal', label='CO₂ Δ (ppm)')
        for i in range(len(group)):
            if group['Occupancy'].iloc[i]:
                plt.axvspan(group['timestamp'].iloc[i],
                            group['timestamp'].iloc[i] + pd.Timedelta(minutes=15),
                            color='orange', alpha=0.3)
        plt.title(f"Room {room} - CO₂ Accumulation Rate on {date}")
        plt.xlabel("Time")
        plt.ylabel("Δ CO₂ (ppm)")
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.legend()
        filename = f"{output_folder}/room_{room}_co2_delta_{date}.png"
        plt.savefig(filename)
        plt.close()

# Multi-day humidity trend per room
for room, group in readings.groupby('room'):
    if group.empty:
        continue
    plt.figure(figsize=(10, 4))
    plt.plot(group['timestamp'], group['humidity'], marker='o', linestyle='-', color='blue')
    plt.title(f"Room {room} - Humidity Trend Over Time")
    plt.xlabel("Date & Time")
    plt.ylabel("Humidity (%)")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(f"{output_folder}/room_{room}_humidity_trend.png")
    plt.close()

# Run the function
plot_daily_parameter_trends(readings)
print("✅ All enhanced comparative graphs and trends generated in 'graphs/' folder.")
