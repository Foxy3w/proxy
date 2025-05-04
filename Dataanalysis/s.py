from pymongo import MongoClient
import pandas as pd
import json

# Load summary from JSON
summary_with_flags_df = pd.read_json("summary_with_flags.json")

# MongoDB connection
uri = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'
client = MongoClient(uri)

# Access the database and collection
db = client['esp32_data']
summary_col = db['daily_summary']

# Insert summary records
records = summary_with_flags_df.to_dict(orient="records")
summary_col.insert_many(records)

print("✅ Daily summaries inserted into MongoDB!")
