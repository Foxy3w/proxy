from pymongo import MongoClient

# MongoDB connection URI
uri = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'
client = MongoClient(uri)

# Access database and collections
db = client['esp32_data']

# Collections to clear (exclude 'rooms')
collections_to_clear = ['readings', 'daily_summary', 'sensors']

# Delete all documents from each selected collection
for name in collections_to_clear:
    result = db[name].delete_many({})
    print(f"✅ Cleared {result.deleted_count} documents from '{name}'")
