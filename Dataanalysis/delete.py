from pymongo import MongoClient

# MongoDB connection URI
uri = 'mongodb+srv://esp32user:mKtHATiPPLFExcU4@seas.mp7gflp.mongodb.net/esp32_data?retryWrites=true&w=majority&appName=Seas'
client = MongoClient(uri)

# Choose the database and collection
db = client['esp32_data']
collection = db['readings']  # Change to your target collection

# Delete all documents
result = collection.delete_many({})
print(f"✅ Deleted {result.deleted_count} documents from 'readings' collection.")
